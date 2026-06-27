import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

// Use vi.hoisted to ensure these are available when vi.mock is hoisted
const {
  mockMaybeSingle, mockEq, mockSelect, mockFrom,
  mockUpdateUserById, mockCreateUser, mockGenerateLink,
  mockCreateClient
} = vi.hoisted(() => {
  const mockMaybeSingle = vi.fn();
  const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));

  const mockUpdateUserById = vi.fn();
  const mockCreateUser = vi.fn();
  const mockGenerateLink = vi.fn();

  const mockCreateClient = vi.fn(() => ({
    from: mockFrom,
    auth: {
      admin: {
        updateUserById: mockUpdateUserById,
        createUser: mockCreateUser,
        generateLink: mockGenerateLink
      }
    }
  }));

  return {
    mockMaybeSingle, mockEq, mockSelect, mockFrom,
    mockUpdateUserById, mockCreateUser, mockGenerateLink,
    mockCreateClient
  };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient
}));

// Import the handler dynamically to allow env var changes to take effect if necessary
// But since the handler is ES module and uses `process.env` at runtime, we can just import it.
import handler from '../telegram-auth.js';

describe('telegram-auth API handler', () => {
  let req;
  let res;
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules(); // clears the cache
    process.env = { ...OLD_ENV }; // Make a copy

    // Default valid env variables
    process.env.TELEGRAM_BOT_TOKEN = '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';
    process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

    req = {
      method: 'POST',
      headers: {
        origin: 'http://localhost:3000'
      },
      body: {}
    };

    res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      end: vi.fn()
    };

    // Reset mocks
    mockMaybeSingle.mockReset();
    mockUpdateUserById.mockReset();
    mockCreateUser.mockReset();
    mockGenerateLink.mockReset();
    mockCreateClient.mockClear();
    mockFrom.mockClear();
    mockSelect.mockClear();
    mockEq.mockClear();
  });

  afterEach(() => {
    process.env = OLD_ENV; // Restore old environment
    vi.clearAllMocks();
  });

  // Helper to generate valid Telegram data and hash
  const generateValidTelegramData = () => {
    const data = {
      id: 123456789,
      first_name: 'John',
      last_name: 'Doe',
      username: 'johndoe',
      photo_url: 'https://example.com/photo.jpg',
      auth_date: Math.floor(Date.now() / 1000)
    };

    const checkString = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join('\n');

    const secretKey = crypto.createHash('sha256').update(process.env.TELEGRAM_BOT_TOKEN).digest();
    const hash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

    return { ...data, hash };
  };

  it('should handle OPTIONS request and return 200 with CORS headers', async () => {
    req.method = 'OPTIONS';
    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Credentials', true);
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://localhost:3000');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalled();
  });


  it('should fallback to default origin if the origin is not allowed', async () => {
    req.method = 'OPTIONS';
    req.headers.origin = 'http://malicious-site.com';
    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Credentials', true);
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://localhost:3000');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalled();
  });

  it('should return 405 if method is not POST', async () => {
    req.method = 'GET';
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('should return 400 if telegramData or hash is missing', async () => {
    req.body = { telegramData: { id: 123 } }; // missing hash
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing Telegram data or hash' });

    req.body = {}; // missing telegramData completely
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 500 if TELEGRAM_BOT_TOKEN is missing or invalid', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'invalid_token';
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    req.body = { telegramData: { id: 123, hash: 'somehash' } };
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Server configuration error' });
    expect(consoleSpy).toHaveBeenCalledWith('[Telegram Auth] Invalid or missing TELEGRAM_BOT_TOKEN.');

    consoleSpy.mockRestore();
  });

  it('should return 401 if data integrity check fails (invalid hash)', async () => {
    const validData = generateValidTelegramData();
    validData.hash = 'invalidhash123'; // Corrupt the hash

    req.body = { telegramData: validData };
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Data integrity check failed.' });
  });

  it('should return 401 if authentication data is expired', async () => {
    const validData = generateValidTelegramData();
    // Set auth_date to 25 hours ago
    validData.auth_date = Math.floor(Date.now() / 1000) - (25 * 3600);

    // Recompute hash because we changed auth_date
    const { hash: oldHash, ...dataWithoutHash } = validData;
    const checkString = Object.keys(dataWithoutHash).sort().map(k => `${k}=${dataWithoutHash[k]}`).join('\n');
    const secretKey = crypto.createHash('sha256').update(process.env.TELEGRAM_BOT_TOKEN).digest();
    validData.hash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

    req.body = { telegramData: validData };
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication data has expired' });
  });

  it('should return 500 if Supabase URL or Service Role Key is missing', async () => {
    delete process.env.VITE_SUPABASE_URL;
    const validData = generateValidTelegramData();
    req.body = { telegramData: validData };

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Supabase URL or Service Role Key not configured on server' });
  });

  it('should create a new user if profile does not exist and return magic link', async () => {
    const validData = generateValidTelegramData();
    req.body = { telegramData: validData }; // Removing untrusted origin from test

    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockCreateUser.mockResolvedValue({ data: { user: { id: 'new-user-id' } }, error: null });
    mockGenerateLink.mockResolvedValue({
      data: { properties: { action_link: 'https://magic-link' } },
      error: null
    });

    await handler(req, res);

    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockCreateUser).toHaveBeenCalledWith({
      email: `tg_${validData.id}@hotstuffplay.com`,
      email_confirm: true,
      user_metadata: {
        full_name: 'John Doe',
        avatar_url: validData.photo_url,
        telegram_id: validData.id,
        telegram_username: validData.username
      }
    });
    expect(mockUpdateUserById).not.toHaveBeenCalled();
    expect(mockGenerateLink).toHaveBeenCalledWith({
      type: 'magiclink',
      email: `tg_${validData.id}@hotstuffplay.com`,
      options: {
        redirectTo: 'https://test.supabase.co/auth/v1/callback'
      }
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, action_link: 'https://magic-link' });
  });

  it('should update existing user if profile exists and return magic link', async () => {
    const validData = generateValidTelegramData();
    req.body = { telegramData: validData }; // no redirectTo provided

    mockMaybeSingle.mockResolvedValue({ data: { id: 'existing-user-id' }, error: null });
    mockUpdateUserById.mockResolvedValue({ data: { user: { id: 'existing-user-id' } }, error: null });
    mockGenerateLink.mockResolvedValue({
      data: { properties: { action_link: 'https://magic-link-2' } },
      error: null
    });

    await handler(req, res);

    expect(mockUpdateUserById).toHaveBeenCalledWith('existing-user-id', {
      user_metadata: {
        full_name: 'John Doe',
        avatar_url: validData.photo_url,
        telegram_id: validData.id,
        telegram_username: validData.username
      }
    });
    expect(mockCreateUser).not.toHaveBeenCalled();
    expect(mockGenerateLink).toHaveBeenCalledWith({
      type: 'magiclink',
      email: `tg_${validData.id}@hotstuffplay.com`,
      options: {
        redirectTo: 'https://test.supabase.co/auth/v1/callback' // Fallback
      }
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, action_link: 'https://magic-link-2' });
  });


  it('should allow redirectTo if origin is trusted', async () => {
    process.env.ALLOWED_ORIGINS = 'https://example.com';
    const validData = generateValidTelegramData();
    req.body = { telegramData: validData, redirectTo: 'https://example.com/callback?foo=bar' };

    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockCreateUser.mockResolvedValue({ data: { user: { id: 'new-user-id' } }, error: null });
    mockGenerateLink.mockResolvedValue({
      data: { properties: { action_link: 'https://magic-link' } },
      error: null
    });

    await handler(req, res);

    expect(mockGenerateLink).toHaveBeenCalledWith({
      type: 'magiclink',
      email: `tg_${validData.id}@hotstuffplay.com`,
      options: {
        redirectTo: 'https://example.com/callback?foo=bar'
      }
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should ignore redirectTo if origin is NOT trusted', async () => {
    process.env.ALLOWED_ORIGINS = 'https://example.com';
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const validData = generateValidTelegramData();
    req.body = { telegramData: validData, redirectTo: 'https://evil.com/phishing' };

    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockCreateUser.mockResolvedValue({ data: { user: { id: 'new-user-id' } }, error: null });
    mockGenerateLink.mockResolvedValue({
      data: { properties: { action_link: 'https://magic-link' } },
      error: null
    });

    await handler(req, res);

    expect(consoleSpy).toHaveBeenCalledWith('[Telegram Auth] Blocked redirect to untrusted origin: https://evil.com');
    expect(mockGenerateLink).toHaveBeenCalledWith({
      type: 'magiclink',
      email: `tg_${validData.id}@hotstuffplay.com`,
      options: {
        redirectTo: 'https://test.supabase.co/auth/v1/callback' // Fallback to safe default
      }
    });

    expect(res.status).toHaveBeenCalledWith(200);
    consoleSpy.mockRestore();
  });

  it('should ignore redirectTo if it is an invalid URL', async () => {
    process.env.ALLOWED_ORIGINS = 'https://example.com';
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const validData = generateValidTelegramData();
    req.body = { telegramData: validData, redirectTo: 'not-a-valid-url' };

    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockCreateUser.mockResolvedValue({ data: { user: { id: 'new-user-id' } }, error: null });
    mockGenerateLink.mockResolvedValue({
      data: { properties: { action_link: 'https://magic-link' } },
      error: null
    });

    await handler(req, res);

    expect(consoleSpy).toHaveBeenCalledWith('[Telegram Auth] Invalid redirectTo URL provided');
    expect(mockGenerateLink).toHaveBeenCalledWith({
      type: 'magiclink',
      email: `tg_${validData.id}@hotstuffplay.com`,
      options: {
        redirectTo: 'https://test.supabase.co/auth/v1/callback' // Fallback to safe default
      }
    });

    expect(res.status).toHaveBeenCalledWith(200);
    consoleSpy.mockRestore();
  });

  it('should handle Supabase errors gracefully without leaking details', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const validData = generateValidTelegramData();
    req.body = { telegramData: validData };

    // Simulate a DB error
    mockMaybeSingle.mockResolvedValue({ data: null, error: { message: 'Database failure', code: 'XYZ' } });

    await handler(req, res);

    expect(consoleSpy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error during authentication' });

    consoleSpy.mockRestore();
  });
});
