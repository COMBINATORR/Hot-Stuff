import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';

vi.mock('../data/products', () => ({
  ALL_PRODUCTS: [
    { id: 1, name: 'Product 1', category: 'vibrators', categoryLabel: 'ВИБРАТОРЫ' },
    { id: 2, name: 'Product 2', category: 'massagers', categoryLabel: 'МАССАЖЕРЫ' },
    { id: 3, name: 'Product 3', category: 'couples', categoryLabel: 'ДЛЯ ПАР' },
    { id: 4, name: 'Product 4', category: 'anal', categoryLabel: 'АНАЛЬНЫЕ ПРОБКИ' },
    { id: 5, name: 'Product 5', category: 'other', categoryLabel: 'TEST-LABEL' }
  ]
}));

describe('Breadcrumbs - Product Page Logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders "toys-women" parent category link for default product category', () => {
    render(
      <MemoryRouter initialEntries={['/product/1']}>
        <Breadcrumbs />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: 'menu.игрушки для женщин' })).toHaveAttribute('href', '/catalog?cat=toys-women');
  });

  it('renders "toys-men" parent category link for massagers', () => {
    render(
      <MemoryRouter initialEntries={['/product/2']}>
        <Breadcrumbs />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: 'menu.игрушки для мужчин' })).toHaveAttribute('href', '/catalog?cat=toys-men');
  });

  it('renders "toys-couples" parent category link for couples category', () => {
    render(
      <MemoryRouter initialEntries={['/product/3']}>
        <Breadcrumbs />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: 'menu.игрушки для пар' })).toHaveAttribute('href', '/catalog?cat=toys-couples');
  });

  it('renders "toys-anal" parent category link for anal label', () => {
    render(
      <MemoryRouter initialEntries={['/product/4']}>
        <Breadcrumbs />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: 'menu.анальные игрушки' })).toHaveAttribute('href', '/catalog?cat=toys-anal');
  });

  it('renders subcategory link when product label matches cached subcategory', () => {
    localStorage.setItem('hs_categories', JSON.stringify([
      { subcategories: [{ name: 'TEST-LABEL', slug: 'test-subcat-slug' }] }
    ]));

    render(
      <MemoryRouter initialEntries={['/product/5']}>
        <Breadcrumbs />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'menu.test-label' })).toHaveAttribute('href', '/catalog?cat=test-subcat-slug');
  });

  it('renders product ID as final breadcrumb when product is not found', () => {
    render(
      <MemoryRouter initialEntries={['/product/999']}>
        <Breadcrumbs />
      </MemoryRouter>
    );

    expect(screen.getByText('999')).toBeInTheDocument();
    // Since it's the last item, it's rendered as text span with class text-primary, not a link.
    expect(screen.getByText('999').tagName).toBe('SPAN');
    expect(screen.getByText('999')).toHaveClass('text-primary');
  });
});
