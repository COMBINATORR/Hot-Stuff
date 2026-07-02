import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CheckoutPage from '../CheckoutPage';
import { vi } from 'vitest';

// Mock Supabase
const mockInvoke = vi.fn();
vi.mock('../../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args) => mockInvoke(...args),
    },
  },
}));

const mockCartItems = [
  { id: 1, name: 'Test Product', price: 1000, qty: 2 }
];

describe('CheckoutPage', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles Kaspi polling errors gracefully without crashing', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, toFake: ['setTimeout', 'clearTimeout'] });
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Initial call to create invoice
    mockInvoke.mockResolvedValueOnce({
      data: { paymentUrl: 'https://pay.kaspi.kz/123', invoiceNumber: 'INV-123', provider: 'apipay' },
      error: null
    });

    render(
      <MemoryRouter>
        <CheckoutPage cartItems={mockCartItems} setCartItems={vi.fn()} />
      </MemoryRouter>
    );

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('checkout.first_name_placeholder'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('+7 (777) 777-77-77'), { target: { value: '+77777777777' } });

    // Submit
    const submitBtns = screen.getAllByRole('button');
    const submitBtn = submitBtns[submitBtns.length - 1];
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Wait for the invoice_sent step to render
    await waitFor(() => {
      expect(screen.getByText('checkout.invoice_sent')).toBeInTheDocument();
    });

    // Next call is polling, simulate error
    const mockError = new Error('Network error');
    mockInvoke.mockRejectedValueOnce(mockError);

    // Advance timer to trigger polling
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(mockInvoke).toHaveBeenCalledWith('kaspi-checkout', expect.objectContaining({
      body: { action: 'status', invoiceId: 'INV-123' }
    }));

    // Wait for error to be logged
    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith('[Kaspi Polling Error]', mockError);
    });

    consoleWarnSpy.mockRestore();
  });

  it('renders checkout form initially', () => {
    render(
      <MemoryRouter>
        <CheckoutPage cartItems={mockCartItems} setCartItems={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByText('checkout.contact_info')).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    render(
      <MemoryRouter>
        <CheckoutPage cartItems={mockCartItems} setCartItems={vi.fn()} />
      </MemoryRouter>
    );

    const submitBtns = screen.getAllByRole('button');
    const submitBtn = submitBtns[submitBtns.length - 1];

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByText('checkout.error_first_name')).toBeInTheDocument();
    expect(screen.getByText('checkout.error_phone')).toBeInTheDocument();
  });

  it('completes checkout flow with card payment immediately to success step', async () => {
    const setCartItems = vi.fn();
    render(
      <MemoryRouter>
        <CheckoutPage cartItems={mockCartItems} setCartItems={setCartItems} />
      </MemoryRouter>
    );

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('checkout.first_name_placeholder'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('+7 (777) 777-77-77'), { target: { value: '+77777777777' } });

    // Select card explicitly
    const cardBtn = screen.getByText('checkout.payment_card').closest('button');
    await act(async () => {
      fireEvent.click(cardBtn);
    });

    // Address fields appear when card is selected because of `payment !== 'kaspi'`
    fireEvent.change(screen.getByPlaceholderText('checkout.address_placeholder'), { target: { value: 'Main St 1' } });
    fireEvent.change(screen.getByPlaceholderText('checkout.city_placeholder'), { target: { value: 'Almaty' } });

    const submitBtns = screen.getAllByRole('button');
    const submitBtn = submitBtns[submitBtns.length - 1];
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Step 3: Success
    await waitFor(() => {
      expect(screen.getByText('checkout.order_success_title')).toBeInTheDocument();
    });
    expect(setCartItems).toHaveBeenCalledWith([]);
  });

  it('initiates Kaspi checkout via Supabase Edge Function', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { paymentUrl: 'https://pay.kaspi.kz/123', invoiceNumber: 'INV-123', provider: 'apipay' },
      error: null
    });

    render(
      <MemoryRouter>
        <CheckoutPage cartItems={mockCartItems} setCartItems={vi.fn()} />
      </MemoryRouter>
    );

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('checkout.first_name_placeholder'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('+7 (777) 777-77-77'), { target: { value: '+77777777777' } });

    // Submit
    const submitBtns = screen.getAllByRole('button');
    const submitBtn = submitBtns[submitBtns.length - 1];
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockInvoke).toHaveBeenCalledWith('kaspi-checkout', expect.objectContaining({
      body: expect.objectContaining({
        action: 'create',
        amount: 2000,
        phone: '+77777777777'
      })
    }));

    // Should transition to pending step - search for invoice sent instead
    await waitFor(() => {
      expect(screen.getByText('checkout.invoice_sent')).toBeInTheDocument();
    });
  });
});
