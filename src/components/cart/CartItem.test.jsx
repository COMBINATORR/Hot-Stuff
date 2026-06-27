import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CartItem from './CartItem';

describe('CartItem', () => {
  const mockItem = {
    id: '1',
    name: 'Test Product',
    price: 1500,
    qty: 2,
    variant: 'Large',
    image: 'test-image.jpg'
  };

  it('renders item details correctly', () => {
    render(<CartItem item={mockItem} handleUpdateQty={vi.fn()} handleRemove={vi.fn()} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Large')).toBeInTheDocument();
    expect(screen.getByText(/1\s*500\s*₸/)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('calls handleUpdateQty when increment/decrement is clicked', () => {
    const handleUpdateQty = vi.fn();
    render(<CartItem item={mockItem} handleUpdateQty={handleUpdateQty} handleRemove={vi.fn()} />);

    const decBtn = screen.getByText('-');
    const incBtn = screen.getByText('+');

    fireEvent.click(decBtn);
    expect(handleUpdateQty).toHaveBeenCalledWith('1', 'Large', 1);

    fireEvent.click(incBtn);
    expect(handleUpdateQty).toHaveBeenCalledWith('1', 'Large', 3);
  });

  it('calls handleRemove when remove button is clicked', () => {
    const handleRemove = vi.fn();
    render(<CartItem item={mockItem} handleUpdateQty={vi.fn()} handleRemove={handleRemove} />);

    const removeBtn = screen.getByRole('button', { name: 'header.remove_item' });
    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledWith('1', 'Large');
  });

  it('renders fallback icon when no image is provided', () => {
    const itemWithoutImage = { ...mockItem, image: null };
    render(<CartItem item={itemWithoutImage} handleUpdateQty={vi.fn()} handleRemove={vi.fn()} />);

    expect(screen.getByText('🌸')).toBeInTheDocument();
  });
});
