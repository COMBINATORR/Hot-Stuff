import { vi, describe, it, expect, beforeEach } from 'vitest';

const invokeMock = vi.fn();

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      auth: {
        signInWithOAuth: vi.fn(),
        signOut: vi.fn(),
      },
      functions: {
        invoke: invokeMock,
      }
    }))
  };
});

// Mock process.env / import.meta.env
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
vi.stubGlobal('import.meta', {
  env: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-key'
  }
});

const { createKaspiPayment, calculateYandexDelivery } = await import('./supabaseClient.js');

describe('Supabase Edge Function helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createKaspiPayment', () => {
    it('should return data when invocation is successful', async () => {
      const mockData = { id: 'payment-123' };
      invokeMock.mockResolvedValueOnce({ data: mockData, error: null });

      const payload = { amount: 1000 };
      const result = await createKaspiPayment(payload);

      expect(invokeMock).toHaveBeenCalledWith('kaspi-pay', { body: payload });
      expect(result).toEqual(mockData);
    });

    it('should throw error when invocation fails', async () => {
      const mockError = new Error('Function failed');
      invokeMock.mockResolvedValueOnce({ data: null, error: mockError });

      const payload = { amount: 1000 };
      await expect(createKaspiPayment(payload)).rejects.toThrow('Function failed');
    });
  });

  describe('calculateYandexDelivery', () => {
    it('should return data when invocation is successful', async () => {
      const mockData = { price: 500 };
      invokeMock.mockResolvedValueOnce({ data: mockData, error: null });

      const payload = { address: 'Test str' };
      const result = await calculateYandexDelivery(payload);

      expect(invokeMock).toHaveBeenCalledWith('yandex-delivery', { body: payload });
      expect(result).toEqual(mockData);
    });

    it('should throw error when invocation fails', async () => {
      const mockError = new Error('Delivery calculation failed');
      invokeMock.mockResolvedValueOnce({ data: null, error: mockError });

      const payload = { address: 'Test str' };
      await expect(calculateYandexDelivery(payload)).rejects.toThrow('Delivery calculation failed');
    });
  });
});
