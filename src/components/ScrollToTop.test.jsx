import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ScrollToTop from './ScrollToTop';

describe('ScrollToTop', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollTo', vi.fn());
    // Initial scroll position
    window.scrollY = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render button initially when scrollY is 0', () => {
    const { queryByRole } = render(<ScrollToTop />);
    expect(queryByRole('button', { name: /scroll to top/i })).not.toBeInTheDocument();
  });

  it('renders button when scrollY is greater than 400', () => {
    const { queryByRole } = render(<ScrollToTop />);
    
    // Simulate scrolling past 400
    act(() => {
      window.scrollY = 450;
      fireEvent.scroll(window);
    });

    const button = queryByRole('button', { name: /scroll to top/i });
    expect(button).toBeInTheDocument();
  });

  it('hides button when scrollY goes back below 400', () => {
    const { queryByRole } = render(<ScrollToTop />);
    
    // Scroll down first
    act(() => {
      window.scrollY = 500;
      fireEvent.scroll(window);
    });
    expect(queryByRole('button', { name: /scroll to top/i })).toBeInTheDocument();

    // Scroll up
    act(() => {
      window.scrollY = 200;
      fireEvent.scroll(window);
    });
    expect(queryByRole('button', { name: /scroll to top/i })).not.toBeInTheDocument();
  });

  it('smoothly scrolls to top when button is clicked', () => {
    const { getByRole } = render(<ScrollToTop />);
    
    // Scroll down
    act(() => {
      window.scrollY = 600;
      fireEvent.scroll(window);
    });

    const button = getByRole('button', { name: /scroll to top/i });
    fireEvent.click(button);

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth'
    });
  });
});
