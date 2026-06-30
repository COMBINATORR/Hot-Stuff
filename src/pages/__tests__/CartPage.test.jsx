import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import CartPage from '../CartPage';
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

// Mock ResponsiveImage to avoid loading real images
vi.mock('../../components/ResponsiveImage', () => ({
  default: ({ src, alt, className }) => <img src={src} alt={alt} className={className} data-testid="responsive-image" />
}));

const mockCartItems = [
  { id: 1, name: 'Test Product 1', price: 1000, qty: 2, variant: 'red', image: 'image1.jpg' },
  { id: 2, name: 'Test Product 2', price: 500, qty: 1, image: 'image2.jpg' }
];

describe('CartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Prevent actual alerts in tests
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    // Mock window.location.href assignment
    delete window.location;
    window.location = { href: '' };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders empty cart state when no items are provided', () => {
    render(
      <HelmetProvider>
      <MemoryRouter>
        <CartPage cartItems={[]} />
      </MemoryRouter>
      </HelmetProvider>
    );
    expect(screen.getByText('cart.empty')).toBeInTheDocument();
    expect(screen.getByText('cart.empty_hint')).toBeInTheDocument();
  });

  it('renders cart items correctly', () => {
    render(
      <HelmetProvider>
      <MemoryRouter>
        <CartPage cartItems={mockCartItems} />
      </MemoryRouter>
      </HelmetProvider>
    );

    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();

    // Subtotal: 1000 * 2 + 500 * 1 = 2500. Delivery = 1490. Total = 3990
    expect(screen.getByText('2 500 ₸')).toBeInTheDocument();
    expect(screen.getByText('1 490 ₸')).toBeInTheDocument();
    expect(screen.getByText('3 990 ₸')).toBeInTheDocument();
  });

  it('calls onUpdateQty when quantity buttons are clicked', () => {
    const onUpdateQty = vi.fn();
    render(
      <HelmetProvider>
      <MemoryRouter>
        <CartPage cartItems={mockCartItems} onUpdateQty={onUpdateQty} />
      </MemoryRouter>
      </HelmetProvider>
    );

    // Using inner text values − and + which are what QtyControl uses
    const plusButtons = screen.getAllByText('+');
    fireEvent.click(plusButtons[0]); // first item

    expect(onUpdateQty).toHaveBeenCalledWith(1, 'red', 3);

    const minusButtons = screen.getAllByText('−');
    fireEvent.click(minusButtons[0]); // first item

    expect(onUpdateQty).toHaveBeenCalledWith(1, 'red', 1);
  });

  it('calls onRemove when quantity becomes 0 via decrement', () => {
    const onRemove = vi.fn();
    render(
      <HelmetProvider>
      <MemoryRouter>
        <CartPage cartItems={mockCartItems} onRemove={onRemove} />
      </MemoryRouter>
      </HelmetProvider>
    );

    const minusButtons = screen.getAllByText('−');
    fireEvent.click(minusButtons[1]); // second item, has qty 1

    expect(onRemove).toHaveBeenCalledWith(2, undefined); // id: 2, variant: undefined
  });

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = vi.fn();
    render(
      <HelmetProvider>
      <MemoryRouter>
        <CartPage cartItems={mockCartItems} onRemove={onRemove} />
      </MemoryRouter>
      </HelmetProvider>
    );

    // The button has aria-label="header.remove Item Name" or just text 'header.remove' since t('header.remove') is 'header.remove' in setup mock
    const removeButtons = screen.getAllByText('header.remove');
    fireEvent.click(removeButtons[0]); // first item

    expect(onRemove).toHaveBeenCalledWith(1, 'red');
  });

  it('initiates Kaspi checkout successfully', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { paymentUrl: 'https://pay.kaspi.kz/123' },
      error: null
    });

    render(
      <HelmetProvider>
      <MemoryRouter>
        <CartPage cartItems={mockCartItems} />
      </MemoryRouter>
      </HelmetProvider>
    );

    const kaspiButton = screen.getByText('cart.kaspi').closest('button');

    await act(async () => {
      fireEvent.click(kaspiButton);
    });

    expect(mockInvoke).toHaveBeenCalledWith('kaspi-checkout', expect.objectContaining({
      body: expect.objectContaining({
        amount: 3990, // total
      })
    }));

    await waitFor(() => {
      expect(window.location.href).toBe('https://pay.kaspi.kz/123');
    });
  });

    it('handles Kaspi checkout initialization error (missing paymentUrl)', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { someOtherField: true },
      error: null
    });

    render(
      <HelmetProvider>
      <MemoryRouter>
        <CartPage cartItems={mockCartItems} />
      </MemoryRouter>
      </HelmetProvider>
    );

    const kaspiButton = screen.getByText('cart.kaspi').closest('button');

    await act(async () => {
      fireEvent.click(kaspiButton);
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('header.payment_failed');
    });

    // Check that error message is rendered
    expect(screen.getByTestId('checkout-error')).toBeInTheDocument();
  });

  it('handles Kaspi checkout error', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('Network error'));

    render(
      <HelmetProvider>
      <MemoryRouter>
        <CartPage cartItems={mockCartItems} />
      </MemoryRouter>
      </HelmetProvider>
    );

    const kaspiButton = screen.getByText('cart.kaspi').closest('button');

    await act(async () => {
      fireEvent.click(kaspiButton);
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('header.payment_failed');
    });

    // Check that error message is rendered
    expect(screen.getByTestId('checkout-error')).toBeInTheDocument();
  });
});
