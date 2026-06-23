import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CookieBanner from './CookieBanner';
import { BrowserRouter } from 'react-router-dom';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe('CookieBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Run any pending timers and restore real timers
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <CookieBanner />
      </BrowserRouter>
    );
  };

  it('should not render initially if no consent is given', () => {
    renderComponent();
    expect(screen.queryByText('cookie.text')).not.toBeInTheDocument();
  });

  it('should render after 1 second delay if no consent is given', () => {
    renderComponent();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/cookie\.text/)).toBeInTheDocument();
  });

  it('should not render even after delay if consent is already given', () => {
    localStorage.setItem('cookie_consent', 'true');
    renderComponent();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText('cookie.text')).not.toBeInTheDocument();
  });

  it('should hide and set localStorage when accepted', () => {
    renderComponent();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const acceptButton = screen.getByText('cookie.ok');

    act(() => {
      fireEvent.click(acceptButton);
    });

    expect(localStorage.getItem('cookie_consent')).toBe('true');
  });
});
