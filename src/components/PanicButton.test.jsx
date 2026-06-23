import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterAll, beforeAll } from 'vitest';
import PanicButton from './PanicButton';

describe('PanicButton', () => {
  const originalLocation = window.location;

  beforeAll(() => {
    delete window.location;
    window.location = { replace: vi.fn() };
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  beforeEach(() => {
    window.location.replace.mockClear();
  });

  it('renders correctly', () => {
    render(<PanicButton />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls window.location.replace with correct URL when clicked', () => {
    render(<PanicButton />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(window.location.replace).toHaveBeenCalledWith('https://www.google.com');
    expect(window.location.replace).toHaveBeenCalledTimes(1);
  });

  it('calls window.location.replace when Escape key is pressed', () => {
    render(<PanicButton />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(window.location.replace).toHaveBeenCalledWith('https://www.google.com');
    expect(window.location.replace).toHaveBeenCalledTimes(1);
  });

  it('does not call window.location.replace when other keys are pressed', () => {
    render(<PanicButton />);
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(window.location.replace).not.toHaveBeenCalled();
  });

  it('removes event listener on unmount', () => {
    const { unmount } = render(<PanicButton />);
    unmount();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(window.location.replace).not.toHaveBeenCalled();
  });
});
