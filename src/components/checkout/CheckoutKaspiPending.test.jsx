import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CheckoutKaspiPending from './CheckoutKaspiPending';

describe('CheckoutKaspiPending', () => {
  const defaultProps = {
    provider: 'kaspi',
    phone: '+7 777 123 4567',
    orderId: 'ORD-12345',
    total: 1500,
    paymentUrl: 'https://kaspi.kz/pay/test',
    checkPaymentStatusManual: vi.fn(),
    isCheckingOut: false,
    setStep: vi.fn(),
  };

  const renderComponent = (props = {}) => {
    return render(<CheckoutKaspiPending {...defaultProps} {...props} />);
  };

  it('renders default Kaspi flow correctly', () => {
    renderComponent();
    expect(screen.getByText('checkout.ready_to_pay')).toBeInTheDocument();
    expect(screen.getByText('checkout.invoice_direct_desc')).toBeInTheDocument();
    expect(screen.queryByText('checkout.invoice_sent')).not.toBeInTheDocument();
  });

  it('renders ApiPay flow correctly', () => {
    renderComponent({ provider: 'apipay' });
    expect(screen.getByText('checkout.invoice_sent')).toBeInTheDocument();
    // Handle text split across multiple elements
    expect(screen.getByText((content, element) => content.startsWith('checkout.invoice_sent_desc'))).toBeInTheDocument();
    expect(screen.getByText('+7 777 123 4567')).toBeInTheDocument();
    expect(screen.getByText('checkout.awaiting_kaspi_payment')).toBeInTheDocument();
  });

  it('renders orderId and formats total amount correctly', () => {
    renderComponent();
    expect(screen.getByText('ORD-12345')).toBeInTheDocument();
    expect(screen.getByText(/1\s*500\s*₸/)).toBeInTheDocument();
  });

  it('renders Kaspi app link with correct href and target', () => {
    renderComponent();
    const link = screen.getByRole('link', { name: /checkout\.open_kaspi_app/i });
    expect(link).toHaveAttribute('href', 'https://kaspi.kz/pay/test');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('calls checkPaymentStatusManual when manual check button is clicked', () => {
    renderComponent();
    const button = screen.getByRole('button', { name: /checkout\.paid_continue/i });
    fireEvent.click(button);
    expect(defaultProps.checkPaymentStatusManual).toHaveBeenCalled();
  });

  it('disables manual check button and shows processing state when isCheckingOut is true', () => {
    renderComponent({ isCheckingOut: true });
    const button = screen.getByRole('button', { name: /header\.processing/i });
    expect(button).toBeDisabled();
    expect(screen.queryByText('checkout.paid_continue')).not.toBeInTheDocument();
  });

  it('calls setStep with "form" when back button is clicked', () => {
    renderComponent();
    const button = screen.getByRole('button', { name: /checkout\.change_order_details/i });
    fireEvent.click(button);
    expect(defaultProps.setStep).toHaveBeenCalledWith('form');
  });
});