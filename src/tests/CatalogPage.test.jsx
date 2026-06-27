import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CatalogPage from '../pages/CatalogPage';
import { CategoriesProvider } from '../contexts/CategoriesContext';
import { supabase } from '../lib/supabase';
import { vi } from 'vitest';

// Mock the components that rely on the products data or translation
vi.mock('../data/products', () => ({
  ALL_PRODUCTS: [
    { id: 1, name: 'Vibrator 1', category: 'vibrators', categoryLabel: 'ВИБРАТОРЫ', price: 10000, isNew: true },
    { id: 2, name: 'Massager 1', category: 'massagers', categoryLabel: 'МАССАЖЕРЫ', price: 20000, discountPrice: 15000 },
    { id: 3, name: 'Anal Plug 1', category: 'anal', categoryLabel: 'АНАЛЬНЫЕ ПРОБКИ', price: 5000, stimulation: ['anal'] }
  ]
}));

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn()
      }))
    }))
  }
}));

describe('CatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Default mock implementation for Supabase
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            { id: 1, name: 'Women Toys', slug: 'toys-women', subcategories: [] },
            { id: 2, name: 'Men Toys', slug: 'toys-men', subcategories: [] }
          ],
          error: null
        })
      })
    });
  });

  const renderComponent = (initialEntries = ['/catalog']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/catalog" element={<CategoriesProvider><CatalogPage /></CategoriesProvider>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders correctly and fetches categories from supabase', async () => {
    await act(async () => {
      renderComponent();
    });

    // Check if fetch was called
    expect(supabase.from).toHaveBeenCalledWith('categories');

    // Wait for the products to render (since ALL_PRODUCTS has 3 items, but only women toys are shown by default)
    // "toys-women" category function in CatalogPage.jsx matches p.category === 'vibrators' && p.categoryLabel !== 'АНАЛЬНЫЕ ПРОБКИ'
    // This should match 'Vibrator 1'
    await waitFor(() => {
      expect(screen.getByText('Vibrator 1')).toBeInTheDocument();
    });
  });

  it('initializes active category from URL params', async () => {
    // Navigate with ?cat=toys-men which matches p.category === 'massagers'
    await act(async () => {
      renderComponent(['/catalog?cat=toys-men']);
    });

    await waitFor(() => {
      expect(screen.getByText('Massager 1')).toBeInTheDocument();
      // Vibrator 1 should not be there because we are in men toys
      expect(screen.queryByText('Vibrator 1')).not.toBeInTheDocument();
    });
  });

  it('displays not found message when filters yield empty results', async () => {
    await act(async () => {
      renderComponent(['/catalog?cat=bdsm-fetish']);
    });

    // bdsm-fetish returns false for all products in our mock
    await waitFor(() => {
      expect(screen.getByText('catalog.not_found')).toBeInTheDocument();
      expect(screen.getByText('catalog.reset_filters')).toBeInTheDocument();
    });
  });

  it('toggles filter drawer', async () => {
    await act(async () => {
      renderComponent();
    });

    // Find the filter button (it has text 'catalog.filters')
    const filterButton = screen.getByText('catalog.filters');

    await act(async () => {
      fireEvent.click(filterButton);
    });

    // Drawer header 'catalog.filters_upper' should be visible
    expect(screen.getByText('catalog.filters_upper')).toBeInTheDocument();

    // Find and click the close button
    const closeButton = screen.getByText('close');
    await act(async () => {
      fireEvent.click(closeButton);
    });

    // Wait for drawer to close (it might be unmounted or hidden)
    await waitFor(() => {
      expect(screen.queryByText('catalog.filters_upper')).not.toBeInTheDocument();
    });
  });

  it('handles invalid cached products in localStorage without crashing', async () => {
    // Set invalid JSON in localStorage to trigger the parsing error for products
    localStorage.setItem('hs_products', 'invalid_json_for_products{]');

    // Spy on console.error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      renderComponent();
    });

    // Check if error was logged
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to parse catalog products',
      expect.any(Error)
    );

    // Clean up
    consoleSpy.mockRestore();
  });
});
