import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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
  let consoleWarnMock;
  let consoleErrorMock;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    consoleWarnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnMock.mockRestore();
    consoleErrorMock.mockRestore();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const stubEnvConfigured = () => {
    vi.stubGlobal('import.meta', {
      env: {
        VITE_SUPABASE_URL: 'https://test.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'test-anon-key',
      }
    });
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
  };

  const stubEnvUnconfigured = () => {
    vi.stubGlobal('import.meta', { env: {} });
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
  };


  describe('Initialization errors', () => {
    it('catches createClient errors and sets supabase to null', async () => {
      stubEnvConfigured();

      const supabaseJs = await import('@supabase/supabase-js');
      supabaseJs.createClient.mockImplementationOnce(() => {
        throw new Error('Test createClient error');
      });

      const supabaseClient = await import('./supabaseClient');

      expect(supabaseClient.supabase).toBeNull();
      expect(consoleErrorMock).toHaveBeenCalledWith(
        '[Supabase] Ошибка инициализации клиента:',
        expect.any(Error)
      );
    });
  });

  describe('signInWithYandex', () => {
    it('calls signInWithOAuth with correct Yandex provider and options when configured', async () => {
      stubEnvConfigured();
      const supabaseClient = await import('./supabaseClient');
      mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

      await supabaseClient.signInWithYandex();

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'custom:yandex',
        options: {
          scopes: 'login:email login:info login:avatar login:birthday login:default_phone'
        }
      });
      expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
    });

    it('returns an error if Supabase client is not configured', async () => {
      stubEnvUnconfigured();
      const supabaseClient = await import('./supabaseClient');

      const result = await supabaseClient.signInWithYandex();

      expect(result).toEqual({ error: 'Supabase not configured' });
      expect(consoleWarnMock).toHaveBeenCalledWith('[Auth] Supabase не инициализирован. Добавьте ключи в .env');
    });
  });

  describe('signInWithGoogle', () => {
    it('calls signInWithOAuth with correct Google provider', async () => {
      stubEnvConfigured();
      const supabaseClient = await import('./supabaseClient');
      mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

      await supabaseClient.signInWithGoogle();

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google'
      });
      expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
    });

    it('returns an error if Supabase client is not configured', async () => {
      stubEnvUnconfigured();
      const supabaseClient = await import('./supabaseClient');

      const result = await supabaseClient.signInWithGoogle();

      expect(result).toEqual({ error: 'Supabase not configured' });
    });
  });

  describe('signInWithApple', () => {
    it('calls signInWithOAuth with correct Apple provider', async () => {
      stubEnvConfigured();
      const supabaseClient = await import('./supabaseClient');
      mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

      await supabaseClient.signInWithApple();

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'apple'
      });
      expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
    });

    it('returns an error if Supabase client is not configured', async () => {
      stubEnvUnconfigured();
      const supabaseClient = await import('./supabaseClient');

      const result = await supabaseClient.signInWithApple();

      expect(result).toEqual({ error: 'Supabase not configured' });
    });
  });

  describe('signOut', () => {
    it('calls signOut on the supabase client', async () => {
      stubEnvConfigured();
      const supabaseClient = await import('./supabaseClient');
      mockSignOut.mockResolvedValue({ error: null });

      await supabaseClient.signOut();

      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it('returns error if supabase is not initialized', async () => {
      stubEnvUnconfigured();
      const supabaseClient = await import('./supabaseClient');

      const result = await supabaseClient.signOut();
      expect(result).toEqual({ error: 'Supabase not configured' });
    });
  });

  describe('createKaspiPayment', () => {
    it('invokes kaspi-pay edge function with payload', async () => {
      stubEnvConfigured();
      const supabaseClient = await import('./supabaseClient');
      mockFunctionsInvoke.mockResolvedValue({ data: { status: 'ok' }, error: null });

      const result = await supabaseClient.createKaspiPayment({ amount: 100 });
      expect(mockFunctionsInvoke).toHaveBeenCalledWith('kaspi-payment', { body: { amount: 100 } });
      expect(result).toEqual({ status: 'ok' });
    });

    it('returns error if supabase is not initialized', async () => {
      stubEnvUnconfigured();
      const supabaseClient = await import('./supabaseClient');

      const result = await supabaseClient.createKaspiPayment({ amount: 100 });
      expect(result).toEqual({ error: 'Supabase not configured' });
    });

    it('throws error if edge function returns error', async () => {
      stubEnvConfigured();
      const supabaseClient = await import('./supabaseClient');
      mockFunctionsInvoke.mockResolvedValue({ data: null, error: new Error('Network error') });

      await expect(supabaseClient.createKaspiPayment({ amount: 100 })).rejects.toThrow('Network error');
    });
    it('throws error with accurate payload handling if edge function returns error', async () => {
      stubEnvConfigured();
      const supabaseClient = await import('./supabaseClient');
      const mockError = new Error('Accurate mock error');
      mockFunctionsInvoke.mockResolvedValue({ data: null, error: mockError });

      const testPayload = { amount: 150 };
      await expect(supabaseClient.createKaspiPayment(testPayload)).rejects.toThrow('Accurate mock error');
      expect(mockFunctionsInvoke).toHaveBeenCalledWith('kaspi-payment', { body: testPayload });
    });
  });

  describe('calculateYandexDelivery', () => {
    it('invokes yandex-delivery edge function with payload', async () => {
      stubEnvConfigured();
      const supabaseClient = await import('./supabaseClient');
      mockFunctionsInvoke.mockResolvedValue({ data: { price: 500 }, error: null });

      const result = await supabaseClient.calculateYandexDelivery({ address: 'test' });
      expect(mockFunctionsInvoke).toHaveBeenCalledWith('yandex-delivery', { body: { address: 'test' } });
      expect(result).toEqual({ price: 500 });
    });

    it('returns error if supabase is not initialized', async () => {
      stubEnvUnconfigured();
      const supabaseClient = await import('./supabaseClient');

      const result = await supabaseClient.calculateYandexDelivery({ address: 'test' });
      expect(result).toEqual({ error: 'Supabase not configured' });
    });

    it('throws error if edge function returns error', async () => {
      stubEnvConfigured();
      const supabaseClient = await import('./supabaseClient');
      mockFunctionsInvoke.mockResolvedValue({ data: null, error: new Error('API error') });

      await expect(supabaseClient.calculateYandexDelivery({ address: 'test' })).rejects.toThrow('API error');
    });

    it('throws error with accurate payload handling if edge function returns error', async () => {
      stubEnvConfigured();
      const supabaseClient = await import('./supabaseClient');
      const mockError = new Error('Accurate mock error');
      mockFunctionsInvoke.mockResolvedValue({ data: null, error: mockError });

      const testPayload = { address: '123 Fake St', weight: 5 };
      await expect(supabaseClient.calculateYandexDelivery(testPayload)).rejects.toThrow('Accurate mock error');
      expect(mockFunctionsInvoke).toHaveBeenCalledWith('yandex-delivery', { body: testPayload });
    });
  });
});
