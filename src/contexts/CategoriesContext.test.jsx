import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CategoriesProvider, useCategories } from './CategoriesContext';
import { supabase } from '../lib/supabase';

// Mock supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(),
      })),
    })),
  },
}));

// Test component to consume context
const TestComponent = () => {
  const { categories, loading, error } = useCategories();

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error ? error.message : 'null'}</div>
      <div data-testid="categories-length">{categories.length}</div>
      {categories.map(c => (
        <div key={c.id} data-testid={`category-${c.id}`}>
          {c.name} - {c.subcategories ? c.subcategories.map(s => s.id).join(',') : 'none'}
        </div>
      ))}
    </div>
  );
};

describe('CategoriesContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('provides initial loading state', () => {
    // Setup a delayed promise so we can observe the loading state
    const orderMock = vi.fn().mockReturnValue(new Promise(() => {}));
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    supabase.from.mockReturnValue({ select: selectMock });

    render(
      <CategoriesProvider>
        <TestComponent />
      </CategoriesProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(screen.getByTestId('categories-length')).toHaveTextContent('0');
    expect(screen.getByTestId('error')).toHaveTextContent('null');
  });

  it('loads instantly from localStorage cache if available', async () => {
    const cachedData = [
      { id: 1, name: 'Cached Cat' }
    ];
    localStorage.setItem('hs_categories', JSON.stringify(cachedData));

    // Setup network fetch to take some time to ensure we see cached data first
    const orderMock = vi.fn().mockReturnValue(new Promise(resolve => setTimeout(() => resolve({ data: [], error: null }), 100)));
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    supabase.from.mockReturnValue({ select: selectMock });

    render(
      <CategoriesProvider>
        <TestComponent />
      </CategoriesProvider>
    );

    // Should load instantly from cache
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('categories-length')).toHaveTextContent('1');
    expect(screen.getByTestId('category-1')).toHaveTextContent('Cached Cat - none');
  });

  it('fetches fresh data from Supabase and sorts subcategories', async () => {
    const mockData = [
      {
        id: '2',
        name: 'Cat 2',
        subcategories: [{ id: '10' }, { id: '2' }]
      },
      {
        id: '1',
        name: 'Cat 1',
        subcategories: null
      }
    ];

    const orderMock = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    supabase.from.mockReturnValue({ select: selectMock });

    render(
      <CategoriesProvider>
        <TestComponent />
      </CategoriesProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('categories-length')).toHaveTextContent('2');
    // Ensure subcategories were sorted numerically
    expect(screen.getByTestId('category-2')).toHaveTextContent('Cat 2 - 2,10');
    expect(screen.getByTestId('category-1')).toHaveTextContent('Cat 1 - none');

    // Verify localStorage was updated
    const savedCache = JSON.parse(localStorage.getItem('hs_categories'));
    expect(savedCache).toHaveLength(2);
    expect(savedCache[0].id).toBe('2');
    expect(savedCache[0].subcategories[0].id).toBe('2'); // sorted
    expect(savedCache[0].subcategories[1].id).toBe('10'); // sorted
  });

  it('handles errors from Supabase fetching', async () => {
    const mockError = new Error('Network error');

    const orderMock = vi.fn().mockResolvedValue({ data: null, error: mockError });
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    supabase.from.mockReturnValue({ select: selectMock });

    render(
      <CategoriesProvider>
        <TestComponent />
      </CategoriesProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('error')).toHaveTextContent('Network error');
    expect(screen.getByTestId('categories-length')).toHaveTextContent('0');
  });

  it('handles invalid JSON in localStorage safely', async () => {
    localStorage.setItem('hs_categories', 'invalid json data');

    // We should fallback to network fetch if cache fails
    const mockData = [{ id: '1', name: 'Fresh Data', subcategories: null }];
    const orderMock = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    supabase.from.mockReturnValue({ select: selectMock });

    // Mock console.error to avoid test output noise
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <CategoriesProvider>
        <TestComponent />
      </CategoriesProvider>
    );

    // Initial loading should be true because cache parsing failed
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('categories-length')).toHaveTextContent('1');
    expect(screen.getByTestId('category-1')).toHaveTextContent('Fresh Data - none');

    consoleSpy.mockRestore();
  });
});