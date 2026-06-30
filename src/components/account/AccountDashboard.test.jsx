import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AccountDashboard from './AccountDashboard';

// Mock child components
vi.mock('./dashboard/DashboardHeader', () => ({
  DashboardHeader: (props) => <div data-testid="dashboard-header">{props.getDisplayName?.()}</div>
}));
vi.mock('./dashboard/LoyaltyTier', () => ({
  LoyaltyTier: () => <div data-testid="loyalty-tier" />
}));
vi.mock('./dashboard/ActiveDelivery', () => ({
  ActiveDelivery: () => <div data-testid="active-delivery" />
}));
vi.mock('./dashboard/OrderHistory', () => ({
  OrderHistory: () => <div data-testid="order-history" />
}));
vi.mock('./dashboard/Wishlist', () => ({
  Wishlist: () => <div data-testid="wishlist" />
}));
vi.mock('./dashboard/SessionSecurity', () => ({
  SessionSecurity: () => <div data-testid="session-security" />
}));

describe('AccountDashboard', () => {
  const defaultProps = {
    t: (key, defaultText) => defaultText || key,
    getDisplayAvatar: vi.fn(),
    getDisplayName: vi.fn(() => 'Test User'),
    getDisplayEmailOrPhone: vi.fn(),
    isPrivate: false,
    handleTogglePrivate: vi.fn(),
    loading: false,
    setLoading: vi.fn(),
    handleLogout: vi.fn(),
    loyaltyData: {},
    activeOrders: [],
    orderHistory: [],
    lang: 'en',
    favorites: [],
    handleAddWishlistItem: vi.fn(),
    handleShareWishlist: vi.fn(),
    MOCK_REGISTERED_USERS: [],
    setSavedAccounts: vi.fn(),
    setRegisteredUsers: vi.fn(),
  };

  it('renders all main sections', () => {
    render(<AccountDashboard {...defaultProps} />);

    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    expect(screen.getByTestId('loyalty-tier')).toBeInTheDocument();
    expect(screen.getByTestId('active-delivery')).toBeInTheDocument();
    expect(screen.getByTestId('order-history')).toBeInTheDocument();
    expect(screen.getByTestId('wishlist')).toBeInTheDocument();
    expect(screen.getByTestId('session-security')).toBeInTheDocument();
  });

  it('passes props correctly to DashboardHeader', () => {
    render(<AccountDashboard {...defaultProps} />);
    expect(screen.getByTestId('dashboard-header')).toHaveTextContent('Test User');
  });
});
