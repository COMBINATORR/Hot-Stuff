import { render, screen, fireEvent } from '@testing-library/react';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ProductCard from './ProductCard';

// Mock ResponsiveImage to just render an img tag to easily verify src
vi.mock('../ResponsiveImage', () => {
  return {
    default: ({ src, alt, className }) => {
      // Handle the case where src is a picture object in vite-imagetools (mock)
      const imgSrc = typeof src === 'string' ? src : (src?.img?.src || 'fallback');
      return <img data-testid="responsive-image" src={imgSrc} alt={alt} className={className} />;
    }
  };
});

const mockProduct = {
  id: '1',
  name: 'Test Product',
  price: 1000,
  categoryLabel: 'Test Category',
  image: 'default.jpg',
  gallery: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
  colors: [
    { name: 'Red', hex: '#FF0000' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Green', hex: '#00FF00' },
  ]
};

const renderWithProviders = (ui) => {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </HelmetProvider>
  );
};

describe('ProductCard Component', () => {
  const setSelectedPreviewProduct = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default image from gallery', () => {
    renderWithProviders(
      <ProductCard product={mockProduct} setSelectedPreviewProduct={setSelectedPreviewProduct} />
    );
    const img = screen.getByTestId('responsive-image');
    expect(img).toHaveAttribute('src', 'image1.jpg');
  });

  it('falls back to product.image if gallery is empty', () => {
    const productNoGallery = { ...mockProduct, gallery: [] };
    renderWithProviders(
      <ProductCard product={productNoGallery} setSelectedPreviewProduct={setSelectedPreviewProduct} />
    );
    const img = screen.getByTestId('responsive-image');
    expect(img).toHaveAttribute('src', 'default.jpg');
  });

  it('renders without crashing when colors is missing', () => {
    const productNoColors = { ...mockProduct, colors: undefined };
    renderWithProviders(
      <ProductCard product={productNoColors} setSelectedPreviewProduct={setSelectedPreviewProduct} />
    );
    const img = screen.getByTestId('responsive-image');
    expect(img).toHaveAttribute('src', 'image1.jpg');
    // Ensure no color buttons are rendered
    expect(screen.queryByRole('button', { name: 'Red' })).not.toBeInTheDocument();
  });

  it('shows next image from gallery when hovered', () => {
    renderWithProviders(
      <ProductCard product={mockProduct} setSelectedPreviewProduct={setSelectedPreviewProduct} />
    );
    const cardContainer = screen.getByText('Test Product').closest('.group');

    // Initial state
    let img = screen.getByTestId('responsive-image');
    expect(img).toHaveAttribute('src', 'image1.jpg');

    // Hover state
    fireEvent.mouseEnter(cardContainer);
    expect(img).toHaveAttribute('src', 'image2.jpg');

    // Mouse leave state
    fireEvent.mouseLeave(cardContainer);
    expect(img).toHaveAttribute('src', 'image1.jpg');
  });

  it('shows product.image when hovered if gallery has only 1 image', () => {
    const productOneImage = { ...mockProduct, gallery: ['single.jpg'] };
    renderWithProviders(
      <ProductCard product={productOneImage} setSelectedPreviewProduct={setSelectedPreviewProduct} />
    );
    const cardContainer = screen.getByText('Test Product').closest('.group');

    let img = screen.getByTestId('responsive-image');
    expect(img).toHaveAttribute('src', 'single.jpg');

    fireEvent.mouseEnter(cardContainer);
    expect(img).toHaveAttribute('src', 'default.jpg');
  });

  it('changes displayed image when clicking on a color swatch', () => {
    renderWithProviders(
      <ProductCard product={mockProduct} setSelectedPreviewProduct={setSelectedPreviewProduct} />
    );

    // Click Blue swatch (index 1)
    const blueSwatch = screen.getByRole('button', { name: 'Blue' });
    fireEvent.click(blueSwatch);

    let img = screen.getByTestId('responsive-image');
    expect(img).toHaveAttribute('src', 'image2.jpg');

    // Hover after clicking swatch (should show next image, index 2)
    const cardContainer = screen.getByText('Test Product').closest('.group');
    fireEvent.mouseEnter(cardContainer);
    expect(img).toHaveAttribute('src', 'image3.jpg');
  });

  describe('Touch Interactions', () => {
    it('swipes left to show next image', () => {
      renderWithProviders(
        <ProductCard product={mockProduct} setSelectedPreviewProduct={setSelectedPreviewProduct} />
      );

      const linkContainer = screen.getAllByRole('link')[0];

      // Simulate swipe left (touchStartX: 100, touchEndX: 50 => diff = 50 > 40)
      fireEvent.touchStart(linkContainer, { targetTouches: [{ clientX: 100 }] });
      fireEvent.touchEnd(linkContainer, { changedTouches: [{ clientX: 50 }] });

      const img = screen.getByTestId('responsive-image');
      // Should show index 1
      expect(img).toHaveAttribute('src', 'image2.jpg');
    });

    it('swipes right to show previous image', () => {
      renderWithProviders(
        <ProductCard product={mockProduct} setSelectedPreviewProduct={setSelectedPreviewProduct} />
      );

      const linkContainer = screen.getAllByRole('link')[0];

      // Simulate swipe right (touchStartX: 50, touchEndX: 100 => diff = -50 < -40)
      fireEvent.touchStart(linkContainer, { targetTouches: [{ clientX: 50 }] });
      fireEvent.touchEnd(linkContainer, { changedTouches: [{ clientX: 100 }] });

      const img = screen.getByTestId('responsive-image');
      // wrap around to index 2
      expect(img).toHaveAttribute('src', 'image3.jpg');
    });

    it('does not change image if swipe distance is <= 40', () => {
      renderWithProviders(
        <ProductCard product={mockProduct} setSelectedPreviewProduct={setSelectedPreviewProduct} />
      );

      const linkContainer = screen.getAllByRole('link')[0];

      // Simulate short swipe (diff = 30)
      fireEvent.touchStart(linkContainer, { targetTouches: [{ clientX: 100 }] });
      fireEvent.touchEnd(linkContainer, { changedTouches: [{ clientX: 70 }] });

      const img = screen.getByTestId('responsive-image');
      expect(img).toHaveAttribute('src', 'image1.jpg'); // Remains at index 0
    });

    it('does nothing when swiping if gallery length is <= 1', () => {
      const productOneImage = { ...mockProduct, gallery: ['single.jpg'] };
      renderWithProviders(
        <ProductCard product={productOneImage} setSelectedPreviewProduct={setSelectedPreviewProduct} />
      );

      const linkContainer = screen.getAllByRole('link')[0];

      fireEvent.touchStart(linkContainer, { targetTouches: [{ clientX: 100 }] });
      fireEvent.touchEnd(linkContainer, { changedTouches: [{ clientX: 50 }] });

      const img = screen.getByTestId('responsive-image');
      expect(img).toHaveAttribute('src', 'single.jpg');
    });
  });

  it('calls setSelectedPreviewProduct on preview button click', () => {
    renderWithProviders(
      <ProductCard product={mockProduct} setSelectedPreviewProduct={setSelectedPreviewProduct} />
    );

    // The button has "ПРЕДПРОСМОТР" (or whatever t returns, our mock returns the key if not set, or we can just grab it by text)
    // In our mock, t(key, default) might just return key, let's query by role instead.
    // actually our mock is t: (key) => key. So the text would be 'product.preview'
    const previewBtn = screen.getByRole('button', { name: 'product.preview' });
    fireEvent.click(previewBtn);

    expect(setSelectedPreviewProduct).toHaveBeenCalledWith(mockProduct);
  });
});
