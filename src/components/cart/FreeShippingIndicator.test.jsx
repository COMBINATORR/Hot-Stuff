import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FreeShippingIndicator from './FreeShippingIndicator';

// Mock react-i18next is handled in vitest.setup.js,
// t(key, options) returns the key.
// But we might need to mock useTranslation locally to test the interpolation if we want,
// however vitest.setup.js has: t: (key) => key.
// So text will just be "header.free_shipping_hint" or "header.free_shipping_success".

describe('FreeShippingIndicator', () => {
  it('renders correctly when subtotal is 0 (0% progress)', () => {
    const { container } = render(
      <FreeShippingIndicator subtotal={0} freeShippingThreshold={10000} progressPercent={0} />
    );

    // Check for the hint text key
    expect(screen.getByText('header.free_shipping_hint')).toBeInTheDocument();

    // Check for 0%
    expect(screen.getByText('0%')).toBeInTheDocument();

    // Check progress bar width
    const progressBar = container.querySelector('.bg-primary.transition-all');
    expect(progressBar).toHaveStyle({ width: '0%' });
  });

  it('renders correctly when subtotal is below threshold (e.g. 50% progress)', () => {
    const { container } = render(
      <FreeShippingIndicator subtotal={5000} freeShippingThreshold={10000} progressPercent={50} />
    );

    expect(screen.getByText('header.free_shipping_hint')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();

    const progressBar = container.querySelector('.bg-primary.transition-all');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('renders correctly when subtotal exactly meets the threshold', () => {
    const { container } = render(
      <FreeShippingIndicator subtotal={10000} freeShippingThreshold={10000} progressPercent={100} />
    );

    expect(screen.getByText('header.free_shipping_success')).toBeInTheDocument();
    expect(screen.queryByText('header.free_shipping_hint')).not.toBeInTheDocument();

    const progressBar = container.querySelector('.bg-primary.transition-all');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });

  it('renders correctly when subtotal exceeds the threshold', () => {
    const { container } = render(
      <FreeShippingIndicator subtotal={15000} freeShippingThreshold={10000} progressPercent={100} />
    );

    expect(screen.getByText('header.free_shipping_success')).toBeInTheDocument();

    const progressBar = container.querySelector('.bg-primary.transition-all');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });
});
