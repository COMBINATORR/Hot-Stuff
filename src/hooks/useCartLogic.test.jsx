import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useCartLogic } from './useCartLogic';
import { supabase } from '../lib/supabase';

// Mock react-router-dom
const navigateMock = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('useCartLogic', () => {
  let alertSpy;
  let consoleSpy;

  beforeEach(() => {
    vi.useFakeTimers();
    navigateMock.mockClear();
    supabase.functions.invoke.mockClear();
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Clean up JSDOM window location mock if needed
    delete window.location;
    window.location = { href: '' };
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const defaultProps = {
    items: [],
    setItems: vi.fn(),
    onClose: vi.fn(),
  };

  const sampleItems = [
    { id: '1', variant: 'A', price: 10000, qty: 2 },
    { id: '2', variant: 'B', price: 5000, qty: 1 }
  ]; // subtotal = 25000

  it('calculates initial totals without promo correctly', () => {
    const { result } = renderHook(() => useCartLogic({ ...defaultProps, items: sampleItems }));

    expect(result.current.subtotal).toBe(25000);
    // FREE_SHIPPING_THRESHOLD is 30000. 25000/30000 * 100 = 83.333...
    expect(result.current.progressPercent).toBeCloseTo(83.33, 1);
    expect(result.current.discountAmount).toBe(0);
    expect(result.current.finalTotal).toBe(25000);
  });

  it('handles item quantity updates (handleUpdateQty)', () => {
    const setItemsMock = vi.fn();
    const { result } = renderHook(() => useCartLogic({ ...defaultProps, items: sampleItems, setItems: setItemsMock }));

    act(() => {
      result.current.handleUpdateQty('1', 'A', 3);
    });

    expect(setItemsMock).toHaveBeenCalledTimes(1);

    // Test the callback logic
    const updateFn = setItemsMock.mock.calls[0][0];
    const newItems = updateFn(sampleItems);
    expect(newItems.find(i => i.id === '1' && i.variant === 'A').qty).toBe(3);
  });

  it('handles removing an item (handleRemove)', () => {
    const setItemsMock = vi.fn();
    const { result } = renderHook(() => useCartLogic({ ...defaultProps, items: sampleItems, setItems: setItemsMock }));

    act(() => {
      result.current.handleRemove('1', 'A');
    });

    expect(setItemsMock).toHaveBeenCalledTimes(1);

    const updateFn = setItemsMock.mock.calls[0][0];
    const newItems = updateFn(sampleItems);
    expect(newItems).toHaveLength(1);
    expect(newItems[0].id).toBe('2');
  });

  it('applies a valid promo code and calculates discount', () => {
    const { result } = renderHook(() => useCartLogic({ ...defaultProps, items: sampleItems }));

    act(() => {
      result.current.setPromo('LELO15');
    });

    act(() => {
      result.current.handleApplyPromo();
    });

    expect(result.current.appliedPromo).toBe('LELO15');
    expect(result.current.discountAmount).toBe(25000 * 0.15);
    expect(result.current.finalTotal).toBe(25000 - (25000 * 0.15));
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('shows an alert and clears promo on invalid promo code', () => {
    const { result } = renderHook(() => useCartLogic({ ...defaultProps, items: sampleItems }));

    act(() => {
      result.current.setPromo('INVALIDCODE');
    });

    act(() => {
      result.current.handleApplyPromo();
    });

    expect(result.current.appliedPromo).toBe('');
    expect(alertSpy).toHaveBeenCalled();
  });

  it('navigates to checkout and calls onClose via setTimeout', () => {
    const onCloseMock = vi.fn();
    const { result } = renderHook(() => useCartLogic({ ...defaultProps, items: sampleItems, onClose: onCloseMock }));

    const mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };

    act(() => {
      result.current.handleCheckoutNavigate(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/checkout'); // based on default 'ru' lang in test setup

    expect(onCloseMock).not.toHaveBeenCalled();

    act(() => {
      vi.runAllTimers();
    });

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('handles Kaspi checkout success', async () => {
    const { result } = renderHook(() => useCartLogic({ ...defaultProps, items: sampleItems }));

    supabase.functions.invoke.mockResolvedValueOnce({
      data: { paymentUrl: 'https://kaspi.kz/pay' },
      error: null
    });

    const mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };

    await act(async () => {
      await result.current.handleKaspiCheckout(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(supabase.functions.invoke).toHaveBeenCalledWith('kaspi-checkout', expect.objectContaining({
      body: expect.objectContaining({
        amount: 25000,
        orderId: expect.stringMatching(/^HS-\d+$/)
      })
    }));

    expect(window.location.href).toBe('https://kaspi.kz/pay');
    expect(result.current.checkoutError).toBe('');
  });

  it('handles Kaspi checkout failure (error from server)', async () => {
    const { result } = renderHook(() => useCartLogic({ ...defaultProps, items: sampleItems }));

    const mockError = new Error('Server error');
    supabase.functions.invoke.mockResolvedValueOnce({
      data: null,
      error: mockError
    });

    await act(async () => {
      await result.current.handleKaspiCheckout();
    });

    expect(consoleSpy).toHaveBeenCalledWith('[Kaspi Checkout Error]', mockError);
    expect(result.current.checkoutError).toBe('Server error');
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Server error'));
    expect(result.current.isCheckingOut).toBe(false);
  });
});
