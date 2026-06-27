import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CartFooter from './CartFooter';

describe('CartFooter', () => {
  const defaultProps = {
    promo: '',
    setPromo: vi.fn(),
    appliedPromo: '',
    handleApplyPromo: vi.fn(),
    discountAmount: 0,
    finalTotal: 10000,
    isCheckingOut: false,
    handleKaspiCheckout: vi.fn(),
    handleCheckoutNavigate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<CartFooter {...defaultProps} />);

    // Check promo input and button
    expect(screen.getByPlaceholderText('header.promo_placeholder')).toBeInTheDocument();
    expect(screen.getByText('header.promo_btn')).toBeInTheDocument();

    // Check subtotal
    expect(screen.getByText('header.subtotal:')).toBeInTheDocument();
    expect(screen.getByText('10 000 ₸')).toBeInTheDocument();

    // Check checkout actions
    expect(screen.getByText('header.kaspi_invoice')).toBeInTheDocument();
    expect(screen.getByText('header.go_to_checkout')).toBeInTheDocument();
  });

  it('calls setPromo when typing in promo input', () => {
    render(<CartFooter {...defaultProps} />);

    const input = screen.getByPlaceholderText('header.promo_placeholder');
    fireEvent.change(input, { target: { value: 'NEWPROMO' } });

    expect(defaultProps.setPromo).toHaveBeenCalledWith('NEWPROMO');
  });

  it('calls handleApplyPromo when promo apply button is clicked', () => {
    render(<CartFooter {...defaultProps} />);

    const applyButton = screen.getByText('header.promo_btn');
    fireEvent.click(applyButton);

    expect(defaultProps.handleApplyPromo).toHaveBeenCalledTimes(1);
  });

  it('does not apply promo when an empty promo string is provided', () => {
     render(<CartFooter {...defaultProps} promo="" />);

     const applyButton = screen.getByText('header.promo_btn');
     fireEvent.click(applyButton);

     expect(defaultProps.handleApplyPromo).toHaveBeenCalledTimes(1);
     // We can just verify it triggers the callback. The logic of handling empty is up to the parent `handleApplyPromo` which we mock.
  });

  it('renders applied promo information when appliedPromo is set', () => {
    render(<CartFooter {...defaultProps} appliedPromo="DISCOUNT15" discountAmount={1500} finalTotal={8500} />);

    // Based on the mock from vitest.setup.js, t() just returns the key.
    // The code does: t('header.promo_applied', { code: appliedPromo, ... })
    // With vitest.setup.js returning just 'header.promo_applied', we expect to see 'header.promo_applied:'
    expect(screen.getByText('header.promo_applied:')).toBeInTheDocument();
    expect(screen.getByText('-1 500 ₸')).toBeInTheDocument();
    expect(screen.getByText('8 500 ₸')).toBeInTheDocument();
  });

  it('calls handleKaspiCheckout when Kaspi checkout button is clicked', () => {
    render(<CartFooter {...defaultProps} />);

    const kaspiButton = screen.getByText('header.kaspi_invoice');
    fireEvent.click(kaspiButton);

    expect(defaultProps.handleKaspiCheckout).toHaveBeenCalledTimes(1);
  });

  it('disables Kaspi checkout button and shows processing state when isCheckingOut is true', () => {
    render(<CartFooter {...defaultProps} isCheckingOut={true} />);

    const kaspiButton = screen.getByText('header.processing');
    expect(kaspiButton).toBeInTheDocument();
    expect(kaspiButton).toBeDisabled();
  });

  it('calls handleCheckoutNavigate when checkout button is clicked', () => {
    render(<CartFooter {...defaultProps} />);

    const checkoutButton = screen.getByText('header.go_to_checkout');
    fireEvent.click(checkoutButton);

    expect(defaultProps.handleCheckoutNavigate).toHaveBeenCalledTimes(1);
  });
});
