import { describe, it, expect, vi, beforeEach } from 'vitest';

// Must be defined before importing the actual module because Vite handles import.meta.env at module load
vi.stubGlobal('import.meta', {
  env: {
    VITE_SUPABASE_URL: 'http://localhost:54321',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key'
  }
});

import { createKaspiPayment, calculateYandexDelivery, supabase } from './supabaseClient';

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      auth: {
        signInWithOAuth: vi.fn(),
        signOut: vi.fn(),
      },
      functions: {
        invoke: vi.fn(),
      }
    }))
  };
});

describe('supabaseClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createKaspiPayment', () => {
    it('throws error when invoke returns an error', async () => {
      const mockError = new Error('Payment failed');
      supabase.functions.invoke.mockResolvedValue({ data: null, error: mockError });

      await expect(createKaspiPayment({ amount: 100 })).rejects.toThrow('Payment failed');
      expect(supabase.functions.invoke).toHaveBeenCalledWith('kaspi-pay', { body: { amount: 100 } });
    });

    it('returns data when invoke is successful', async () => {
      supabase.functions.invoke.mockResolvedValue({ data: { success: true }, error: null });

      const result = await createKaspiPayment({ amount: 100 });
      expect(result).toEqual({ success: true });
    });
  });

  describe('calculateYandexDelivery', () => {
    it('throws error when invoke returns an error', async () => {
      const mockError = new Error('Delivery calculation failed');
      supabase.functions.invoke.mockResolvedValue({ data: null, error: mockError });

      await expect(calculateYandexDelivery({ weight: 5 })).rejects.toThrow('Delivery calculation failed');
      expect(supabase.functions.invoke).toHaveBeenCalledWith('yandex-delivery', { body: { weight: 5 } });
    });

    it('returns data when invoke is successful', async () => {
      supabase.functions.invoke.mockResolvedValue({ data: { cost: 500 }, error: null });

      const result = await calculateYandexDelivery({ weight: 5 });
      expect(result).toEqual({ cost: 500 });
    });
  });
});
