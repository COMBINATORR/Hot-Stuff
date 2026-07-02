
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ dummyClient: true }))
}));

describe('Supabase Client Initialization', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();

    // Default valid mock environment variables
    vi.stubEnv('VITE_SUPABASE_URL', 'https://valid-url.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'valid-anon-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should initialize client when valid environment variables are provided', async () => {
    const { supabase } = await import('./supabase.js');

    expect(createClient).toHaveBeenCalledWith(
      'https://valid-url.supabase.co',
      'valid-anon-key',
      expect.objectContaining({
        auth: expect.objectContaining({
          persistSession: true,
          autoRefreshToken: true,
        })
      })
    );
    expect(supabase).toEqual({ dummyClient: true });
  });

  it('should return null and warn when environment variables are missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { supabase } = await import('./supabase.js');

    expect(warnSpy).toHaveBeenCalledWith(
      '[Supabase] Подключение не настроено. Пожалуйста, добавьте реальные VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в файл .env.local'
    );
    expect(createClient).not.toHaveBeenCalled();
    expect(supabase).toBeNull();

    warnSpy.mockRestore();
  });

  it('should return null and warn when environment variables contain placeholder values', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'your-project-id.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'your-anon-public-key');

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { supabase } = await import('./supabase.js');

    expect(warnSpy).toHaveBeenCalledWith(
      '[Supabase] Подключение не настроено. Пожалуйста, добавьте реальные VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в файл .env.local'
    );
    expect(createClient).not.toHaveBeenCalled();
    expect(supabase).toBeNull();

    warnSpy.mockRestore();
  });
});
