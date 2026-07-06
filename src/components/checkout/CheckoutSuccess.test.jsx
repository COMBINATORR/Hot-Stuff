import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import CheckoutSuccess from './CheckoutSuccess';

describe('CheckoutSuccess', () => {
  const defaultProps = {
    orderId: 'ORD-123',
    payment: 'card',
    delivery: 'pickup',
    address: 'Test St',
    city: 'City',
    zip: '123',
    total: 1500
  };

  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <CheckoutSuccess {...defaultProps} {...props} />
      </MemoryRouter>
    );
  };

  it('renders correctly with all props (happy path)', () => {
    renderComponent();

    // Title and Description
    expect(screen.getByText('checkout.order_success_title')).toBeInTheDocument();
    expect(screen.getByText('checkout.order_success_desc')).toBeInTheDocument();

    // Order ID
    expect(screen.getByText('checkout.order_id_label')).toBeInTheDocument();
    expect(screen.getByText('ORD-123')).toBeInTheDocument();

    // Payment
    expect(screen.getByText('checkout.payment_method_label')).toBeInTheDocument();
    expect(screen.getByText('checkout.payment_card')).toBeInTheDocument();

    // Delivery
    expect(screen.getByText('checkout.delivery_method_label')).toBeInTheDocument();
    expect(screen.getByText('checkout.delivery_pickup')).toBeInTheDocument();

    // Address
    expect(screen.getByText('checkout.shipping_address_label')).toBeInTheDocument();
    expect(screen.getByText('Test St, City, 123')).toBeInTheDocument();

    // Total (using regex to handle non-breaking spaces that toLocaleString might output)
    expect(screen.getByText('checkout.total_paid_label')).toBeInTheDocument();
    expect(screen.getByText(/1\s*500\s*₸/)).toBeInTheDocument();

    // Back Link
    expect(screen.getByText('checkout.back_to_shop')).toBeInTheDocument();
  });

  it('renders a fallback orderId with prefix HS- when orderId is missing', () => {
    // Override orderId so it falls back to Date.now() logic
    renderComponent({ orderId: undefined });
    expect(screen.getByText(/HS-\d+/)).toBeInTheDocument();
  });

  it('renders "Kaspi Pay" when payment prop is "kaspi"', () => {
    renderComponent({ payment: 'kaspi' });
    expect(screen.getByText('Kaspi Pay')).toBeInTheDocument();
  });

  it('renders cash translation when payment prop is neither "kaspi" nor "card"', () => {
    renderComponent({ payment: 'cash' });
    expect(screen.getByText('checkout.payment_cash')).toBeInTheDocument();
  });

  it('renders KZ delivery translation when delivery is not "atyrau"', () => {
    renderComponent({ delivery: 'other' });
    expect(screen.getByText('checkout.delivery_kz')).toBeInTheDocument();
  });

  it('hides the shipping address section when address is falsy', () => {
    renderComponent({ address: null });
    expect(screen.queryByText('checkout.shipping_address_label')).not.toBeInTheDocument();
  });

  it('renders address without zip when zip is not provided', () => {
    renderComponent({ zip: undefined });
    expect(screen.getByText('Test St, City')).toBeInTheDocument();
  });
});
