import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../telegram-auth.js';

describe('Telegram Auth API Handler', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      method: 'POST',
      headers: {
        origin: 'http://localhost:3000',
      },
      body: {},
    };

    mockRes = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      end: vi.fn(),
    };

    vi.unstubAllEnvs();
  });

  it('should handle missing telegramData', async () => {
    mockReq.body = {};

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing Telegram data or hash' });
  });

  it('should handle missing telegramData.hash', async () => {
    mockReq.body = { telegramData: { id: 123 } }; // missing hash

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing Telegram data or hash' });
  });

  it('should return 405 for unsupported methods', async () => {
    mockReq.method = 'GET';

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(405);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('should return 200 and end for OPTIONS requests', async () => {
    mockReq.method = 'OPTIONS';

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.end).toHaveBeenCalled();
  });

  it('should return 500 when botToken is missing', async () => {
    mockReq.body = { telegramData: { hash: 'some-hash' } };

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Server configuration error' });
  });

  it('should return 500 when botToken is invalid', async () => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', 'invalid-token');
    mockReq.body = { telegramData: { hash: 'some-hash' } };

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Server configuration error' });
  });
});
