import { render, screen } from '@testing-library/react';
import ResponsiveImage from './ResponsiveImage';

describe('ResponsiveImage', () => {
  it('returns null when src is falsy or invalid', () => {
    const { container } = render(<ResponsiveImage />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a standard <img> element when src is a string', () => {
    render(<ResponsiveImage src="https://example.com/image.jpg" alt="Example Image" className="my-class" />);

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(img).toHaveAttribute('alt', 'Example Image');
    expect(img).toHaveAttribute('class', 'my-class');
    expect(img).toHaveAttribute('loading', 'lazy'); // Default prop
  });

  it('renders a <picture> element when src is a vite-imagetools object', () => {
    const mockSrc = {
      img: { src: '/path/to/fallback.jpg' },
      sources: {
        webp: '/path/to/image.webp 1w',
        avif: '/path/to/image.avif 1w',
      }
    };

    render(<ResponsiveImage src={mockSrc} alt="Optimized Image" />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/path/to/fallback.jpg');
    expect(img).toHaveAttribute('alt', 'Optimized Image');

    // Test for picture and source elements
    const sources = document.querySelectorAll('source');
    expect(sources).toHaveLength(2);

    expect(sources[0]).toHaveAttribute('type', 'image/webp');
    expect(sources[0]).toHaveAttribute('srcset', '/path/to/image.webp 1w');

    expect(sources[1]).toHaveAttribute('type', 'image/avif');
    expect(sources[1]).toHaveAttribute('srcset', '/path/to/image.avif 1w');
  });

  it('handles array of objects in sources', () => {
    const mockSrc = {
      img: { src: '/path/to/fallback.jpg' },
      sources: {
        webp: [{ src: '/path/to/image1.webp' }, { src: '/path/to/image2.webp' }]
      }
    };

    render(<ResponsiveImage src={mockSrc} alt="Optimized Image Array" />);

    const source = document.querySelector('source');
    expect(source).toBeInTheDocument();
    expect(source).toHaveAttribute('type', 'image/webp');
    expect(source).toHaveAttribute('srcset', '/path/to/image1.webp, /path/to/image2.webp');
  });

  it('handles mixed array in sources', () => {
    const mockSrc = {
      img: { src: '/path/to/fallback.jpg' },
      sources: {
        webp: [{ url: '/path/to/image1.webp' }, '/path/to/image2.webp', { src: '/path/to/image3.webp' }]
      }
    };

    render(<ResponsiveImage src={mockSrc} alt="Optimized Image Mixed Array" />);

    const source = document.querySelector('source');
    expect(source).toBeInTheDocument();
    expect(source).toHaveAttribute('type', 'image/webp');
    expect(source).toHaveAttribute('srcset', '/path/to/image1.webp, /path/to/image2.webp, /path/to/image3.webp');
  });
});
