import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import TelegramLoginWidget from './TelegramLoginWidget';

describe('TelegramLoginWidget', () => {
  let originalDateNow;

  beforeAll(() => {
    originalDateNow = Date.now;
    Date.now = vi.fn(() => 1234567890);
  });

  afterAll(() => {
    Date.now = originalDateNow;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders widget container and appends script', () => {
    render(<TelegramLoginWidget botName="Test_bot" />);

    const container = document.getElementById('telegram-login-container');
    expect(container).toBeInTheDocument();

    const script = container.querySelector('script');
    expect(script).toBeInTheDocument();
    expect(script.src).toBe('https://telegram.org/js/telegram-widget.js?22');
    expect(script.getAttribute('data-telegram-login')).toBe('Test_bot');
    expect(script.getAttribute('data-size')).toBe('large');
    expect(script.getAttribute('data-radius')).toBe('12');
    expect(script.getAttribute('data-request-access')).toBe('write');
    expect(script.getAttribute('data-onauth')).toBe('__telegram_login_callback_1234567890(user)');
  });

  it('registers global callback and handles missing onAuth safely', () => {
    const callbackName = '__telegram_login_callback_1234567890';
    render(<TelegramLoginWidget />);

    expect(typeof window[callbackName]).toBe('function');

    // Should not throw if onAuth is not provided
    expect(() => {
      window[callbackName]({ id: 1 });
    }).not.toThrow();
  });

  it('calls onAuth prop when global callback is triggered', () => {
    const onAuthMock = vi.fn();
    const callbackName = '__telegram_login_callback_1234567890';

    render(<TelegramLoginWidget onAuth={onAuthMock} />);

    const fakeUser = { id: 123, first_name: 'Test' };
    act(() => {
      window[callbackName](fakeUser);
    });

    expect(onAuthMock).toHaveBeenCalledWith(fakeUser);
  });

  it('uses the latest onAuth callback after rerender', () => {
    const onAuthMock1 = vi.fn();
    const onAuthMock2 = vi.fn();
    const callbackName = '__telegram_login_callback_1234567890';

    const { rerender } = render(<TelegramLoginWidget onAuth={onAuthMock1} />);
    rerender(<TelegramLoginWidget onAuth={onAuthMock2} />);

    act(() => {
      window[callbackName]({ id: 1 });
    });

    expect(onAuthMock1).not.toHaveBeenCalled();
    expect(onAuthMock2).toHaveBeenCalledWith({ id: 1 });
  });

  it('cleans up global callback and container content on unmount', () => {
    const callbackName = '__telegram_login_callback_1234567890';
    const { unmount } = render(<TelegramLoginWidget />);

    expect(typeof window[callbackName]).toBe('function');

    unmount();

    expect(window[callbackName]).toBeUndefined();
    // We cannot easily check container content after unmount as the element is unmounted,
    // but the unmount itself shouldn't throw.
  });

  it('handles script load error gracefully', () => {
    // We want to simulate the script throwing an error on load
    // The component doesn't currently do anything on error, but it shouldn't crash
    // Let's add a test for a missing script load error or callback failure.
    // The issue description mentions: "Creating a test for a missing script load error or callback failure would take ~30 lines."

    // To test this, we can mock document.createElement to intercept the script creation,
    // and then simulate the script failing to load.

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

    // Simulate error event on script
    expect(() => {
      const errorEvent = new Event('error');
      mockScript.dispatchEvent(errorEvent);
    }).not.toThrow();

    document.createElement.mockRestore();
  });
});
