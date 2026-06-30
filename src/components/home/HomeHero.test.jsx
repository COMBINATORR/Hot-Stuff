import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import HomeHero from './HomeHero';

// Explicitly mocking framer-motion and react-i18next as requested
vi.mock('framer-motion', () => {
  const createElement = React.createElement;
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }, ref) => {
        const { animate, initial, exit, whileHover, variants, transition, ...rest } = props;
        return createElement('div', { ref, ...rest }, children);
      }),
      h1: React.forwardRef(({ children, ...props }, ref) => {
        const { animate, initial, exit, whileHover, variants, transition, ...rest } = props;
        return createElement('h1', { ref, ...rest }, children);
      }),
      p: React.forwardRef(({ children, ...props }, ref) => {
        const { animate, initial, exit, whileHover, variants, transition, ...rest } = props;
        return createElement('p', { ref, ...rest }, children);
      }),
    },
    AnimatePresence: ({ children }) => children,
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'ru' }
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

describe('HomeHero', () => {
  it('renders correctly', () => {
    render(
      <MemoryRouter>
        <HomeHero />
      </MemoryRouter>
    );

    // Check for headline
    expect(screen.getByText('HOT STUFF')).toBeInTheDocument();

    // Check for slogan (using mock t function)
    expect(screen.getByText('home.magic_sensuality')).toBeInTheDocument();

    // Check for CTA link
    const ctaLink = screen.getByRole('link', { name: 'checkout.back_to_catalog' });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute('href', '/catalog');

    // Check for poster image
    const posterImg = screen.getByAltText('Hero Background Poster');
    expect(posterImg).toBeInTheDocument();

    // Check for fallback image
    const fallbackImg = screen.getByAltText('Hero Fallback');
    expect(fallbackImg).toBeInTheDocument();
  });

  it('updates video opacity when video plays', () => {
    const { container } = render(
      <MemoryRouter>
        <HomeHero />
      </MemoryRouter>
    );

    // Find the video element
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();

    // Initially should have opacity-0 class
    expect(video.className).toContain('opacity-0');
    expect(video.className).not.toContain('opacity-100');

    // Fire the onPlay event
    fireEvent.play(video);

    // Should now have opacity-100 class
    expect(video.className).toContain('opacity-100');
    expect(video.className).not.toContain('opacity-0');
  });
});
