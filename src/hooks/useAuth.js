import { useState, useEffect, startTransition } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const getSessionFromStorage = () => null;

  const [session, setSession] = useState(getSessionFromStorage);

  const processAndSetSession = (newSession) => {
    // If there is no Supabase session, try to fall back to the mock session in localStorage
    let activeSession = newSession;
    if (!activeSession) {
      activeSession = getSessionFromStorage();
    }

    if (!activeSession) {
      startTransition(() => {
        setSession(null);
      });
      return;
    }

    // Unify user profile state across different identities
    let avatar_url = activeSession.user?.user_metadata?.avatar_url || activeSession.user?.user_metadata?.picture;

    // Yandex profile picture fallback checks
    const meta = activeSession.user?.user_metadata || {};
    if (!avatar_url && meta.default_avatar_id) {
      avatar_url = `https://avatars.yandex.net/get-yapic/${meta.default_avatar_id}/islands-200`;
    } else if (!avatar_url && meta.avatar_id) {
      avatar_url = `https://avatars.yandex.net/get-yapic/${meta.avatar_id}/islands-200`;
    }

    // If not found in top-level metadata, search identities (fixes Email OTP missing avatar)
    if (!avatar_url && activeSession.user?.identities?.length > 0) {
      for (const identity of activeSession.user.identities) {
        const idAvatar = identity.identity_data?.avatar_url || identity.identity_data?.picture;
        if (idAvatar) {
          avatar_url = idAvatar;
          break;
        }
      }
    }

    // Ensure session object holds the recovered avatar URL
    if (avatar_url && activeSession.user) {
      if (!activeSession.user.user_metadata) {
        activeSession.user.user_metadata = {};
      }
      activeSession.user.user_metadata.avatar_url = avatar_url;
    }

    startTransition(() => {
      setSession(activeSession);
    });


  };

  useEffect(() => {
    // Check initial session
    const initAuth = async () => {
      try {
        const { data: { session: sbSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        processAndSetSession(sbSession);
      } catch (e) {
        console.error('Auth initialization error:', e);
      }
    };
    initAuth();

    // Listen to Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sbSession) => {
      // If signed out, remove the cached auth session
      if (_event === 'SIGNED_OUT') {

        startTransition(() => {
          setSession(null);
        });
      } else {
        processAndSetSession(sbSession);
      }
    });

    // Listen to custom auth changes (mock login/logout)
    const handleCustomAuthChange = () => {
      const currentMock = getSessionFromStorage();
      if (currentMock) {
        processAndSetSession(currentMock);
      } else {
        // If mock session was deleted, check if there's still a Supabase session
        const initAuth = async () => {
      try {
        const { data: { session: sbSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        processAndSetSession(sbSession);
      } catch (e) {
        console.error('Auth initialization error:', e);
      }
    };
    initAuth();
      }
    };

    window.addEventListener('hs_auth_change', handleCustomAuthChange);

    return () => {
      if (subscription) subscription.unsubscribe();
      window.removeEventListener('hs_auth_change', handleCustomAuthChange);
    };
  }, []);

  return session;
}
