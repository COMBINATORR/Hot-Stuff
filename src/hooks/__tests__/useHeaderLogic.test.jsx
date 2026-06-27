import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useHeaderLogic } from '../useHeaderLogic';
import { supabase } from '../../lib/supabase';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/', search: '', hash: '' }),
}));

vi.mock('../useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      signOut: vi.fn(),
    },
  },
}));

describe('useHeaderLogic testing improvements', () => {
  const mockT = vi.fn((key, def) => def);
  const mockI18n = {
    changeLanguage: vi.fn(),
    language: 'ru',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('tests the error path in handleHeaderLogic by injecting invalid JSON into localStorage before mounting the hook, then asserting that it falls back to default empty state gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // The issue description mentions "recent searches" but the actual code
    // uses 'hs_categories' and 'categories' state in useHeaderLogic.js:75
    localStorage.setItem('hs_categories', 'invalid json data');

    const { result } = renderHook(() => useHeaderLogic({ i18n: mockI18n, t: mockT }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Header] Error parsing cached categories:',
        expect.any(SyntaxError)
      );
    });

    expect(result.current.categories).toEqual([]);

    consoleSpy.mockRestore();
  });
});
