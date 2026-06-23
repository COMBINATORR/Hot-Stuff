import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import ProductPage from './ProductPage';

// Mock react-i18next so that we can provide an i18n object with language property
vi.mock('react-i18next', async () => {
  const originalModule = await vi.importActual('react-i18next');
  return {
    ...originalModule,
    useTranslation: () => ({
      t: (key, ...args) => {
        if (key === 'product.color_label' && args[0] && args[0].color) {
            return `Color: ${args[0].color}`;
        }
        if (args.length > 0 && typeof args[0] === 'string') {
          return args[0];
        }
        return key;
      },
      i18n: { language: 'en' }
    }),
  };
});

// Define hoisted mocks first!
const { mockProducts } = vi.hoisted(() => {
  return {
    mockProducts: [
      {
        id: 1,
        name: 'INA™ THRUST',
        price: 119500,
        oldPrice: 159000,
        category: 'vibrators',
        categoryLabel: 'ВИБРАТОРЫ-КРОЛИКИ',
        image: 'image1.jpg',
        gallery: ['image1.jpg', 'image2.jpg'],
        colors: [
          { name: 'Midnight', hex: '#111111' },
          { name: 'Deep Rose', hex: '#b5585d' }
        ],
        description: 'Test description 1',
        emoji: '🐰',
        features: ['cruise_control'],
        specs: {
            material: 'Test material'
        }
      },
      {
        id: 2,
        name: 'Test Product 2',
        price: 50000,
        category: 'massagers',
        categoryLabel: 'МАССАЖЕРЫ',
        image: 'image3.jpg',
        description: 'Test description 2',
        emoji: '⭐',
        features: [],
        specs: {}
      }
    ]
  };
});

vi.mock('../data/products', () => ({
  ALL_PRODUCTS: mockProducts
}));

// Mock ResponsiveImage to avoid loading real images
vi.mock('../components/ResponsiveImage', () => ({
  default: ({ src, alt, className }) => <img src={src} alt={alt} className={className} data-testid="responsive-image" />
}));

// Mock Breadcrumbs
vi.mock('../components/Breadcrumbs', () => ({
  default: () => <div data-testid="breadcrumbs">Breadcrumbs</div>
}));

describe('ProductPage', () => {
  const mockOnAddToCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (initialRoute = '/product/1') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/product/:id" element={<ProductPage onAddToCart={mockOnAddToCart} />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders product details correctly', () => {
    renderWithRouter('/product/1');
    expect(screen.getByText('INA™ THRUST')).toBeInTheDocument();
    expect(screen.getByText('119 500 ₸')).toBeInTheDocument();
    expect(screen.getByText('159 000 ₸')).toBeInTheDocument();
  });

  it('falls back to the first product if id is not found', () => {
    renderWithRouter('/product/999');
    expect(screen.getByText('INA™ THRUST')).toBeInTheDocument();
  });

  it('calls onAddToCart with correct details when Add to Cart is clicked', () => {
    renderWithRouter('/product/1');
    const addToCartButtons = screen.getAllByText('product.add_to_cart');
    fireEvent.click(addToCartButtons[0]);

    expect(mockOnAddToCart).toHaveBeenCalledWith({
      id: 1,
      name: 'INA™ THRUST',
      price: 119500,
      emoji: '🐰',
      variant: 'Midnight',
      qty: 1,
      image: 'image1.jpg'
    });
  });

  it('updates selected color when a color button is clicked', () => {
    renderWithRouter('/product/1');

    // Initial color should be 'Midnight'
    expect(screen.getByText(/Midnight/i)).toBeInTheDocument();

    // Find the 'Deep Rose' button (the second color button)
    // The component maps colors to buttons with background color set to color hex
    const colorButtons = screen.getAllByRole('button').filter(b => b.className.includes('rounded-full') && !b.className.includes('bg-neutral-800'));

    // The second color is Deep Rose
    fireEvent.click(colorButtons[1]);

    // Now the selected color text should show 'Deep Rose'
    expect(screen.getByText(/Deep Rose/i)).toBeInTheDocument();
  });

  it('adds a review correctly', () => {
    // Override window.alert since the form submission checks for required fields and we might trigger alert if empty
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderWithRouter('/product/1');

    // Fill out the review form
    // Let's use getByPlaceholderText since it might be easier
    const nameInput = screen.getByPlaceholderText('product.form_name_placeholder');
    const reviewInput = screen.getByPlaceholderText('product.form_placeholder');
    const submitButton = screen.getByText('product.form_submit');

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(reviewInput, { target: { value: 'This is a test review!' } });

    fireEvent.click(submitButton);

    // Check if the review was added (should be visible in the list)
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('This is a test review!')).toBeInTheDocument();

    alertMock.mockRestore();
  });

  it('switches images in gallery', () => {
    renderWithRouter('/product/1');

    const image = screen.getAllByTestId('responsive-image')[0];
    expect(image).toHaveAttribute('src', 'image1.jpg');

    // In our component, gallery dots are buttons without text or role='button' with chevron
    // Wait, let's find the dots
    const dots = screen.getAllByRole('button').filter(b => b.className.includes('w-2 h-2'));

    if (dots.length > 1) {
        fireEvent.click(dots[1]);
        expect(image).toHaveAttribute('src', 'image2.jpg');
    }
  });
});
