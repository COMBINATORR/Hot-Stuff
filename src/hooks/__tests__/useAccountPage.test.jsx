import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAccountPage } from '../useAccountPage';
import { supabase } from '../../lib/supabaseClient';

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ search: '', pathname: '/' }),
}));

describe('useAccountPage testing improvements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should test handleTelegramLoginSuccess catch block', async () => {
    // Arrange
    const fetchError = new Error('LocalStorage access denied');

    // Mock localStorage to throw so it hits the main catch block.
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw fetchError;
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockT = vi.fn((key, defaultText) => defaultText);

    const { result } = renderHook(() => useAccountPage({ t: mockT, lang: 'ru', onAddToCart: vi.fn() }));

    const mockUser = {
      id: 12345,
      first_name: 'Test',
    };

    await act(async () => {
      await Promise.resolve();
    });

    // Act
    act(() => {
      result.current.handleTelegramLoginSuccess(mockUser);
    });

    // Assert strictly against the exact strings from the issue description
    expect(consoleSpy).toHaveBeenCalledWith('[Telegram login flow] Error:', fetchError);
    expect(result.current.error).toBe('Произошла ошибка при авторизации');
    expect(result.current.loading).toBe(false);

    setItemSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
