import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CheckoutDeliveryAddress from './CheckoutDeliveryAddress';

describe('CheckoutDeliveryAddress', () => {
  const defaultProps = {
    address: '',
    setAddress: vi.fn(),
    city: '',
    setCity: vi.fn(),
    zip: '',
    setZip: vi.fn(),
    formErrors: {},
    handleFinalizeOrder: vi.fn()
  };

  const renderComponent = (props = {}) => {
    return render(<CheckoutDeliveryAddress {...defaultProps} {...props} />);
  };

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByText('checkout.payment_confirmed')).toBeInTheDocument();
    expect(screen.getByText('checkout.delivery_details_title')).toBeInTheDocument();
    expect(screen.getByText('checkout.address')).toBeInTheDocument();
    expect(screen.getByText('checkout.city')).toBeInTheDocument();
    expect(screen.getByText('checkout.zip')).toBeInTheDocument();
    expect(screen.getByText('checkout.finalize_order')).toBeInTheDocument();
  });

  it('calls setAddress when address input changes', async () => {
    const user = userEvent.setup();
    const setAddress = vi.fn();
    renderComponent({ setAddress });

    const addressInput = screen.getByPlaceholderText('checkout.address_placeholder');
    await user.type(addressInput, 'Abay 123');

    expect(setAddress).toHaveBeenCalled();
  });

  it('calls setCity when city input changes', async () => {
    const user = userEvent.setup();
    const setCity = vi.fn();
    renderComponent({ setCity });

    const cityInput = screen.getByPlaceholderText('checkout.city_placeholder');
    await user.type(cityInput, 'Almaty');

    expect(setCity).toHaveBeenCalled();
  });

  it('calls setZip when zip input changes', async () => {
    const user = userEvent.setup();
    const setZip = vi.fn();
    renderComponent({ setZip });

    const zipInput = screen.getByPlaceholderText('060000');
    await user.type(zipInput, '050000');

    expect(setZip).toHaveBeenCalled();
  });

  it('displays form errors correctly', () => {
    const formErrors = {
      address: 'Address is required',
      city: 'City is required'
    };
    renderComponent({ formErrors });

    expect(screen.getByText('Address is required')).toBeInTheDocument();
    expect(screen.getByText('City is required')).toBeInTheDocument();

    const addressInput = screen.getByPlaceholderText('checkout.address_placeholder');
    expect(addressInput).toHaveClass('border-red-500');

    const cityInput = screen.getByPlaceholderText('checkout.city_placeholder');
    expect(cityInput).toHaveClass('border-red-500');
  });

  it('calls handleFinalizeOrder when the button is clicked', async () => {
    const user = userEvent.setup();
    const handleFinalizeOrder = vi.fn();
    renderComponent({ handleFinalizeOrder });

    const button = screen.getByText('checkout.finalize_order').closest('button');
    await user.click(button);

    expect(handleFinalizeOrder).toHaveBeenCalledTimes(1);
  });
});
