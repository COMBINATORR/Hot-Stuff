import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ProductGrid from './ProductGrid';

const { mockProducts } = vi.hoisted(() => {
  return {
    mockProducts: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Test Product ${i + 1}`,
      category: `Category ${i + 1}`,
      price: 1000 + i,
      colors: i % 2 === 0 ? [{ name: 'Test Color', hex: '#000' }] : [], // some with colors, some without
      image: `image${i + 1}.jpg`
    }))
  };
});

vi.mock('../data/products', () => ({
  ALL_PRODUCTS: mockProducts
}));

describe('ProductGrid', () => {
  const mockOnSelectQuickView = vi.fn();
  const mockOnAddToCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the title and products correctly', () => {
    render(<ProductGrid onSelectQuickView={mockOnSelectQuickView} onAddToCart={mockOnAddToCart} />);

    // Check title (translation is mocked to return key)
    expect(screen.getByText('catalog.title')).toBeInTheDocument();

    // Check if products are rendered (only 8 should be rendered)
    for (let i = 0; i < 8; i++) {
      expect(screen.getByText(`Test Product ${i + 1}`)).toBeInTheDocument();
    }
  });

  it('limits the number of rendered products to 8', () => {
    render(<ProductGrid onSelectQuickView={mockOnSelectQuickView} onAddToCart={mockOnAddToCart} />);

    // Test Product 9 and 10 should not be in the document
    expect(screen.queryByText('Test Product 9')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Product 10')).not.toBeInTheDocument();

    const quickViewButtons = screen.getAllByText('product.quick_view');
    expect(quickViewButtons).toHaveLength(8); // Desktop buttons
  });

  it('calls onSelectQuickView when quick view button is clicked', () => {
    render(<ProductGrid onSelectQuickView={mockOnSelectQuickView} onAddToCart={mockOnAddToCart} />);

    const quickViewButtons = screen.getAllByText('product.quick_view');

    // Click the first product's desktop quick view button
    fireEvent.click(quickViewButtons[0]);

    expect(mockOnSelectQuickView).toHaveBeenCalledTimes(1);
    expect(mockOnSelectQuickView).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('calls onSelectQuickView when mobile quick view button is clicked', () => {
    render(<ProductGrid onSelectQuickView={mockOnSelectQuickView} onAddToCart={mockOnAddToCart} />);

    const mobileQuickViewButtons = screen.getAllByText('visibility');

    // Click the first product's mobile quick view button
    fireEvent.click(mobileQuickViewButtons[0]);

    expect(mockOnSelectQuickView).toHaveBeenCalledTimes(1);
    expect(mockOnSelectQuickView).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('calls onAddToCart with product, correct color, and One Size when add to cart is clicked (with colors)', () => {
    render(<ProductGrid onSelectQuickView={mockOnSelectQuickView} onAddToCart={mockOnAddToCart} />);

    const addToCartButtons = screen.getAllByText('product.add_to_cart');

    // Product 1 (index 0) has colors
    fireEvent.click(addToCartButtons[0]);

    expect(mockOnAddToCart).toHaveBeenCalledTimes(1);
    expect(mockOnAddToCart).toHaveBeenCalledWith(
      mockProducts[0],
      { name: 'Test Color', hex: '#000' },
      'One Size'
    );
  });

  it('calls onAddToCart with product, default color, and One Size when add to cart is clicked (without colors)', () => {
    render(<ProductGrid onSelectQuickView={mockOnSelectQuickView} onAddToCart={mockOnAddToCart} />);

    const addToCartButtons = screen.getAllByText('product.add_to_cart');

    // Product 2 (index 1) has no colors
    fireEvent.click(addToCartButtons[1]);

    expect(mockOnAddToCart).toHaveBeenCalledTimes(1);
    expect(mockOnAddToCart).toHaveBeenCalledWith(
      mockProducts[1],
      { name: 'Default', hex: '#fff' },
      'One Size'
    );
  });

  it('calls onAddToCart when mobile add to cart button is clicked', () => {
    render(<ProductGrid onSelectQuickView={mockOnSelectQuickView} onAddToCart={mockOnAddToCart} />);

    const mobileAddToCartButtons = screen.getAllByText('shopping_cart');

    // Click the first product's mobile add to cart button
    fireEvent.click(mobileAddToCartButtons[0]);

    expect(mockOnAddToCart).toHaveBeenCalledTimes(1);
    expect(mockOnAddToCart).toHaveBeenCalledWith(
      mockProducts[0],
      { name: 'Test Color', hex: '#000' },
      'One Size'
    );
  });
});
