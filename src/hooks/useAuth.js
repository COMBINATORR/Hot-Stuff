import { useState, useEffect, startTransition } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState(() => {
    // Synchronously try to load cached session to avoid UI pop-in
    try {
      const cached = localStorage.getItem('hs_auth_session');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error('Failed to parse cached session:', e);
    }
    return null;
  });

  const processAndSetSession = (newSession) => {
    if (!newSession) {
      startTransition(() => {
        setSession(null);
      });
      localStorage.removeItem('hs_auth_session');
      return;
    }

    // Unify user profile state across different identities
    let avatar_url = newSession.user?.user_metadata?.avatar_url || newSession.user?.user_metadata?.picture;

    // If not found in top-level metadata, search identities (fixes Email OTP missing avatar)
    if (!avatar_url && newSession.user?.identities?.length > 0) {
      for (const identity of newSession.user.identities) {
        const idAvatar = identity.identity_data?.avatar_url || identity.identity_data?.picture;
        if (idAvatar) {
          avatar_url = idAvatar;
          break;
        }
      }
    }

    // Ensure session object holds the recovered avatar URL
    if (avatar_url && newSession.user && newSession.user.user_metadata) {
       newSession.user.user_metadata.avatar_url = avatar_url;
    }

    startTransition(() => {
      setSession(newSession);
    });

    try {
      localStorage.setItem('hs_auth_session', JSON.stringify(newSession));
    } catch (e) {
      console.error('Failed to cache session:', e);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      processAndSetSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      processAndSetSession(session);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  return session;
}
