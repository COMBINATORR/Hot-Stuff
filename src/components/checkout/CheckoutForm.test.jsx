import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import CheckoutForm from './CheckoutForm';

const defaultProps = {
  firstName: '', setFirstName: vi.fn(),
  lastName: '', setLastName: vi.fn(),
  phone: '', setPhone: vi.fn(),
  email: '', setEmail: vi.fn(),
  delivery: 'courier', setDelivery: vi.fn(),
  payment: 'card', setPayment: vi.fn(),
  address: '', setAddress: vi.fn(),
  city: '', setCity: vi.fn(),
  zip: '', setZip: vi.fn(),
  formErrors: {},
  paymentError: null,
  deliveryOptions: [
    { id: 'courier', label: 'Courier', price: 1000, time: '1-2 days' },
    { id: 'pickup', label: 'Pickup', price: 0, time: 'Now' }
  ],
  paymentOptions: [
    { id: 'card', label: 'Card' },
    { id: 'kaspi', label: 'Kaspi' }
  ],
  cartItems: [{ id: 1, name: 'Item', price: 100, qty: 1 }],
  subtotal: 100,
  deliveryCost: 10,
  total: 110,
  isCheckingOut: false,
  handleNextStep: vi.fn()
};

const renderCheckoutForm = (props = {}) => {
  return render(
    <MemoryRouter>
      <CheckoutForm {...defaultProps} {...props} />
    </MemoryRouter>
  );
};

describe('CheckoutForm - Error Handling', () => {
  it('renders without errors when no formErrors or paymentError are provided', () => {
    renderCheckoutForm();

    // Check that error messages are not present
    expect(screen.queryByText(/⚠️/)).not.toBeInTheDocument();

    // Check that inputs do not have the error class (border-red-500)
    const firstNameInput = screen.getByPlaceholderText('checkout.first_name_placeholder');
    expect(firstNameInput).not.toHaveClass('border-red-500');
    expect(firstNameInput).toHaveClass('border-neutral-200');

    const phoneInput = screen.getByPlaceholderText('+7 (777) 777-77-77');
    expect(phoneInput).not.toHaveClass('border-red-500');
    expect(phoneInput).toHaveClass('border-neutral-200');
  });

  it('renders payment error message when paymentError prop is provided', () => {
    const paymentError = 'Insufficient funds';
    renderCheckoutForm({ paymentError });

    expect(screen.getByText(new RegExp(paymentError))).toBeInTheDocument();
  });

  it('renders field errors and applies red borders when formErrors are provided', () => {
    const formErrors = {
      firstName: 'First name is required',
      phone: 'Invalid phone format',
      address: 'Address is required',
      city: 'City is required'
    };

    renderCheckoutForm({ formErrors, payment: 'card' });

    // Check error messages
    expect(screen.getByText('First name is required')).toBeInTheDocument();
    expect(screen.getByText('Invalid phone format')).toBeInTheDocument();
    expect(screen.getByText('Address is required')).toBeInTheDocument();
    expect(screen.getByText('City is required')).toBeInTheDocument();

    // Check red borders
    const firstNameInput = screen.getByPlaceholderText('checkout.first_name_placeholder');
    expect(firstNameInput).toHaveClass('border-red-500');
    expect(firstNameInput).not.toHaveClass('border-neutral-200');

    const phoneInput = screen.getByPlaceholderText('+7 (777) 777-77-77');
    expect(phoneInput).toHaveClass('border-red-500');

    const addressInput = screen.getByPlaceholderText('checkout.address_placeholder');
    expect(addressInput).toHaveClass('border-red-500');

    const cityInput = screen.getByPlaceholderText('checkout.city_placeholder');
    expect(cityInput).toHaveClass('border-red-500');
  });
});