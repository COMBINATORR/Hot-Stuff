import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import AppRouter from '../router';
import { vi } from 'vitest';
import { supabase } from '../lib/supabase';

// Helper component to track the current location within the MemoryRouter
const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

// Mock window.scrollTo to prevent jsdom errors
window.scrollTo = vi.fn();

// Mock window.location for hash/search tests
const originalLocation = window.location;

// Mock Pages
vi.mock('../pages/HomePage', () => ({ default: () => <div data-testid="home-page">HomePage</div> }));
vi.mock('../pages/CatalogPage', () => ({ default: () => <div data-testid="catalog-page">CatalogPage</div> }));
vi.mock('../pages/ProductPage', () => ({ default: () => <div data-testid="product-page">ProductPage</div> }));
vi.mock('../pages/CartPage', () => ({ default: () => <div data-testid="cart-page">CartPage</div> }));
vi.mock('../pages/CheckoutPage', () => ({ default: () => <div data-testid="checkout-page">CheckoutPage</div> }));
vi.mock('../pages/AccountPage', () => ({ default: () => <div data-testid="account-page">AccountPage</div> }));
vi.mock('../pages/LegalPage', () => ({ default: () => <div data-testid="legal-page">LegalPage</div> }));
vi.mock('../pages/SorayaMockupPage', () => ({ default: () => <div data-testid="soraya-page">SorayaMockupPage</div> }));
vi.mock('../pages/TelegramAuthCallback', () => ({ default: () => <div data-testid="telegram-auth-page">TelegramAuthCallback</div> }));

// Mock Supabase Auth
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      })
    }
  }
}));

describe('AppRouter', () => {
  const mockProps = {
    cartItems: [],
    setCartItems: vi.fn(),
    onAddToCart: vi.fn(),
    onUpdateQty: vi.fn(),
    onRemove: vi.fn(),
    favorites: [],
    setFavorites: vi.fn(),
    onSelectQuickView: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Reset window.location
    delete window.location;
    window.location = {
      ...originalLocation,
      hash: '',
      search: '',
      pathname: '/'
    };
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  const renderRouter = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <AppRouter {...mockProps} />
        <LocationDisplay />
      </MemoryRouter>
    );
  };

  it('renders HomePage on /', () => {
    renderRouter('/');
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('renders CatalogPage on /catalog', () => {
    renderRouter('/catalog');
    expect(screen.getByTestId('catalog-page')).toBeInTheDocument();
  });

  it('renders ProductPage on /product/123', () => {
    renderRouter('/product/123');
    expect(screen.getByTestId('product-page')).toBeInTheDocument();
  });

  it('renders CartPage on /cart', () => {
    renderRouter('/cart');
    expect(screen.getByTestId('cart-page')).toBeInTheDocument();
  });

  it('renders CheckoutPage on /checkout', () => {
    renderRouter('/checkout');
    expect(screen.getByTestId('checkout-page')).toBeInTheDocument();
  });

  it('renders AccountPage on /account', () => {
    renderRouter('/account');
    expect(screen.getByTestId('account-page')).toBeInTheDocument();
  });

  it('renders LegalPage on /legal', () => {
    renderRouter('/legal');
    expect(screen.getByTestId('legal-page')).toBeInTheDocument();
  });

  it('renders TelegramAuthCallback on /telegram-auth-callback', () => {
    renderRouter('/telegram-auth-callback');
    expect(screen.getByTestId('telegram-auth-page')).toBeInTheDocument();
  });

  it('renders localized HomePage on /kz', () => {
    renderRouter('/kz');
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('renders localized CatalogPage on /en/catalog', () => {
    renderRouter('/en/catalog');
    expect(screen.getByTestId('catalog-page')).toBeInTheDocument();
  });

  it('redirects to / on unknown routes', async () => {
    renderRouter('/unknown-page');
    // Using Navigate to="/" with replace should eventually render the home page
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  it('checks session on mount and sets localStorage if user exists', async () => {
    supabase.auth.getSession.mockResolvedValueOnce({
      data: {
        session: {
          user: { email: 'test@example.com' }
        }
      }
    });

    renderRouter('/');

    await waitFor(() => {
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });

    await waitFor(() => {
      const user = JSON.parse(localStorage.getItem('hs_user'));
      expect(user).toEqual({ emailOrPhone: 'test@example.com' });
    });
  });

  it('handles auth state change events', async () => {
    let authCallback;
    supabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    renderRouter('/');

    // Simulate sign in
    await waitFor(() => {
      expect(authCallback).toBeDefined();
    });

    authCallback('SIGNED_IN', { user: { email: 'newuser@example.com' } });

    expect(JSON.parse(localStorage.getItem('hs_user'))).toEqual({ emailOrPhone: 'newuser@example.com' });

    // Simulate sign out
    authCallback('SIGNED_OUT', null);
    expect(localStorage.getItem('hs_user')).toBeNull();
  });

  it('detects OAuth callback and redirects to /account', async () => {
    // Setup window.location for callback
    window.location.hash = '#access_token=123&type=magiclink';
    window.location.pathname = '/';

    renderRouter('/');

    // We expect it to navigate to /account
    await waitFor(() => {
      expect(screen.getByTestId('account-page')).toBeInTheDocument();
      // Check the location pathname from LocationDisplay helper
      expect(screen.getByTestId('location-display')).toHaveTextContent('/account');
    });
  });

  it('detects OAuth callback and redirects to localized /account', async () => {
    // Setup window.location for localized callback
    window.location.search = '?code=456';
    window.location.pathname = '/kz/checkout';

    renderRouter('/kz/checkout');

    // We expect it to navigate to /kz/account
    await waitFor(() => {
      expect(screen.getByTestId('account-page')).toBeInTheDocument();
      // Check the location pathname from LocationDisplay helper
      expect(screen.getByTestId('location-display')).toHaveTextContent('/kz/account');
    });
  });
});
