import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginStep1 from './LoginStep1';

// Mock TelegramLoginWidget
vi.mock('../TelegramLoginWidget', () => ({
  default: () => <div data-testid="telegram-widget" />
}));

describe('LoginStep1', () => {
  const defaultProps = {
    t: (key, defaultText) => defaultText || key,
    savedAccounts: [],
    setIdentifier: vi.fn(),
    loginSuccess: vi.fn(),
    setSavedAccounts: vi.fn(),
    setRegisteredUsers: vi.fn(),
    handleIdentifierSubmit: vi.fn((e) => e.preventDefault()),
    identifier: '',
    loading: false,
    handleGoogleLogin: vi.fn(),
    handleYandexClick: vi.fn(),
    isLocalHost: () => false,
    handleLocalTelegramLogin: vi.fn(),
    handleTelegramLoginSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders form elements correctly', () => {
    render(<LoginStep1 {...defaultProps} />);

    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByText('account.continue')).toBeInTheDocument();
    expect(screen.getByTitle('account.google')).toBeInTheDocument();
    expect(screen.getByTitle('account.yandex')).toBeInTheDocument();
    expect(screen.getByTestId('telegram-widget')).toBeInTheDocument();
  });

  it('renders saved accounts when available', () => {
    render(<LoginStep1 {...defaultProps} savedAccounts={['test1@example.com', 'test2@example.com']} />);

    expect(screen.getByText('account.login_as')).toBeInTheDocument();
    expect(screen.getByText('test1@example.com')).toBeInTheDocument();
    expect(screen.getByText('test2@example.com')).toBeInTheDocument();
  });

  it('calls setIdentifier and loginSuccess when a saved account is clicked', () => {
    render(<LoginStep1 {...defaultProps} savedAccounts={['test@example.com']} />);

    const accountButton = screen.getByText('test@example.com').closest('button');
    fireEvent.click(accountButton);

    expect(defaultProps.setIdentifier).toHaveBeenCalledWith('test@example.com');
    expect(defaultProps.loginSuccess).toHaveBeenCalledWith('test@example.com');
  });

  it('removes a saved account when delete button is clicked', () => {
    localStorage.setItem('hs_registered_users', JSON.stringify(['test@example.com']));

    // We need to implement dummy setters to test the callback logic
    let savedAccountsMock = ['test@example.com'];
    let registeredUsersMock = ['test@example.com'];

    const setSavedAccounts = vi.fn((cb) => {
      savedAccountsMock = cb(savedAccountsMock);
    });
    const setRegisteredUsers = vi.fn((cb) => {
      registeredUsersMock = cb(registeredUsersMock);
    });

    render(<LoginStep1
      {...defaultProps}
      savedAccounts={savedAccountsMock}
      setSavedAccounts={setSavedAccounts}
      setRegisteredUsers={setRegisteredUsers}
    />);

    const deleteButton = screen.getByTitle('Удалить из списка');
    fireEvent.click(deleteButton);

    expect(setSavedAccounts).toHaveBeenCalled();
    expect(setRegisteredUsers).toHaveBeenCalled();

    expect(savedAccountsMock).toEqual([]);
    expect(registeredUsersMock).toEqual([]);

    const localStorageData = JSON.parse(localStorage.getItem('hs_registered_users'));
    expect(localStorageData).toEqual([]);
  });

  it('updates identifier on input change', () => {
    render(<LoginStep1 {...defaultProps} />);

    const input = screen.getByPlaceholderText(/Email/i);
    fireEvent.change(input, { target: { value: 'new@example.com' } });

    expect(defaultProps.setIdentifier).toHaveBeenCalledWith('new@example.com');
  });

  it('calls handleIdentifierSubmit on form submission', () => {
    render(<LoginStep1 {...defaultProps} identifier="test@example.com" />);

    const submitButton = screen.getByText('account.continue').closest('button');
    fireEvent.click(submitButton);

    expect(defaultProps.handleIdentifierSubmit).toHaveBeenCalled();
  });

  it('calls handleGoogleLogin on Google button click', () => {
    render(<LoginStep1 {...defaultProps} />);

    const googleButton = screen.getByTitle('account.google');
    fireEvent.click(googleButton);

    expect(defaultProps.handleGoogleLogin).toHaveBeenCalled();
  });

  it('calls handleYandexClick on Yandex button click', () => {
    render(<LoginStep1 {...defaultProps} />);

    const yandexButton = screen.getByTitle('account.yandex');
    fireEvent.click(yandexButton);

    expect(defaultProps.handleYandexClick).toHaveBeenCalled();
  });

  it('renders and calls local telegram login on localhost', () => {
    render(<LoginStep1 {...defaultProps} isLocalHost={() => true} />);

    const localButton = screen.getByText('Войти (Локально)').closest('button');
    expect(localButton).toBeInTheDocument();

    fireEvent.click(localButton);
    expect(defaultProps.handleLocalTelegramLogin).toHaveBeenCalled();
  });

  it('disables inputs and buttons when loading is true', () => {
    render(<LoginStep1 {...defaultProps} loading={true} />);

    expect(screen.getByPlaceholderText(/Email/i)).toBeDisabled();
    expect(screen.getByText('account.continue').closest('button')).toBeDisabled();
    expect(screen.getByTitle('account.google')).toBeDisabled();
    expect(screen.getByTitle('account.yandex')).toBeDisabled();
  });
});
