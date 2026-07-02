import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAccountSession } from './useAccountSession';
import { useAccountAuthHandlers } from './useAccountAuthHandlers';

export function useAccountPage({ t, lang, onAddToCart }) {
  const [identifier, setIdentifier] = useState('');
  const [step, setStep] = useState(1); // 1 = Input, 2 = Verify Code / Password
  const [isRegistered, setIsRegistered] = useState(false);
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']); // 6 digit code inputs
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const navigate = useNavigate();

  // Simple mock database of registered logins
  const MOCK_REGISTERED_USERS = useMemo(() => [], []);

  const {
    isLoggedIn, setIsLoggedIn,
    isSessionLoading, setIsSessionLoading,
    loggedInUser, setLoggedInUser,
    sessionUser, setSessionUser,
    registeredUsers, setRegisteredUsers,
    savedAccounts, setSavedAccounts,
    getDisplayAvatar, getDisplayName, getDisplayEmailOrPhone
  } = useAccountSession({ t, MOCK_REGISTERED_USERS });

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

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

          let avatar_url = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null;
          const meta = session.user.user_metadata || {};
          if (!avatar_url && meta.default_avatar_id) {
            avatar_url = `https://avatars.yandex.net/get-yapic/${meta.default_avatar_id}/islands-200`;
          } else if (!avatar_url && meta.avatar_id) {
            avatar_url = `https://avatars.yandex.net/get-yapic/${meta.avatar_id}/islands-200`;
          }

          setIsLoggedIn(true);
          setLoggedInUser(email);
          setSessionUser(session.user);
          localStorage.setItem('hs_user', JSON.stringify({ emailOrPhone: email, avatar_url }));

          // Add to registered users list safely as structured objects
          const savedStr = localStorage.getItem('hs_registered_users');
          let savedList = [];
          if (savedStr) {
            try {
              const temp = JSON.parse(savedStr);
              savedList = Array.isArray(temp) ? temp.map(item => typeof item === 'string' ? { email: item, avatar_url: null } : item) : [];
            } catch (e) {
              console.error(e);
            }
          }
          if (email && !savedList.some(item => item.email.trim().toLowerCase() === email)) {
            savedList.push({ email, avatar_url });
            localStorage.setItem('hs_registered_users', JSON.stringify(savedList));
          }

          setRegisteredUsers(savedList.map(item => item.email.trim().toLowerCase()));

          // Add to saved accounts list if it's not a mock account
          const emailClean = email.trim().toLowerCase();
          if (emailClean && !['test@test.com', 'admin@hotstuffplay.com', '+77777777777', '87777777777'].includes(emailClean)) {
            setSavedAccounts(prev => {
              if (prev.some(item => item.email === emailClean)) {
                return prev.map(item => item.email === emailClean ? { ...item, avatar_url: avatar_url || item.avatar_url } : item);
              }
              return [...prev, { email: emailClean, avatar_url }];
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

  const {
    handleGoogleLogin, isLocalHost, handleLocalTelegramLogin,
    handleTelegramLoginSuccess, handleYandexClick, triggerOtpSend,
    handleVerifySubmit, loginSuccess, handleLogout,
    handleIdentifierSubmit: _handleIdentifierSubmit
  } = useAccountAuthHandlers({
    t, navigate, lang,
    identifier, code,
    setIsLoggedIn, setLoggedInUser, setSessionUser, setRegisteredUsers, setSavedAccounts,
    setError, setLoading, setCountdown, setCode, setStep,
    setIsSessionLoading, setIdentifier, setPassword,
    validateEmail
  });

  const handleIdentifierSubmit = (e) => {
    return _handleIdentifierSubmit(e, setIsRegistered);
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
