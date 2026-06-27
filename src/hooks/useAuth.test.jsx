import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

describe('useAuth', () => {
  let localStorageMock;
  let getSessionMock;
  let onAuthStateChangeMock;
  let unsubscribeMock;

  beforeEach(() => {
    localStorageMock = (() => {
      let store = {};
      return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => {
          store[key] = value.toString();
        }),
        removeItem: vi.fn((key) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          store = {};
        }),
      };
    })();

    vi.stubGlobal('localStorage', localStorageMock);

    unsubscribeMock = vi.fn();
    getSessionMock = vi.fn().mockResolvedValue({ data: { session: null } });
    onAuthStateChangeMock = vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeMock } }
    });

    supabase.auth.getSession = getSessionMock;
    supabase.auth.onAuthStateChange = onAuthStateChangeMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with null if no cached session in localStorage', async () => {
    let result;
    await act(async () => {
      const hook = renderHook(() => useAuth());
      result = hook.result;
    });

    expect(localStorage.getItem).toHaveBeenCalledWith('hs_auth_session');
    expect(result.current).toBeNull();
  });

  it('initializes with cached session from localStorage', () => {
    const cachedSession = { user: { id: '1', user_metadata: {} } };
    localStorage.setItem('hs_auth_session', JSON.stringify(cachedSession));

    // We cannot wrap renderHook inside act for this exact test if we want to catch the initial state
    // because `act` will flush the `useEffect` that calls `getSession` and overwrites it.
    // Let's defer the getSession resolve so we can check the state BEFORE it resolves.

    let resolveGetSession;
    const promise = new Promise((resolve) => { resolveGetSession = resolve; });
    getSessionMock.mockReturnValue(promise);

    const { result } = renderHook(() => useAuth());

    expect(localStorage.getItem).toHaveBeenCalledWith('hs_auth_session');
    expect(result.current).toEqual(cachedSession);
  });

  it('calls supabase.auth.getSession on mount and processes session', async () => {
    const mockSession = { user: { id: '123', user_metadata: {} } };
    getSessionMock.mockResolvedValueOnce({ data: { session: mockSession } });

    let result;
    await act(async () => {
      const hook = renderHook(() => useAuth());
      result = hook.result;
    });

    await waitFor(() => {
      expect(result.current).toEqual(mockSession);
    });

    expect(getSessionMock).toHaveBeenCalledTimes(1);
    expect(localStorage.setItem).toHaveBeenCalledWith('hs_auth_session', JSON.stringify(mockSession));
  });

  it('subscribes to onAuthStateChange and updates when event fires', async () => {
    let authStateCallback;
    onAuthStateChangeMock.mockImplementation((callback) => {
      authStateCallback = callback;
      return { data: { subscription: { unsubscribe: unsubscribeMock } } };
    });

    let result;
    await act(async () => {
      const hook = renderHook(() => useAuth());
      result = hook.result;
    });

    // Wait for initial getSession to settle
    await waitFor(() => {
        expect(getSessionMock).toHaveBeenCalled();
    });

    const mockSession = { user: { id: '456', user_metadata: {} } };

    await act(async () => {
      authStateCallback('SIGNED_IN', mockSession);
    });

    await waitFor(() => {
      expect(result.current).toEqual(mockSession);
    });
  });

  it('clears session and localStorage when newSession is null', async () => {
    let authStateCallback;
    onAuthStateChangeMock.mockImplementation((callback) => {
      authStateCallback = callback;
      return { data: { subscription: { unsubscribe: unsubscribeMock } } };
    });

    // Start with a valid session in local storage
    const cachedSession = { user: { id: '1', user_metadata: {} } };
    localStorage.setItem('hs_auth_session', JSON.stringify(cachedSession));

    let result;
    await act(async () => {
      const hook = renderHook(() => useAuth());
      result = hook.result;
    });

    await act(async () => {
      authStateCallback('SIGNED_OUT', null);
    });

    await waitFor(() => {
      expect(result.current).toBeNull();
    });

    expect(localStorage.removeItem).toHaveBeenCalledWith('hs_auth_session');
  });

  it('extracts avatar_url from user_metadata', async () => {
    const mockSession = {
      user: {
        id: '123',
        user_metadata: { avatar_url: 'https://example.com/avatar.jpg' }
      }
    };
    getSessionMock.mockResolvedValueOnce({ data: { session: mockSession } });

    let result;
    await act(async () => {
      const hook = renderHook(() => useAuth());
      result = hook.result;
    });

    await waitFor(() => {
      expect(result.current.user.user_metadata.avatar_url).toBe('https://example.com/avatar.jpg');
    });
  });

  it('extracts avatar_url from identities if missing in user_metadata', async () => {
    const mockSession = {
      user: {
        id: '123',
        user_metadata: {},
        identities: [
          { identity_data: { picture: 'https://example.com/ident-avatar.jpg' } }
        ]
      }
    };
    getSessionMock.mockResolvedValueOnce({ data: { session: mockSession } });

    let result;
    await act(async () => {
      const hook = renderHook(() => useAuth());
      result = hook.result;
    });

    await waitFor(() => {
      expect(result.current.user.user_metadata.avatar_url).toBe('https://example.com/ident-avatar.jpg');
    });
  });


  it('logs an error when supabase.auth.getSession throws during initial session check', async () => {
    const mockError = new Error('Session fetch failed');
    getSessionMock.mockResolvedValueOnce({ data: { session: null }, error: mockError });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      renderHook(() => useAuth());
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Auth initialization error:', mockError);
    });

    consoleSpy.mockRestore();
  });

  it('unsubscribes on unmount', async () => {
    let unmountFn;
    await act(async () => {
      const { unmount } = renderHook(() => useAuth());
      unmountFn = unmount;
    });

    unmountFn();

    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });
});
