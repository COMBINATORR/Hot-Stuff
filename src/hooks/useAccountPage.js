import { useState, useEffect, useMemo, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function useAccountPage({ t, lang, onAddToCart }) {
    const [identifier, setIdentifier] = useState('');
  const [step, setStep] = useState(1); // 1 = Input, 2 = Verify Code / Password
  const [isRegistered, setIsRegistered] = useState(false);
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']); // 6 digit code inputs
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  // SMS OTP verification states
  const [countdown, setCountdown] = useState(0);
  const [isPrivate, setIsPrivate] = useState(() => {
    return localStorage.getItem('hs_private_mode') === 'true';
  });

  // Dynamic backend integration states (Zero State by default)
  const [activeOrders, setActiveOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loyaltyData, setLoyaltyData] = useState({
    discount: 0,
    tier: 'HOT STUFF START',
    toNextLevel: 50000
  });
  const [sessionUser, setSessionUser] = useState(null);

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

  const navigate = useNavigate();

  // Simple mock database of registered logins
  const MOCK_REGISTERED_USERS = useMemo(() => [
    'test@test.com',
    'admin@hotstuffplay.com',
    '+77777777777',
    '87777777777'
  ], []);

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('hs_registered_users');
    const parsed = saved ? JSON.parse(saved) : [];
    const all = [...new Set([...MOCK_REGISTERED_USERS, ...parsed])];
    return all.map(u => u.trim().toLowerCase());
  });

  const [savedAccounts, setSavedAccounts] = useState(() => {
    const saved = localStorage.getItem('hs_registered_users');
    const parsed = saved ? JSON.parse(saved).map(u => u.trim().toLowerCase()) : [];
    return parsed.filter(email => !['test@test.com', 'admin@hotstuffplay.com', '+77777777777', '87777777777'].includes(email));
  });


  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

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
          full_name: [saved.firstName, saved.lastName].filter(Boolean).join(' ') || saved.emailOrPhone,
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

  // Validation
  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const validatePhone = (val) => {
    return /^\+?[0-9]{10,12}$/.test(val.replace(/[\s()-]/g, ''));
  };

  // Listen to Supabase auth state change on mount
  useEffect(() => {
    let active = true;

    // Helper to check if URL contains OAuth/PKCE callback auth parameters
    const hasAuthParams = () => {
      const search = window.location.search;
      const hash = window.location.hash;
      return search.includes('code=') ||
             hash.includes('access_token=') ||
             hash.includes('id_token=') ||
             search.includes('error=') ||
             hash.includes('error=');
    };

    // Parse URL query parameters and hash fragment for auth errors
    const checkUrlErrors = () => {
      const searchParams = new URLSearchParams(window.location.search);
      let errorVal = searchParams.get('error');
      let errorDescVal = searchParams.get('error_description');

      // If not in search, check hash parameters (OAuth sometimes returns errors in hash)
      if (!errorVal && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        errorVal = hashParams.get('error');
        errorDescVal = hashParams.get('error_description');
      }

      if (errorVal) {
        console.error('[Auth Callback Error]', errorVal, errorDescVal);
        const decodedDesc = errorDescVal ? decodeURIComponent(errorDescVal.replace(/\+/g, ' ')) : '';
        setError(t('account.auth_error', { error: errorVal, desc: decodedDesc || t('account.auth_error_default', 'Не удалось войти в аккаунт') }));
        // Clear parameters from URL so they don't persist on reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    };

    // Run error check immediately
    checkUrlErrors();

    const handleAuthSession = (session) => {
      startTransition(() => {
        if (session && session.user) {
          const email = (
            session.user.email ||
            session.user.user_metadata?.email ||
            session.user.user_metadata?.default_email ||
            session.user.user_metadata?.login ||
            session.user.user_metadata?.username ||
            ''
          ).trim().toLowerCase();

          setIsLoggedIn(true);
          setLoggedInUser(email);
          setSessionUser(session.user);
          localStorage.setItem('hs_user', JSON.stringify({ emailOrPhone: email }));

          // Add to registered users list safely
          setRegisteredUsers(prev => {
            if (!email || prev.includes(email)) return prev;
            const next = [...prev, email];
            localStorage.setItem('hs_registered_users', JSON.stringify(next));
            return next;
          });

          // Add to saved accounts list if it's not a mock account
          const emailClean = email.trim().toLowerCase();
          if (emailClean && !['test@test.com', 'admin@hotstuffplay.com', '+77777777777', '87777777777'].includes(emailClean)) {
            setSavedAccounts(prev => {
              if (prev.includes(emailClean)) return prev;
              return [...prev, emailClean];
            });
          }
        } else {
          setSessionUser(null);
        }
        if (active) {
          setIsSessionLoading(false);
        }
      });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) {
        handleAuthSession(session);
      }
    }).catch(err => {
      console.error('[AccountPage] getSession error:', err);
      if (active) {
        setIsSessionLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      startTransition(() => {
        if (session && session.user) {
          handleAuthSession(session);
        } else if (_event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
          setLoggedInUser(null);
          setSessionUser(null);
          localStorage.removeItem('hs_user');

          if (active) {
            setIsSessionLoading(false);
          }
        } else {
          // If there are OAuth/callback params in the URL, wait for getSession() to exchange code/tokens instead of stopping early
          if (active && !hasAuthParams()) {
            setIsSessionLoading(false);
          }
        }
      });
    });

    return () => {
      active = false;
      if (subscription) {
        if (subscription.unsubscribe) subscription.unsubscribe();
        else if (subscription.subscription && subscription.subscription.unsubscribe) subscription.subscription.unsubscribe();
      }
    };
  }, []);

  const getOAuthRedirectUrl = () => {
    if (isLocalHost()) {
      return window.location.origin + window.location.pathname;
    }
    return 'https://hotstuffplay.com' + window.location.pathname;
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getOAuthRedirectUrl()
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('[Google OAuth Error]', err);
      let errMsg = err.message || t('account.auth_error_google', 'Ошибка авторизации через Google');
      if (errMsg.includes('provider is not enabled') || errMsg.includes('Unsupported provider')) {
        errMsg = t('account.google_provider_error', 'Провайдер Google не включен в настройках авторизации вашего проекта Supabase. Пожалуйста, перейдите в Supabase Dashboard -> Authentication -> Providers -> Google и активируйте его.');
      }
      setError(errMsg);
      setLoading(false);
    }
  };

  const isLocalHost = () => {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port === '3000';
  };

  const handleLocalTelegramLogin = () => {
    setError('');
    setLoading(true);

    // Mock Telegram user data
    const mockUser = {
      id: 12345678,
      first_name: 'Иван',
      last_name: 'Иванов',
      username: 'tg_test_user',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      auth_date: Math.floor(Date.now() / 1000)
    };

    // Directly log in on local side
    setTimeout(() => {
      const email = `tg_${mockUser.id}@hotstuffplay.com`;
      loginSuccess(email);
      setLoading(false);
      alert(t('account.welcome_test', { name: `${mockUser.first_name} ${mockUser.last_name}` }));
    }, 800);
  };

  const handleTelegramLoginSuccess = (user) => {
    setError('');
    setLoading(true);

    try {
      // Build a display identifier from the Telegram user object
      const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Telegram User';
      const emailOrPhone = user.username ? `@${user.username}` : `tg_${user.id}`;

      // ── 1. Save to localStorage IMMEDIATELY ──
      const authUser = {
        emailOrPhone,
        id: user.id,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        username: user.username || '',
        photoUrl: user.photo_url || '',
        authDate: user.auth_date || '',
        isTelegram: true,
      };
      localStorage.setItem('hs_user', JSON.stringify(authUser));

      // ── 2. Update React state so the page re-renders to the account view ──
      const mockSessionUser = {
        email: emailOrPhone,
        user_metadata: {
          full_name: displayName,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          username: user.username || '',
          avatar_url: user.photo_url || null,
        },
      };

      setIsLoggedIn(true);
      setLoggedInUser(emailOrPhone);
      setSessionUser(mockSessionUser);
      localStorage.setItem('hs_auth_session', JSON.stringify({ user: mockSessionUser }));
      window.dispatchEvent(new Event('hs_auth_change'));

      // ── 3. Optionally try the server-side Supabase session (fire-and-forget) ──
      fetch('https://xmuaaxirlcbpbtftmrik.supabase.co/functions/v1/telegram-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramData: user }),
      })
        .then((r) => r.json())
        .then((result) => {
          if (result?.session?.access_token && result?.session?.refresh_token) {
            supabase.auth.setSession({
              access_token: result.session.access_token,
              refresh_token: result.session.refresh_token,
            });
          }
        })
        .catch((err) => console.warn('[Telegram Proxy] optional server session failed:', err));

    } catch (err) {
      console.error('[Telegram login flow] Error:', err);
      setError(t('account.auth_error', 'Произошла ошибка при авторизации'));
    } finally {
      setLoading(false);
    }
  };

  const handleYandexClick = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'custom:yandex',
        options: {
          redirectTo: getOAuthRedirectUrl(),
          scopes: 'login:email login:info login:avatar login:birthday login:default_phone',
          queryParams: {
            force_confirm: 'yes'
          }
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('[Yandex OAuth Error]', err);
      let errMsg = err.message || t('account.auth_error_yandex', 'Ошибка авторизации через Яндекс');
      if (errMsg.includes('provider is not enabled') || errMsg.includes('Unsupported provider')) {
        errMsg = t('account.yandex_provider_error', 'Провайдер Яндекс не включен в настройках авторизации вашего проекта Supabase. Пожалуйста, активируйте провайдер Yandex в Supabase Dashboard.');
      }
      setError(errMsg);
      setLoading(false);
    }
  };

  const triggerOtpSend = async (emailVal) => {
    setError('');
    setLoading(true);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: emailVal
      });

      if (otpError) {
        console.warn('[Supabase OTP Send Error]', otpError);
      }

      setCountdown(60);
      setCode(['', '', '', '', '', '']); // Reset 6 digit code
      setStep(2);
    } catch (err) {
      console.warn('[Supabase OTP Send Exception]', err);
      setCountdown(60);
      setCode(['', '', '', '', '', '']);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleIdentifierSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanedVal = identifier.trim().toLowerCase();

    if (!cleanedVal) {
      setError(t('account.err_email', 'Пожалуйста, введите Email'));
      return;
    }

    if (!validateEmail(cleanedVal)) {
      setError(t('account.err_email_invalid', 'Неверный формат почты. Пример: test@mail.ru'));
      return;
    }

    // Allow fast-path bypass ONLY for mock/testing accounts when typed manually.
    // Real user accounts must always go through OTP verification when typed manually for safety.
    const isMock = MOCK_REGISTERED_USERS.includes(cleanedVal);
    if (isMock) {
      loginSuccess(cleanedVal);
      return;
    }

    // Otherwise, standard secure login: send OTP via Supabase
    setIsRegistered(false);
    await triggerOtpSend(cleanedVal);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const enteredCode = code.join('').trim();
    if (enteredCode.length < 6) {
      setError(t('account.err_otp_digits', 'Пожалуйста, введите все 6 цифр кода'));
      setLoading(false);
      return;
    }

    // Verify via real Supabase
    try {
      let { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: identifier.trim().toLowerCase(),
        token: enteredCode,
        type: 'email'
      });

      if (verifyError) {
        // Fallback for new user signups
        const signupResult = await supabase.auth.verifyOtp({
          email: identifier.trim().toLowerCase(),
          token: enteredCode,
          type: 'signup'
        });

        if (signupResult.error) {
          throw verifyError;
        }

        data = signupResult.data;
      }

      if (data?.user) {
        loginSuccess(data.user.email);
      } else {
        throw new Error(t('account.err_user_not_found', 'Не удалось подтвердить код. Пользователь не найден.'));
      }
    } catch (err) {
      console.error('[Supabase Verify Error]', err);
      setError(err.message || t('account.err_otp_invalid', 'Неверный код подтверждения. Пожалуйста, попробуйте еще раз.'));
    } finally {
      setLoading(false);
    }
  };

  const loginSuccess = (userVal) => {
    const normalizedUser = userVal.trim().toLowerCase();
    setIsLoggedIn(true);
    setLoggedInUser(normalizedUser);

    // Set a simulated sessionUser for mock login flow
    const mockSessionUser = {
      email: normalizedUser,
      user_metadata: {
        full_name: normalizedUser === 'admin@hotstuffplay.com' ? 'Администратор' : 'Тестовый Пользователь',
        avatar_url: null
      }
    };
    setSessionUser(mockSessionUser);

    localStorage.setItem('hs_user', JSON.stringify({ emailOrPhone: normalizedUser }));
    localStorage.setItem('hs_auth_session', JSON.stringify({ user: mockSessionUser }));
    window.dispatchEvent(new Event('hs_auth_change'));

    if (!registeredUsers.includes(normalizedUser)) {
      const updatedList = [...registeredUsers, normalizedUser];
      setRegisteredUsers(updatedList);
      localStorage.setItem('hs_registered_users', JSON.stringify(updatedList));
    }

    if (!['test@test.com', 'admin@hotstuffplay.com', '+77777777777', '87777777777'].includes(normalizedUser)) {
      setSavedAccounts(prev => {
        if (prev.includes(normalizedUser)) return prev;
        return [...prev, normalizedUser];
      });
    }
  };

  const handleLogout = async () => {
    startTransition(() => {
      setLoading(true);
    });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('[Logout Error]', err);
      alert(t('account.logout_err_alert', 'Произошла ошибка при выходе из системы. Сессия будет закрыта локально.'));
    } finally {
      localStorage.removeItem('hs_user');
      localStorage.removeItem('hs_auth_session');
      window.dispatchEvent(new Event('hs_auth_change'));

      const targetPath = lang && lang !== 'ru' ? `/${lang}` : '/';
      navigate(targetPath);

      setTimeout(() => {
        startTransition(() => {
          setIsLoggedIn(false);
          setLoggedInUser(null);
          setSessionUser(null);
          setStep(1);
          setIdentifier('');
          setPassword('');
          setCode(['', '', '', '', '', '']);
          setError('');
          setLoading(false);
        });
      }, 500);
    }
  };


  const handleTogglePrivate = () => {
    setIsPrivate(prev => {
      const newVal = !prev;
      localStorage.setItem('hs_private_mode', String(newVal));
      return newVal;
    });
  };

  const handleCodeChange = (index, value) => {
    if (isNaN(value)) return;
    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);

    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus();
    }
  };

  const [showSharePush, setShowSharePush] = useState(false);

  const handleShareWishlist = () => {
    const productIds = favorites.map(p => p.id);
    const langPrefix = lang && lang !== 'ru' ? `/${lang}` : '';
    const shareUrl = `${window.location.origin}${langPrefix}/catalog?gift=${productIds.join(',')}&ref=anonymous`;

    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setShowSharePush(true);
        setTimeout(() => {
          setShowSharePush(false);
        }, 6000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const handleAddWishlistItem = (product) => {
    if (onAddToCart) {
      onAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        emoji: product.emoji || '🌸',
        variant: product.colors?.[0]?.name || 'Default',
        qty: 1,
        image: product.image
      });
      alert(t('product.added_alert', { name: product.name }, `Товар ${product.name} добавлен в корзину!`));
    }
  };


  return {
    identifier, setIdentifier,
    step, setStep,
    isRegistered, setIsRegistered,
    password, setPassword,
    code, setCode,
    error, setError,
    loading, setLoading,
    isLoggedIn, setIsLoggedIn,
    isSessionLoading, setIsSessionLoading,
    loggedInUser, setLoggedInUser,
    countdown, setCountdown,
    isPrivate, setIsPrivate,
    activeOrders, setActiveOrders,
    orderHistory, setOrderHistory,
    favorites, setFavorites,
    loyaltyData, setLoyaltyData,
    sessionUser, setSessionUser,
    getDisplayAvatar, getDisplayName, getDisplayEmailOrPhone,
    navigate,
    MOCK_REGISTERED_USERS,
    registeredUsers, setRegisteredUsers,
    savedAccounts, setSavedAccounts,
    validateEmail, validatePhone,
    handleGoogleLogin, isLocalHost, handleLocalTelegramLogin,
    handleTelegramLoginSuccess, handleYandexClick, triggerOtpSend,
    handleIdentifierSubmit, handleVerifySubmit, loginSuccess,
    handleLogout, handleTogglePrivate, handleCodeChange, handleKeyDown,
    showSharePush, setShowSharePush, handleShareWishlist, handleAddWishlistItem
  };
}
