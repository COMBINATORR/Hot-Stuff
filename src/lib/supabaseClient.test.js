import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the createClient from @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    functions: {
      invoke: vi.fn()
    },
    auth: {
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    }
  }))
}));

let calculateYandexDelivery;
let createKaspiPayment;
let supabase;

describe('supabaseClient', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
    vi.stubGlobal('import.meta', { env: { VITE_SUPABASE_URL: 'https://test.supabase.co', VITE_SUPABASE_ANON_KEY: 'test-key' } });

    const module = await import('./supabaseClient');
    calculateYandexDelivery = module.calculateYandexDelivery;
    createKaspiPayment = module.createKaspiPayment;
    supabase = module.supabase;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateYandexDelivery', () => {
    it('throws an error if supabase.functions.invoke returns an error', async () => {
      const mockError = new Error('Yandex delivery failed');
      supabase.functions.invoke.mockResolvedValue({ data: null, error: mockError });

      const payload = { test: 123 };
      await expect(calculateYandexDelivery(payload)).rejects.toThrow('Yandex delivery failed');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('yandex-delivery', { body: payload });
    });

    it('returns data on success', async () => {
      const mockData = { price: 1000 };
      supabase.functions.invoke.mockResolvedValue({ data: mockData, error: null });

      const payload = { test: 123 };
      const result = await calculateYandexDelivery(payload);

      expect(result).toEqual(mockData);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('yandex-delivery', { body: payload });
    });
  });

  describe('createKaspiPayment', () => {
    it('throws an error if supabase.functions.invoke returns an error', async () => {
      const mockError = new Error('Kaspi payment failed');
      supabase.functions.invoke.mockResolvedValue({ data: null, error: mockError });

      const payload = { amount: 1000 };
      await expect(createKaspiPayment(payload)).rejects.toThrow('Kaspi payment failed');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('kaspi-pay', { body: payload });
    });

    it('returns data on success', async () => {
      const mockData = { url: 'https://pay.kaspi.kz' };
      supabase.functions.invoke.mockResolvedValue({ data: mockData, error: null });

      const payload = { amount: 1000 };
      const result = await createKaspiPayment(payload);

      expect(result).toEqual(mockData);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('kaspi-pay', { body: payload });
    });
  });
});
