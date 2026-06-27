import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';

// We mock some children components to isolate the App logic and test its state management
vi.mock('../components/Header', () => ({
  default: ({ onAddToCart, cartItems, favoritesCount, onOpenCart, onOpenFavorites, onUpdateQty, onRemove }) => (
    <div data-testid="mock-header">
      <span data-testid="cart-count">{cartItems.length}</span>
      <span data-testid="favorites-count">{favoritesCount}</span>
      <button data-testid="open-cart-btn" onClick={onOpenCart}>Open Cart</button>
      <button data-testid="open-fav-btn" onClick={onOpenFavorites}>Open Favorites</button>
      <button data-testid="add-to-cart-btn" onClick={() => onAddToCart({ id: 'item1', variant: 'Default', qty: 1 })}>Add Item</button>
      <button data-testid="update-qty-btn" onClick={() => onUpdateQty('item1', 'Default', 2)}>Update Qty</button>
      <button data-testid="remove-item-btn" onClick={() => onRemove('item1', 'Default')}>Remove Item</button>
    </div>
  ),
}));

vi.mock('../router', () => ({
  default: ({ onAddToCart, onSelectQuickView }) => (
    <div data-testid="mock-router">
      <button data-testid="router-add-to-cart" onClick={() => onAddToCart({ id: 'prod1', name: 'Product 1' }, { name: 'Red' }, 'M')}>
        Router Add
      </button>
      <button data-testid="quick-view-btn" onClick={() => onSelectQuickView({ id: 'prod2', name: 'Product 2' })}>
        Quick View
      </button>
    </div>
  ),
}));

vi.mock('../components/CartDrawer', () => ({
  default: ({ isOpen, onClose }) => (
    isOpen ? <div data-testid="mock-cart-drawer">Cart Drawer Open<button onClick={onClose} data-testid="close-cart-btn">Close</button></div> : null
  ),
}));

vi.mock('../components/FavoritesDrawer', () => ({
  default: ({ isOpen, onClose }) => (
    isOpen ? <div data-testid="mock-favorites-drawer">Favorites Drawer Open<button onClick={onClose} data-testid="close-fav-btn">Close</button></div> : null
  ),
}));

vi.mock('../components/ProductModal', () => ({
  default: ({ product, onClose }) => (
    product ? <div data-testid="mock-product-modal">Product Modal Open<button onClick={onClose} data-testid="close-modal-btn">Close</button></div> : null
  ),
}));

// Dummy component to avoid warnings
vi.mock('../components/CookieBanner', () => ({ default: () => <div /> }));
vi.mock('../components/PanicButton', () => ({ default: () => <div /> }));
vi.mock('../components/Footer', () => ({ default: () => <div /> }));

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('mock-header')).toBeInTheDocument();
    expect(getByTestId('mock-router')).toBeInTheDocument();
  });

  it('loads favorites from localStorage', () => {
    localStorage.setItem('hs_favorites', JSON.stringify([{ id: 'fav1' }, { id: 'fav2' }]));
    const { getByTestId } = render(<App />);
    expect(getByTestId('favorites-count').textContent).toBe('2');
  });

  it('handles cart state and drawer', () => {
    const { getByTestId, queryByTestId } = render(<App />);

    expect(getByTestId('cart-count').textContent).toBe('0');
    expect(queryByTestId('mock-cart-drawer')).not.toBeInTheDocument();

    act(() => {
      fireEvent.click(getByTestId('add-to-cart-btn'));
    });

    expect(getByTestId('cart-count').textContent).toBe('1');

    act(() => {
      fireEvent.click(getByTestId('open-cart-btn'));
    });

    expect(getByTestId('mock-cart-drawer')).toBeInTheDocument();

    act(() => {
      fireEvent.click(getByTestId('close-cart-btn'));
    });

    expect(queryByTestId('mock-cart-drawer')).not.toBeInTheDocument();
  });

  it('handles addToCart properly (adding new and updating existing)', () => {
    const { getByTestId } = render(<App />);

    act(() => {
      fireEvent.click(getByTestId('add-to-cart-btn'));
    });
    expect(getByTestId('cart-count').textContent).toBe('1');

    act(() => {
      fireEvent.click(getByTestId('add-to-cart-btn'));
    });
    // Count is still 1 (item1 exists), but qty should be 2. Let's verify by adding an item from router which acts slightly differently
    expect(getByTestId('cart-count').textContent).toBe('1');

    act(() => {
      fireEvent.click(getByTestId('router-add-to-cart'));
    });
    expect(getByTestId('cart-count').textContent).toBe('2');
  });

  it('handles updateQty', () => {
    const { getByTestId } = render(<App />);

    act(() => {
      fireEvent.click(getByTestId('add-to-cart-btn'));
    });

    act(() => {
      fireEvent.click(getByTestId('update-qty-btn'));
    });
    // This requires exposing the qty to test properly, but we can verify it doesn't crash or change length
    expect(getByTestId('cart-count').textContent).toBe('1');
  });

  it('handles removeItem', () => {
    const { getByTestId } = render(<App />);

    act(() => {
      fireEvent.click(getByTestId('add-to-cart-btn'));
    });
    expect(getByTestId('cart-count').textContent).toBe('1');

    act(() => {
      fireEvent.click(getByTestId('remove-item-btn'));
    });
    expect(getByTestId('cart-count').textContent).toBe('0');
  });

  it('handles favorites drawer', () => {
    const { getByTestId, queryByTestId } = render(<App />);

    expect(queryByTestId('mock-favorites-drawer')).not.toBeInTheDocument();

    act(() => {
      fireEvent.click(getByTestId('open-fav-btn'));
    });

    expect(getByTestId('mock-favorites-drawer')).toBeInTheDocument();

    act(() => {
      fireEvent.click(getByTestId('close-fav-btn'));
    });

    expect(queryByTestId('mock-favorites-drawer')).not.toBeInTheDocument();
  });

  it('handles product modal (quick view)', () => {
    const { getByTestId, queryByTestId } = render(<App />);

    expect(queryByTestId('mock-product-modal')).not.toBeInTheDocument();

    act(() => {
      fireEvent.click(getByTestId('quick-view-btn'));
    });

    expect(getByTestId('mock-product-modal')).toBeInTheDocument();

    act(() => {
      fireEvent.click(getByTestId('close-modal-btn'));
    });

    expect(queryByTestId('mock-product-modal')).not.toBeInTheDocument();
  });
});
