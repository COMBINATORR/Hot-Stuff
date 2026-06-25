import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TelegramLoginWidget from './TelegramLoginWidget';

describe('TelegramLoginWidget', () => {
  beforeEach(() => {
    // Clear any window modifications between tests
    Object.keys(window).forEach(key => {
      if (key.startsWith('__telegram_login_callback_')) {
        delete window[key];
      }
    });
    vi.restoreAllMocks();
  });

  it('renders the container element', () => {
    render(<TelegramLoginWidget onAuth={vi.fn()} />);
    const container = document.getElementById('telegram-login-container');
    expect(container).toBeInTheDocument();
  });

  it('injects the script tag with correct attributes', () => {
    render(
      <TelegramLoginWidget
        botName="TestBot"
        size="medium"
        radius="8"
        onAuth={vi.fn()}
      />
    );

    const container = document.getElementById('telegram-login-container');
    const script = container.querySelector('script');

    expect(script).toBeInTheDocument();
    expect(script).toHaveAttribute('src', 'https://telegram.org/js/telegram-widget.js?22');
    expect(script.async).toBe(true);
    expect(script).toHaveAttribute('data-telegram-login', 'TestBot');
    expect(script).toHaveAttribute('data-size', 'medium');
    expect(script).toHaveAttribute('data-radius', '8');
    expect(script).toHaveAttribute('data-request-access', 'write');
    expect(script.getAttribute('data-onauth')).toMatch(/^__telegram_login_callback_\d+\(user\)$/);
  });

  it('registers global callback and handles missing onAuth safely', () => {
    render(<TelegramLoginWidget />);

    const container = document.getElementById('telegram-login-container');
    const script = container.querySelector('script');
    const dataOnAuth = script.getAttribute('data-onauth');
    const callbackNameMatch = dataOnAuth.match(/^(__telegram_login_callback_\d+)\(user\)$/);
    const callbackName = callbackNameMatch[1];

    expect(typeof window[callbackName]).toBe('function');

    // Should not throw if onAuth is not provided
    expect(() => {
      window[callbackName]({ id: 1 });
    }).not.toThrow();
  });

  it('handles the onAuth callback correctly', () => {
    const mockOnAuth = vi.fn();
    render(<TelegramLoginWidget onAuth={mockOnAuth} />);

    const container = document.getElementById('telegram-login-container');
    const script = container.querySelector('script');

    // Extract the callback name from data-onauth attribute
    const dataOnAuth = script.getAttribute('data-onauth');
    const callbackNameMatch = dataOnAuth.match(/^(__telegram_login_callback_\d+)\(user\)$/);
    const callbackName = callbackNameMatch[1];

    expect(typeof window[callbackName]).toBe('function');

    // Simulate Telegram calling the global function
    const mockUser = { id: 12345, first_name: 'Test' };
    act(() => {
      window[callbackName](mockUser);
    });

    expect(mockOnAuth).toHaveBeenCalledTimes(1);
    expect(mockOnAuth).toHaveBeenCalledWith(mockUser);
  });

  it('uses the latest onAuth callback after rerender without recreating the script', () => {
    const mockOnAuth1 = vi.fn();
    const mockOnAuth2 = vi.fn();

    const { rerender } = render(<TelegramLoginWidget onAuth={mockOnAuth1} />);

    const container = document.getElementById('telegram-login-container');
    const script = container.querySelector('script');
    const dataOnAuth = script.getAttribute('data-onauth');
    const callbackNameMatch = dataOnAuth.match(/^(__telegram_login_callback_\d+)\(user\)$/);
    const callbackName = callbackNameMatch[1];

    // Re-render with new callback
    rerender(<TelegramLoginWidget onAuth={mockOnAuth2} />);

    // Call the global function
    act(() => {
      window[callbackName]({ id: 1 });
    });

    expect(mockOnAuth1).not.toHaveBeenCalled();
    expect(mockOnAuth2).toHaveBeenCalledTimes(1);
    expect(mockOnAuth2).toHaveBeenCalledWith({ id: 1 });

    // The script should still be the same instance (no remount)
    const newScript = container.querySelector('script');
    expect(newScript).toBe(script);
  });

  it('cleans up global callback and script on unmount', () => {
    const { unmount } = render(<TelegramLoginWidget onAuth={vi.fn()} />);

    const container = document.getElementById('telegram-login-container');
    const script = container.querySelector('script');
    const dataOnAuth = script.getAttribute('data-onauth');
    const callbackNameMatch = dataOnAuth.match(/^(__telegram_login_callback_\d+)\(user\)$/);
    const callbackName = callbackNameMatch[1];

    expect(typeof window[callbackName]).toBe('function');

    unmount();

    expect(window[callbackName]).toBeUndefined();
    // testing-library automatically removes container from document body,
    // but the actual container dom node still exists in memory, and the react component's ref cleanup
    // runs, clearing out innerHTML thanks to storing ref value locally in the effect.
    expect(container.innerHTML).toBe('');
  });

  it('handles script load error gracefully', () => {
    // Intercept script creation to capture the script element
    const originalCreateElement = document.createElement.bind(document);
    let mockScript;

    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'script') {
        mockScript = originalCreateElement(tagName);
        return mockScript;
      }
      return originalCreateElement(tagName);
    });

    render(<TelegramLoginWidget />);

    expect(mockScript).toBeDefined();

    // Simulate error event on script — component should not crash
    expect(() => {
      const errorEvent = new Event('error');
      mockScript.dispatchEvent(errorEvent);
    }).not.toThrow();
  });
});
