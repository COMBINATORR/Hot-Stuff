import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockInvoke = vi.fn();

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn((url, key) => {
      return {
        functions: {
          invoke: mockInvoke,
        },
        auth: {
          signInWithOAuth: vi.fn(),
          signOut: vi.fn(),
        }
      };
    })
  };
});

describe('supabaseClient edge functions', () => {
  let createKaspiPayment, calculateYandexDelivery;

  describe('createKaspiPayment', () => {
    it('successfully invokes kaspi-pay edge function and returns data', async () => {
      vi.resetModules();
      vi.clearAllMocks();
      // Ensure the test env has process.env explicitly for this dynamic import!
      vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost:54321');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
      vi.stubGlobal('import.meta', {
        env: {
          VITE_SUPABASE_URL: 'http://localhost:54321',
          VITE_SUPABASE_ANON_KEY: 'test-key',
        }
      });
      const module = await import('./supabaseClient.js');

      const mockData = { invoiceId: '12345' };
      mockInvoke.mockResolvedValueOnce({ data: mockData, error: null });

      const payload = { amount: 100, orderId: 'O-1' };
      const result = await module.createKaspiPayment(payload);

      expect(result).toEqual(mockData);
      expect(mockInvoke).toHaveBeenCalledWith('kaspi-pay', { body: payload });
    });

    it('throws an error if edge function invocation fails', async () => {
      vi.resetModules();
      vi.clearAllMocks();
      vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost:54321');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
      vi.stubGlobal('import.meta', {
        env: {
          VITE_SUPABASE_URL: 'http://localhost:54321',
          VITE_SUPABASE_ANON_KEY: 'test-key',
        }
      });
      const module = await import('./supabaseClient.js');

      const mockError = new Error('Function failed');
      mockInvoke.mockResolvedValueOnce({ data: null, error: mockError });

      const payload = { amount: 100 };
      await expect(module.createKaspiPayment(payload)).rejects.toThrow('Function failed');
      expect(mockInvoke).toHaveBeenCalledWith('kaspi-pay', { body: payload });
    });
  });

  describe('calculateYandexDelivery', () => {
    it('successfully invokes yandex-delivery edge function and returns data', async () => {
      vi.resetModules();
      vi.clearAllMocks();
      vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost:54321');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
      vi.stubGlobal('import.meta', {
        env: {
          VITE_SUPABASE_URL: 'http://localhost:54321',
          VITE_SUPABASE_ANON_KEY: 'test-key',
        }
      });
      const module = await import('./supabaseClient.js');

      const mockData = { price: 500 };
      mockInvoke.mockResolvedValueOnce({ data: mockData, error: null });

      const payload = { address: 'Main St 1' };
      const result = await module.calculateYandexDelivery(payload);

      expect(result).toEqual(mockData);
      expect(mockInvoke).toHaveBeenCalledWith('yandex-delivery', { body: payload });
    });

    it('throws an error if edge function invocation fails', async () => {
      vi.resetModules();
      vi.clearAllMocks();
      vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost:54321');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
      vi.stubGlobal('import.meta', {
        env: {
          VITE_SUPABASE_URL: 'http://localhost:54321',
          VITE_SUPABASE_ANON_KEY: 'test-key',
        }
      });
      const module = await import('./supabaseClient.js');

      const mockError = new Error('Delivery calculation failed');
      mockInvoke.mockResolvedValueOnce({ data: null, error: mockError });

      const payload = { address: 'Main St 1' };
      await expect(module.calculateYandexDelivery(payload)).rejects.toThrow('Delivery calculation failed');
      expect(mockInvoke).toHaveBeenCalledWith('yandex-delivery', { body: payload });
    });
  });
});

describe('When Supabase is not configured', () => {

  it('returns error object when createKaspiPayment is called', async () => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    vi.stubGlobal('import.meta', { env: {} });
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const module = await import('./supabaseClient.js');

    const result = await module.createKaspiPayment({ amount: 100 });
    expect(result).toEqual({ error: 'Supabase not configured' });

    consoleSpy.mockRestore();
  });

  it('returns error object when calculateYandexDelivery is called', async () => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    vi.stubGlobal('import.meta', { env: {} });
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const module = await import('./supabaseClient.js');

    const result = await module.calculateYandexDelivery({ address: 'Main St 1' });
    expect(result).toEqual({ error: 'Supabase not configured' });

    consoleSpy.mockRestore();
  });
});
