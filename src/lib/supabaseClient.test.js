import { describe, it, expect, vi, beforeEach } from 'vitest';

// Set environment variables for Vite/Vitest
vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost:54321');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubGlobal('import.meta', {
  env: {
    VITE_SUPABASE_URL: 'http://localhost:54321',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key'
  }
});

const mockInvoke = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    functions: {
      invoke: mockInvoke
    },
    auth: {
      signInWithOAuth: vi.fn(),
      signOut: vi.fn()
    }
  }))
}));

describe('supabaseClient edge functions', () => {
  let calculateYandexDelivery;
  let createKaspiPayment;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Reset the stub before importing to ensure standard behavior for other tests
    vi.stubGlobal('import.meta', {
      env: {
        VITE_SUPABASE_URL: 'http://localhost:54321',
        VITE_SUPABASE_ANON_KEY: 'test-anon-key'
      }
    });

    const module = await import('./supabaseClient.js');
    calculateYandexDelivery = module.calculateYandexDelivery;
    createKaspiPayment = module.createKaspiPayment;
  });

  describe('calculateYandexDelivery', () => {
    it('should invoke the yandex-delivery edge function with the provided payload', async () => {
      const mockData = { price: 1500, status: 'ok' };
      mockInvoke.mockResolvedValueOnce({ data: mockData, error: null });

      const payload = { address: 'Almaty, Abay 1', weight: 2.5 };
      const result = await calculateYandexDelivery(payload);

      expect(mockInvoke).toHaveBeenCalledWith('yandex-delivery', { body: payload });
      expect(result).toEqual(mockData);
    });

    it('should throw an error if the edge function invocation fails', async () => {
      const mockError = new Error('Yandex API Error');
      mockInvoke.mockResolvedValueOnce({ data: null, error: mockError });

      const payload = { address: 'Invalid Address' };
      await expect(calculateYandexDelivery(payload)).rejects.toThrow('Yandex API Error');

      expect(mockInvoke).toHaveBeenCalledWith('yandex-delivery', { body: payload });
    });
  });

  describe('createKaspiPayment', () => {
    it('should invoke the kaspi-pay edge function with the provided payload', async () => {
      const mockData = { paymentUrl: 'https://kaspi.kz/pay/123' };
      mockInvoke.mockResolvedValueOnce({ data: mockData, error: null });

      const payload = { amount: 5000, orderId: 'ORDER-123' };
      const result = await createKaspiPayment(payload);

      expect(mockInvoke).toHaveBeenCalledWith('kaspi-pay', { body: payload });
      expect(result).toEqual(mockData);
    });

    it('should throw an error if the edge function invocation fails', async () => {
      const mockError = new Error('Payment gateway unavailable');
      mockInvoke.mockResolvedValueOnce({ data: null, error: mockError });

      const payload = { amount: 5000 };
      await expect(createKaspiPayment(payload)).rejects.toThrow('Payment gateway unavailable');

      expect(mockInvoke).toHaveBeenCalledWith('kaspi-pay', { body: payload });
    });
  });
});
