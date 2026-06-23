import { describe, it, expect, vi, beforeEach } from 'vitest';

// We must use mock functions that can be updated or tracked easily
const mockSignInWithOAuth = vi.fn();
const mockSignOut = vi.fn();
const mockFunctionsInvoke = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
    },
    functions: {
      invoke: mockFunctionsInvoke,
    }
  }))
}));

describe('supabaseClient helpers', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  describe('signInWithYandex', () => {
    it('calls signInWithOAuth with correct Yandex provider and options when configured', async () => {
      // Stub global process.env or import.meta variables depending on the runner.
      // Since it's vite, using vi.stubEnv usually works for VITE_ prefixed vars because
      // Vite replaces them. But to be safe and adhere to memory instructions:
      vi.stubGlobal('import.meta', {
        env: {
          VITE_SUPABASE_URL: 'https://test.supabase.co',
          VITE_SUPABASE_ANON_KEY: 'test-anon-key',
        }
      });
      vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

      const supabaseClient = await import('./supabaseClient');

      mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

      await supabaseClient.signInWithYandex();

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'custom:yandex',
        options: {
          scopes: 'login:email login:info login:avatar'
        }
      });
      expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
    });

    it('returns an error if Supabase client is not configured', async () => {
      // Ensure the test cleans up the stub
      vi.unstubAllEnvs();
      vi.unstubAllGlobals();
      // Set to undefined to ensure failure branch
      vi.stubGlobal('import.meta', { env: {} });

      const supabaseClient = await import('./supabaseClient');

      const result = await supabaseClient.signInWithYandex();

      expect(result).toEqual({ error: 'Supabase not configured' });
    });
  });

  describe('signInWithGoogle', () => {
    it('calls signInWithOAuth with correct Google provider', async () => {
      vi.stubGlobal('import.meta', {
        env: {
          VITE_SUPABASE_URL: 'https://test.supabase.co',
          VITE_SUPABASE_ANON_KEY: 'test-anon-key',
        }
      });
      vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

      const supabaseClient = await import('./supabaseClient');
      mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

      await supabaseClient.signInWithGoogle();

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google'
      });
      expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
    });
  });

  describe('signInWithApple', () => {
    it('calls signInWithOAuth with correct Apple provider', async () => {
      vi.stubGlobal('import.meta', {
        env: {
          VITE_SUPABASE_URL: 'https://test.supabase.co',
          VITE_SUPABASE_ANON_KEY: 'test-anon-key',
        }
      });
      vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

      const supabaseClient = await import('./supabaseClient');
      mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

      await supabaseClient.signInWithApple();

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'apple'
      });
      expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
    });
  });

  describe('signOut', () => {
    it('calls signOut on the supabase client', async () => {
      vi.stubGlobal('import.meta', {
        env: {
          VITE_SUPABASE_URL: 'https://test.supabase.co',
          VITE_SUPABASE_ANON_KEY: 'test-anon-key',
        }
      });
      vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

      const supabaseClient = await import('./supabaseClient');
      mockSignOut.mockResolvedValue({ error: null });

      await supabaseClient.signOut();

      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });
});
