import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as supabaseModule from '@supabase/supabase-js';

// Mock the createClient from supabase-js
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

describe('supabaseClient', () => {
  beforeEach(() => {
    // Reset modules to ensure a fresh import of supabaseClient for each test
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  describe('Uninitialized state (no env vars)', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_SUPABASE_URL', '');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
      // Some versions of vitest might need this as well
      vi.stubGlobal('import.meta', { env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' } });
    });

    it('should return error object when calling signInWithGoogle', async () => {
      const { signInWithGoogle, supabase } = await import('./supabaseClient.js');
      expect(supabase).toBeNull();

      const result = await signInWithGoogle();
      expect(result).toEqual({ error: 'Supabase not configured' });
    });

    it('should return error object when calling signInWithApple', async () => {
      const { signInWithApple } = await import('./supabaseClient.js');
      const result = await signInWithApple();
      expect(result).toEqual({ error: 'Supabase not configured' });
    });

    it('should return error object when calling signInWithYandex', async () => {
      const { signInWithYandex } = await import('./supabaseClient.js');
      const result = await signInWithYandex();
      expect(result).toEqual({ error: 'Supabase not configured' });
    });
  });

  describe('Initialized state (with env vars)', () => {
    let mockSignInWithOAuth;
    let mockSupabaseClient;

    beforeEach(() => {
      // Setup env vars
      vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
      vi.stubGlobal('import.meta', {
        env: {
          VITE_SUPABASE_URL: 'https://test.supabase.co',
          VITE_SUPABASE_ANON_KEY: 'test-anon-key',
        },
      });

      // Setup the mock supabase client
      mockSignInWithOAuth = vi.fn().mockResolvedValue({ data: {}, error: null });
      mockSupabaseClient = {
        auth: {
          signInWithOAuth: mockSignInWithOAuth,
        },
      };

      // Ensure createClient returns our mock
      supabaseModule.createClient.mockReturnValue(mockSupabaseClient);
    });

    it('should call supabase.auth.signInWithOAuth with google provider', async () => {
      const { signInWithGoogle, supabase } = await import('./supabaseClient.js');

      expect(supabase).not.toBeNull();

      await signInWithGoogle();

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({ provider: 'google' });
      expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
    });

    it('should call supabase.auth.signInWithOAuth with apple provider', async () => {
      const { signInWithApple } = await import('./supabaseClient.js');

      await signInWithApple();

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({ provider: 'apple' });
      expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
    });

    it('should call supabase.auth.signInWithOAuth with yandex custom provider and scopes', async () => {
      const { signInWithYandex } = await import('./supabaseClient.js');

      await signInWithYandex();

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'custom:yandex',
        options: {
          scopes: 'login:email login:info login:avatar login:birthday login:default_phone'
        }
      });
      expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
    });
  });
});
