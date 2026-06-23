import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// We need to mock createClient before importing supabaseClient
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null })
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: {}, error: null })
    }
  }))
}));

describe('supabaseClient auth helpers', () => {
  let supabaseClientModule;
  let consoleWarnMock;
  let createClientMock;

  beforeEach(async () => {
    vi.resetModules();
    consoleWarnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const supabaseJs = await import('@supabase/supabase-js');
    createClientMock = supabaseJs.createClient;
    createClientMock.mockClear();

    // Setup proper env mock for successful initialization
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test-project.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
    vi.stubGlobal('import.meta', {
      env: {
        VITE_SUPABASE_URL: 'https://test-project.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'test-anon-key'
      }
    });

    supabaseClientModule = await import('../supabaseClient.js');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  describe('when Supabase is properly initialized', () => {
    it('signInWithGoogle calls signInWithOAuth with provider google', async () => {
      const { signInWithGoogle, supabase } = supabaseClientModule;
      await signInWithGoogle();

      expect(supabase).not.toBeNull();
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({ provider: 'google' });
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledTimes(1);
    });

    it('signInWithApple calls signInWithOAuth with provider apple', async () => {
      const { signInWithApple, supabase } = supabaseClientModule;
      await signInWithApple();

      expect(supabase).not.toBeNull();
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({ provider: 'apple' });
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledTimes(1);
    });

    it('signInWithYandex calls signInWithOAuth with custom provider and correct options', async () => {
      const { signInWithYandex, supabase } = supabaseClientModule;
      await signInWithYandex();

      expect(supabase).not.toBeNull();
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'custom:yandex',
        options: {
          scopes: 'login:email login:info login:avatar login:birthday login:default_phone'
        }
      });
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledTimes(1);
    });

    it('signOut calls auth.signOut', async () => {
        const { signOut, supabase } = supabaseClientModule;
        await signOut();
        expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('authGuard behavior when Supabase is NOT initialized', () => {
    beforeEach(async () => {
      vi.resetModules();

      // Stub env to empty to trigger fallback logic
      vi.stubEnv('VITE_SUPABASE_URL', '');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
      vi.stubGlobal('import.meta', {
        env: {
          VITE_SUPABASE_URL: '',
          VITE_SUPABASE_ANON_KEY: ''
        }
      });

      supabaseClientModule = await import('../supabaseClient.js');
    });

    it('returns error object and warns if Supabase is null when calling auth helpers', async () => {
      const { signInWithApple, supabase } = supabaseClientModule;

      expect(supabase).toBeNull();

      const result = await signInWithApple();

      expect(result).toEqual({ error: 'Supabase not configured' });
      expect(consoleWarnMock).toHaveBeenCalledWith('[Auth] Supabase не инициализирован. Добавьте ключи в .env');
    });
  });
});
