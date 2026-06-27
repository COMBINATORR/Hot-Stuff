import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CategorySidebar from './CategorySidebar';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe('CategorySidebar', () => {
  const mockCategories = [
    {
      name: 'Toys',
      slug: 'toys',
      subcategories: [
        { name: 'Action Figures', slug: 'action-figures' },
        { name: 'Dolls', slug: 'dolls' },
      ],
    },
    {
      name: 'Books',
      slug: 'books',
      subcategories: [],
    },
  ];

  it('renders loading state correctly', () => {
    render(<CategorySidebar loading={true} categories={[]} />);
    expect(screen.getByText('catalog.loading_categories')).toBeInTheDocument();
  });

  it('renders categories correctly', () => {
    render(<CategorySidebar loading={false} categories={mockCategories} expandedSidebarCats={{}} />);
    expect(screen.getByText('MENU.TOYS')).toBeInTheDocument();
    expect(screen.getByText('MENU.BOOKS')).toBeInTheDocument();
  });

  it('calls handleCategoryClick when a category without subcategories is clicked', () => {
    const handleCategoryClick = vi.fn();
    render(
      <CategorySidebar
        loading={false}
        categories={mockCategories}
        expandedSidebarCats={{}}
        handleCategoryClick={handleCategoryClick}
      />
    );

    fireEvent.click(screen.getByText('MENU.BOOKS'));
    expect(handleCategoryClick).toHaveBeenCalledWith('books');
  });

  it('calls toggleSidebarCat when a category with subcategories is clicked', () => {
    const toggleSidebarCat = vi.fn();
    render(
      <CategorySidebar
        loading={false}
        categories={mockCategories}
        expandedSidebarCats={{}}
        toggleSidebarCat={toggleSidebarCat}
      />
    );

    fireEvent.click(screen.getByText('MENU.TOYS'));
    expect(toggleSidebarCat).toHaveBeenCalledWith('toys');
  });

  it('renders subcategories when a category is expanded', () => {
    render(
      <CategorySidebar
        loading={false}
        categories={mockCategories}
        expandedSidebarCats={{ toys: true }}
      />
    );

    expect(screen.getByText('MENU.ACTION FIGURES')).toBeInTheDocument();
    expect(screen.getByText('MENU.DOLLS')).toBeInTheDocument();
  });

  it('calls handleCategoryClick when a subcategory is clicked', () => {
    const handleCategoryClick = vi.fn();
    render(
      <CategorySidebar
        loading={false}
        categories={mockCategories}
        expandedSidebarCats={{ toys: true }}
        handleCategoryClick={handleCategoryClick}
      />
    );

    fireEvent.click(screen.getByText('MENU.ACTION FIGURES'));
    expect(handleCategoryClick).toHaveBeenCalledWith('action-figures');
  });

  it('calls handleCategoryClick when "View All" is clicked in expanded category', () => {
    const handleCategoryClick = vi.fn();
    render(
      <CategorySidebar
        loading={false}
        categories={mockCategories}
        expandedSidebarCats={{ toys: true }}
        handleCategoryClick={handleCategoryClick}
      />
    );

    fireEvent.click(screen.getByText('catalog.view_all'));
    expect(handleCategoryClick).toHaveBeenCalledWith('toys');
  });

  it('calls handleCategoryClick when popular is clicked', () => {
    const handleCategoryClick = vi.fn();
    render(
      <CategorySidebar
        loading={false}
        categories={mockCategories}
        expandedSidebarCats={{}}
        handleCategoryClick={handleCategoryClick}
      />
    );

    fireEvent.click(screen.getByText('catalog.popular_upper'));
    expect(handleCategoryClick).toHaveBeenCalledWith('all');
  });

  it('calls handleCategoryClick when new is clicked', () => {
    const handleCategoryClick = vi.fn();
    render(
      <CategorySidebar
        loading={false}
        categories={mockCategories}
        expandedSidebarCats={{}}
        handleCategoryClick={handleCategoryClick}
      />
    );

    fireEvent.click(screen.getByText('catalog.new_upper'));
    expect(handleCategoryClick).toHaveBeenCalledWith('new');
  });
});
