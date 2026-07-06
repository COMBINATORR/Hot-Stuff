import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';

// Mock useAuth
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock Supabase to prevent errors if Header directly or indirectly uses it
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      }))
    }))
  },
}));

describe('Header Component', () => {
  const defaultProps = {
    cartItems: [],
    onUpdateQty: vi.fn(),
    onRemove: vi.fn(),
    onAddToCart: vi.fn(),
    favoritesCount: 0,
    onOpenCart: vi.fn(),
    onOpenFavorites: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue(null); // Default to unauthenticated
  });

  const renderHeader = async (props = {}) => {
    let view;
    await act(async () => {
      view = render(
        <MemoryRouter>
          <Header {...defaultProps} {...props} />
        </MemoryRouter>
      );
    });
    return view;
  };

  it('renders main navigation elements', async () => {
    await renderHeader();

    // Check for logo text since it's text, not an image
    expect(screen.getAllByText('HOT STUFF')[0]).toBeInTheDocument();

    // Check for search button
    expect(screen.getAllByRole('button', { name: /search|поиск/i }).length).toBeGreaterThan(0);

    // Check for favorites button
    expect(screen.getAllByRole('button', { name: /favorites|избранное/i }).length).toBeGreaterThan(0);

    // Check for cart button
    expect(screen.getAllByRole('button', { name: /cart|корзин/i }).length).toBeGreaterThan(0);
  });

  it('shows profile link for unauthenticated users', async () => {
    await renderHeader();
    const profileLinks = screen.getAllByRole('link', { name: /Вход|Регистрация|person|login/i });
    expect(profileLinks.length).toBeGreaterThan(0);
    // Filter to the ones with href account
    const accountLinks = profileLinks.filter(l => l.getAttribute('href') === '/account');
    expect(accountLinks.length).toBeGreaterThan(0);
  });

  it('shows profile link for authenticated users', async () => {
    useAuth.mockReturnValue({ user: { id: '123', email: 'test@example.com', user_metadata: { name: 'T' } } });
    await renderHeader();

    // We match by the avatar 'T' or other generic terms since it changes text to the avatar
    const profileLinks = screen.getAllByRole('link', { name: /кабинет|профиль|person|account|login|T/i });
    expect(profileLinks.length).toBeGreaterThan(0);
    const accountLinks = profileLinks.filter(l => l.getAttribute('href') === '/account');
    expect(accountLinks.length).toBeGreaterThan(0);
  });

  it('displays the cart badge with the correct count when cart items exist', async () => {
    // The component sums the `qty` field of the items
    await renderHeader({ cartItems: [{ id: 1, qty: 2 }, { id: 2, qty: 1 }] });

    // Total quantity is 3
    const badges = screen.getAllByText('3');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('displays the favorites badge when favorites exist', async () => {
    await renderHeader({ favoritesCount: 5 });

    const badges = screen.getAllByText('5');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('calls onOpenCart when the cart button is clicked', async () => {
    const onOpenCartMock = vi.fn();
    await renderHeader({ onOpenCart: onOpenCartMock });

    const cartButtons = screen.getAllByRole('button', { name: /cart|корзин/i });
    await act(async () => {
      // Pick the first one visible
      fireEvent.click(cartButtons[0]);
    });

    expect(onOpenCartMock).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenFavorites when the favorites button is clicked', async () => {
    const onOpenFavoritesMock = vi.fn();
    await renderHeader({ onOpenFavorites: onOpenFavoritesMock });

    const favoritesButtons = screen.getAllByRole('button', { name: /favorites|избранное/i });
    await act(async () => {
      fireEvent.click(favoritesButtons[0]);
    });

    expect(onOpenFavoritesMock).toHaveBeenCalledTimes(1);
  });
});
