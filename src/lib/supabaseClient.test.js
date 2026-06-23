import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('supabaseClient auth helpers', () => {
  let signOut;
  let supabase;
  let consoleWarnMock;
  let consoleErrorMock;

  beforeEach(() => {
    vi.resetModules();
    consoleWarnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnMock.mockRestore();
    consoleErrorMock.mockRestore();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  describe('signOut', () => {
    it('calls supabase.auth.signOut when initialized', async () => {
      // Stub env variables to trigger createClient path
      vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
      vi.stubGlobal('import.meta', { env: { VITE_SUPABASE_URL: 'http://localhost', VITE_SUPABASE_ANON_KEY: 'test-key' } });

      const mockSignOut = vi.fn().mockResolvedValue({ error: null });

      vi.doMock('@supabase/supabase-js', () => {
        return {
          createClient: vi.fn(() => ({
            auth: {
              signOut: mockSignOut,
            },
          }))
        };
      });

      const clientModule = await import('./supabaseClient.js');
      signOut = clientModule.signOut;
      supabase = clientModule.supabase;

      await signOut();
      expect(mockSignOut).toHaveBeenCalled();
    });

    it('returns error if supabase is not initialized', async () => {
      // Clear env vars to make createClient skip and fallback to null
      vi.stubEnv('VITE_SUPABASE_URL', '');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
      vi.stubGlobal('import.meta', { env: {} });

      const clientModule = await import('./supabaseClient.js');
      signOut = clientModule.signOut;
      supabase = clientModule.supabase;

      expect(supabase).toBeNull();

      const result = await signOut();
      expect(result).toEqual({ error: 'Supabase not configured' });
      expect(consoleWarnMock).toHaveBeenCalledWith('[Auth] Supabase не инициализирован. Добавьте ключи в .env');
    });
  });
});
