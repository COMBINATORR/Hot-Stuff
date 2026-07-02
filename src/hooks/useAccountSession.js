import { useState, useEffect } from 'react';

export function useAccountSession({ t, MOCK_REGISTERED_USERS }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedUser = localStorage.getItem('hs_user');
    return !!savedUser;
  });
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(() => {
    const savedUser = localStorage.getItem('hs_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.emailOrPhone;
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  const [sessionUser, setSessionUser] = useState(null);

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('hs_registered_users');
    let parsed = [];
    if (saved) {
      try {
        const temp = JSON.parse(saved);
        parsed = Array.isArray(temp) ? temp.map(u => typeof u === 'string' ? u.trim().toLowerCase() : u.email.trim().toLowerCase()) : [];
      } catch (e) {
        console.error(e);
      }
    }
    const all = [...new Set([...MOCK_REGISTERED_USERS, ...parsed])];
    return all.map(u => u.trim().toLowerCase());
  });

  const [savedAccounts, setSavedAccounts] = useState(() => {
    const saved = localStorage.getItem('hs_registered_users');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          if (typeof item === 'string') {
            return { email: item.trim().toLowerCase(), avatar_url: null };
          }
          if (item && typeof item === 'object' && item.email) {
            return {
              email: item.email.trim().toLowerCase(),
              avatar_url: item.avatar_url || null
            };
          }
          return null;
        }).filter(item => item && !['test@test.com', 'admin@hotstuffplay.com', '+77777777777', '87777777777'].includes(item.email));
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const getDisplayAvatar = () => {
    if (!sessionUser) return null;
    const meta = sessionUser.user_metadata || {};
    if (meta.avatar_url) return meta.avatar_url;
    if (meta.picture) return meta.picture;
    if (meta.default_avatar_id) {
      return `https://avatars.yandex.net/get-yapic/${meta.default_avatar_id}/islands-200`;
    }
    if (meta.avatar_id) {
      return `https://avatars.yandex.net/get-yapic/${meta.avatar_id}/islands-200`;
    }
    return null;
  };

  const getDisplayName = () => {
    if (!sessionUser) return t('account.title', 'Личный кабинет');
    const meta = sessionUser.user_metadata || {};
    return (
      meta.real_name ||
      meta.display_name ||
      meta.full_name ||
      meta.name ||
      (meta.first_name || meta.last_name
        ? `${meta.first_name || ''} ${meta.last_name || ''}`.trim()
        : '') ||
      meta.login ||
      meta.username ||
      t('account.title', 'Личный кабинет')
    );
  };

  const getDisplayEmailOrPhone = () => {
    if (!sessionUser) return loggedInUser || '';
    return (
      sessionUser.email ||
      sessionUser.user_metadata?.email ||
      sessionUser.user_metadata?.default_email ||
      sessionUser.user_metadata?.login ||
      sessionUser.user_metadata?.username ||
      loggedInUser ||
      ''
    );
  };

  // ── Restore Telegram (or any) session from localStorage on mount ──
  useEffect(() => {
    if (isLoggedIn) return; // already logged in, nothing to do

    const raw = localStorage.getItem('hs_user');
    if (!raw) return;

    try {
      const saved = JSON.parse(raw);
      if (!saved || !saved.emailOrPhone) return;

      // Rebuild minimal sessionUser so the dashboard renders correctly
      const restoredSessionUser = {
        email: saved.emailOrPhone,
        user_metadata: {
          full_name: (saved.firstName ? (saved.lastName ? saved.firstName + ' ' + saved.lastName : saved.firstName) : (saved.lastName || saved.emailOrPhone)),
          first_name: saved.firstName || '',
          last_name: saved.lastName || '',
          username: saved.username || '',
          avatar_url: saved.photoUrl || null,
        },
      };

      setIsLoggedIn(true);
      setLoggedInUser(saved.emailOrPhone);
      setSessionUser(restoredSessionUser);
    } catch (e) {
      console.warn('[AccountPage] failed to restore session from localStorage', e);
    }
  }, []);

  return {
    isLoggedIn, setIsLoggedIn,
    isSessionLoading, setIsSessionLoading,
    loggedInUser, setLoggedInUser,
    sessionUser, setSessionUser,
    registeredUsers, setRegisteredUsers,
    savedAccounts, setSavedAccounts,
    getDisplayAvatar, getDisplayName, getDisplayEmailOrPhone
  };
}
