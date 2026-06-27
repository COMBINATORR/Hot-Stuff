import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionSecurity } from './SessionSecurity';
import { supabase } from '../../../lib/supabase';
import { act } from 'react';

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
}));

describe('SessionSecurity', () => {
  const mockT = vi.fn((key, defaultVal) => defaultVal);
  const mockSetLoading = vi.fn();
  const mockSetSavedAccounts = vi.fn();
  const mockSetRegisteredUsers = vi.fn();
  const mockMOCK_REGISTERED_USERS = [{ id: 1, name: 'Test' }];

  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
    window.confirm = vi.fn();
    console.error = vi.fn();
    Object.defineProperty(window, 'localStorage', {
      value: {
        removeItem: vi.fn(),
      },
      writable: true
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <SessionSecurity
        t={mockT}
        loading={false}
        setLoading={mockSetLoading}
        setSavedAccounts={mockSetSavedAccounts}
        setRegisteredUsers={mockSetRegisteredUsers}
        MOCK_REGISTERED_USERS={mockMOCK_REGISTERED_USERS}
        {...props}
      />
    );
  };

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByText('Безопасность и управление сессиями')).toBeInTheDocument();
    expect(screen.getByText('Выйти на других устройствах')).toBeInTheDocument();
    expect(screen.getByText('Стереть историю входов здесь')).toBeInTheDocument();
  });

  it('renders loading state correctly', () => {
    renderComponent({ loading: true });
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /загрузка/i })).toBeDisabled();
  });

  describe('Sign Out from Other Devices', () => {
    it('successfully signs out from other devices', async () => {
      supabase.auth.signOut.mockResolvedValueOnce({ error: null });
      renderComponent();

      const logoutBtn = screen.getByText('Выйти на других устройствах');

      await act(async () => {
        fireEvent.click(logoutBtn);
      });

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: 'others' });

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Все сессии на других устройствах успешно завершены!');
      });

      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });

    it('handles sign out errors', async () => {
      const mockError = new Error('Sign out failed');
      supabase.auth.signOut.mockResolvedValueOnce({ error: mockError });
      renderComponent();

      const logoutBtn = screen.getByText('Выйти на других устройствах');

      await act(async () => {
        fireEvent.click(logoutBtn);
      });

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: 'others' });

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(mockError);
        expect(window.alert).toHaveBeenCalledWith('Ошибка: Sign out failed');
      });

      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('Clear Login History', () => {
    it('clears history when user confirms', () => {
      window.confirm.mockReturnValueOnce(true);
      renderComponent();

      const clearBtn = screen.getByText('Стереть историю входов здесь');
      fireEvent.click(clearBtn);

      expect(window.confirm).toHaveBeenCalledWith('Вы уверены, что хотите очистить историю входов на этом устройстве? При следующем входе вам потребуется подтверждение по коду.');
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('hs_registered_users');
      expect(mockSetSavedAccounts).toHaveBeenCalledWith([]);
      expect(mockSetRegisteredUsers).toHaveBeenCalledWith(mockMOCK_REGISTERED_USERS);
      expect(window.alert).toHaveBeenCalledWith('История входов на этом устройстве очищена!');
    });

    it('does nothing when user cancels', () => {
      window.confirm.mockReturnValueOnce(false);
      renderComponent();

      const clearBtn = screen.getByText('Стереть историю входов здесь');
      fireEvent.click(clearBtn);

      expect(window.confirm).toHaveBeenCalled();
      expect(window.localStorage.removeItem).not.toHaveBeenCalled();
      expect(mockSetSavedAccounts).not.toHaveBeenCalled();
      expect(mockSetRegisteredUsers).not.toHaveBeenCalled();
      expect(window.alert).not.toHaveBeenCalled();
    });
  });
});
