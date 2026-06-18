import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ALL_PRODUCTS } from '../data/products';
import { supabase } from '../lib/supabase';

export default function AccountPage({ onAddToCart, lang }) {
  const { t, i18n } = useTranslation();
  const [identifier, setIdentifier] = useState(() => {
    return localStorage.getItem('hs_remembered_email') || '';
  });
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
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [showSmsPush, setShowSmsPush] = useState(false);
  const [isPrivate, setIsPrivate] = useState(() => {
    return localStorage.getItem('hs_private_mode') === 'true';
  });


  const navigate = useNavigate();

  // Simple mock database of registered logins
  const MOCK_REGISTERED_USERS = useMemo(() => [
    'test@test.com',
    'admin@hotstuff.kz',
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
    return parsed.filter(email => !['test@test.com', 'admin@hotstuff.kz', '+77777777777', '87777777777'].includes(email));
  });


  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);


  // Filter products for the Wishlist (Sona, Soraya Wave)
  const wishlistProducts = useMemo(() => {
    return ALL_PRODUCTS.filter(p => p.id === 4 || p.id === 8);
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
      if (session && session.user) {
        const email = (session.user.email || '').trim().toLowerCase();
        console.log('[AccountPage] handleAuthSession: User authenticated successfully:', email);
        setIsLoggedIn(true);
        setLoggedInUser(email);
        localStorage.setItem('hs_user', JSON.stringify({ emailOrPhone: email }));
        localStorage.setItem('hs_remembered_email', email);
        
        // Add to registered users list safely
        setRegisteredUsers(prev => {
          if (prev.includes(email)) return prev;
          console.log('[AccountPage] handleAuthSession: Adding email to registered users list:', email);
          const next = [...prev, email];
          localStorage.setItem('hs_registered_users', JSON.stringify(next));
          return next;
        });

        // Add to saved accounts list if it's not a mock account
        const emailClean = email.trim().toLowerCase();
        if (!['test@test.com', 'admin@hotstuff.kz', '+77777777777', '87777777777'].includes(emailClean)) {
          setSavedAccounts(prev => {
            if (prev.includes(emailClean)) return prev;
            return [...prev, emailClean];
          });
        }
      }
      if (active) {
        setIsSessionLoading(false);
      }
    };

    console.log('[AccountPage] Checking current active Supabase session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AccountPage] getSession result:', session?.user?.email ? 'Active session found' : 'No active session');
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
      console.log('[AccountPage] onAuthStateChange event:', _event, 'User email:', session?.user?.email);
      if (session && session.user) {
        handleAuthSession(session);
      } else if (_event === 'SIGNED_OUT') {
        console.log('[AccountPage] SIGNED_OUT detected. Clearing active login states');
        setIsLoggedIn(false);
        setLoggedInUser(null);
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

    return () => {
      active = false;
      if (subscription) {
        if (subscription.unsubscribe) subscription.unsubscribe();
        else if (subscription.subscription && subscription.subscription.unsubscribe) subscription.subscription.unsubscribe();
      }
    };
  }, []);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + window.location.pathname
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
    console.log('[Telegram Auth] Emulating success on localhost');
    
    // Mock Telegram user data
    const mockUser = {
      id: 12345678,
      first_name: 'Иван',
      last_name: 'Иванов',
      username: 'tg_test_user',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      auth_date: Math.floor(Date.now() / 1000),
      hash: 'mock_hash'
    };

    // Directly log in on local side
    setTimeout(() => {
      const email = `tg_${mockUser.id}@hotstuff.kz`;
      loginSuccess(email);
      setLoading(false);
      alert(t('account.welcome_test', { name: `${mockUser.first_name} ${mockUser.last_name}` }));
    }, 800);
  };

  const handleTelegramLoginSuccess = async (user) => {
    setError('');
    setLoading(true);
    console.log('[Telegram Auth] Received user from Telegram widget:', user);
    
    try {
      // Invoke our serverless API function
      const response = await fetch('/api/telegram-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          telegramData: user,
          redirectTo: window.location.origin + window.location.pathname
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || t('account.err_telegram_verify', 'Ошибка проверки данных Telegram на сервере'));
      }

      if (result.success && result.action_link) {
        console.log('[Telegram Auth] Verification success. Redirecting to magiclink:', result.action_link);
        // Redirect browser to magiclink, which will sign the user in via Supabase
        window.location.href = result.action_link;
      } else {
        throw new Error(t('account.err_invalid_response', 'Неверный формат ответа от сервера авторизации'));
      }

    } catch (err) {
      console.error('[Telegram Auth Error]', err);
      setError(err.message || t('account.err_telegram_fail', 'Не удалось войти через Telegram. Пожалуйста, попробуйте позже.'));
      setLoading(false);
    }
  };

  const handleYandexClick = async () => {
    setError('');
    setLoading(true);
    try {
      const langPrefix = lang && lang !== 'ru' ? `/${lang}` : '';
      const redirectUrl = `${window.location.origin}${langPrefix}/account`;
      console.log('[Yandex OAuth] Redirecting to:', redirectUrl);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'custom:yandex',
        options: {
          redirectTo: redirectUrl,
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
        errMsg = t('account.yandex_provider_error', 'Провайдер Яндекс не включен в настройках авторизации вашего проекта Supabase. Пожалуйста, активируйте кастомный провайдер (custom:yandex) в Supabase Dashboard.');
      }
      setError(errMsg);
      setLoading(false);
    }
  };

  const triggerOtpSend = async (emailVal) => {
    setError('');
    setLoading(true);
    
    // Generate a mock 6-digit OTP code for local debugging/testing
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockCode);
    
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: emailVal,
        options: {
          emailRedirectTo: window.location.origin + window.location.pathname
        }
      });

      if (otpError) {
        console.warn('[Supabase OTP Send Error - Using Local Fallback]', otpError);
      }

      setCountdown(60);
      setCode(['', '', '', '', '', '']); // Reset 6 digit code
      setStep(2);
      setShowSmsPush(true); // Always display the iOS-style SMS notification for testing
      
      console.log(`[Supabase OTP] OTP sent. Local debug code: ${mockCode}`);
    } catch (err) {
      console.warn('[Supabase OTP Send Exception - Using Local Fallback]', err);
      setCountdown(60);
      setCode(['', '', '', '', '', '']);
      setStep(2);
      setShowSmsPush(true);
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

    // 1. Check local debug fallback code first (either the generated random OTP or 123456 as standard fallback)
    if (enteredCode === generatedOtp || enteredCode === '123456') {
      console.log('[Auth] Local debug OTP verified successfully');
      loginSuccess(identifier);
      setLoading(false);
      return;
    }

    // 2. Otherwise verify via real Supabase
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
    localStorage.setItem('hs_user', JSON.stringify({ emailOrPhone: normalizedUser }));
    localStorage.setItem('hs_remembered_email', normalizedUser); // Save remembered email

    if (!registeredUsers.includes(normalizedUser)) {
      const updatedList = [...registeredUsers, normalizedUser];
      setRegisteredUsers(updatedList);
      localStorage.setItem('hs_registered_users', JSON.stringify(updatedList));
    }

    if (!['test@test.com', 'admin@hotstuff.kz', '+77777777777', '87777777777'].includes(normalizedUser)) {
      setSavedAccounts(prev => {
        if (prev.includes(normalizedUser)) return prev;
        return [...prev, normalizedUser];
      });
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('[Logout Error]', err);
      alert(t('account.logout_err_alert', 'Произошла ошибка при выходе из системы. Сессия будет закрыта локально.'));
    } finally {
      localStorage.removeItem('hs_user');

      const targetPath = lang && lang !== 'ru' ? `/${lang}` : '/';
      navigate(targetPath);

      setTimeout(() => {
        setIsLoggedIn(false);
        setLoggedInUser(null);
        setStep(1);
        setIdentifier(localStorage.getItem('hs_remembered_email') || '');
        setPassword('');
        setCode(['', '', '', '', '', '']);
        setError('');
        setLoading(false);
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
    const productIds = wishlistProducts.map(p => p.id);
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

  if (isSessionLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-center items-center bg-background text-on-surface">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-xl font-light tracking-[0.2em] text-black uppercase animate-pulse">
            HOT STUFF
          </h1>
          <div className="flex items-center gap-2">
            <svg 
              className="animate-spin h-6 w-6 text-black" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeDasharray="3 3"
            >
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" />
            </svg>
            <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest font-sans">
              {t('account.checking_session', 'Проверка сессии...')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-background text-on-surface pt-24 pb-20 md:pb-28">
      <Breadcrumbs theme="dark" />
      <div className="flex-1 flex flex-col justify-center items-center px-4 md:px-8">
      
      {/* iOS-Style SMS Push Notification */}
      <AnimatePresence>
        {showSmsPush && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: '-50%', scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: -100, x: '-50%', scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 120 }}
            onClick={() => setShowSmsPush(false)}
            className="fixed top-6 left-1/2 w-[90%] max-w-[360px] bg-white/90 dark:bg-[#1c1c1e]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl p-4 flex gap-3 z-[9999] cursor-pointer select-none font-sans text-left"
          >
            {/* App Icon / Message Badge */}
            <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[20px] font-bold">chat</span>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[11px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest font-sans">{t('account.messages', 'Сообщения')}</span>
                <span className="text-[10px] text-black/30 dark:text-white/30 font-medium">{t('account.now', 'сейчас')}</span>
              </div>
              <h4 className="text-xs font-black text-black dark:text-white mb-0.5 uppercase tracking-wide">Hot Stuff</h4>
              <p className="text-[11.5px] text-black/70 dark:text-white/70 leading-relaxed font-normal">
                {t('account.otp_label', 'Код подтверждения')}: <span className="font-bold text-black dark:text-white font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-xs select-all">{generatedOtp}</span>. {t('account.otp_sec_warn', 'Не сообщайте его никому.')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Wishlist Push Notification */}
      <AnimatePresence>
        {showSharePush && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: '-50%', scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: -100, x: '-50%', scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 120 }}
            onClick={() => setShowSharePush(false)}
            className="fixed top-6 left-1/2 w-[90%] max-w-[360px] bg-white/90 dark:bg-[#1c1c1e]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl p-4 flex gap-3 z-[9999] cursor-pointer select-none font-sans text-left"
          >
            {/* App Icon / Share Badge */}
            <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[20px] font-bold text-white">share</span>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[11px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest font-sans">{t('account.share', 'Поделиться')}</span>
                <span className="text-[10px] text-black/30 dark:text-white/30 font-medium">{t('account.now', 'сейчас')}</span>
              </div>
              <h4 className="text-xs font-black text-black dark:text-white mb-0.5 uppercase tracking-wide">{t('account.anon_title_short', 'Hot Stuff Анонимность')}</h4>
              <p className="text-[11.5px] text-black/70 dark:text-white/70 leading-relaxed font-normal">
                {t('account.hint_copied')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      
      {isLoggedIn ? (
        /* Authenticated Dashboard view */
        <div className="w-full max-w-5xl bg-white text-black border border-black/5 p-6 md:p-10 rounded-[28px] shadow-2xl font-sans relative z-10 overflow-hidden">
          {/* Background radial highlight for light dashboard */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none z-0"></div>

          <div className="relative z-10 space-y-10 text-left">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-black/5">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-4xl text-primary font-light">account_circle</span>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-black uppercase tracking-wider">{t('account.title', 'Личный кабинет')}</h1>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mt-1">{loggedInUser}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 self-start md:self-auto">
                {/* Incognito Toggle Button */}
                <button
                  type="button"
                  onClick={handleTogglePrivate}
                  className={`flex items-center gap-2 border px-4 py-2.5 rounded-[20px] transition-all cursor-pointer font-sans text-[10px] font-bold uppercase tracking-wider ${
                    isPrivate
                      ? 'bg-black border-black text-white'
                      : 'bg-white border-black/10 text-neutral-500 hover:text-black hover:border-black'
                  }`}
                  title={isPrivate ? t('account.private_title_off', 'Выключить режим приватности') : t('account.private_title_on', 'Включить режим приватности')}
                >
                  <span className="material-symbols-outlined text-[16px] leading-none">
                    {isPrivate ? 'visibility_off' : 'visibility'}
                  </span>
                  <span>{isPrivate ? t('account.private', 'Приватно') : t('account.public', 'Публично')}</span>
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 border border-black/10 hover:border-red-500 hover:text-red-500 text-black font-sans font-black text-[9px] tracking-[0.2em] px-6 py-3.5 uppercase transition-colors rounded-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 active:scale-95 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px] leading-none">logout</span>
                  <span>{t('account.logout_btn', 'ВЫЙТИ ИЗ АККАУНТА')}</span>
                </button>
              </div>
            </div>

            {/* Main Dashboard Grid - Bento Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 1. Loyalty Tier (Bento: 2 cols) */}
              <div className="p-6 md:p-8 bg-neutral-50 border border-black/5 rounded-[28px] space-y-4 lg:col-span-2 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black tracking-wider text-black uppercase">{t('account.privileges', 'Клуб Привилегий')}</h3>
                    <span className="bg-primary/15 text-[#b28b10] text-[8px] font-black tracking-widest px-2.5 py-1 rounded-[2px] uppercase">
                      HOT STUFF GOLD
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-black leading-none">12%</span>
                    <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wide">{t('account.personal_discount', 'Ваша персональная скидка')}</span>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                    <span>{t('account.to_vip', 'До скидки 15% (VIP уровень) осталось:')}</span>
                    <span className="text-black">45 000 ₸</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>

              {/* 2. Anonymous Active Delivery (Bento: 1 col) */}
              <div className="p-6 md:p-8 bg-neutral-50 border border-black/5 rounded-[28px] space-y-5 lg:col-span-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-green-600 mb-4">
                    <span className="material-symbols-outlined text-[20px] font-light">local_shipping</span>
                    <h3 className="text-xs font-black tracking-wider text-black uppercase">{t('account.current_delivery', 'Текущая Доставка')}</h3>
                  </div>
                  <div className="border-l-2 border-primary pl-4 py-1 space-y-2">
                    <p className="text-xs font-black text-black">{t('account.delivery_order', 'Заказ №10492 — Доставляется курьером сегодня')}</p>
                    <p className="text-[10px] text-neutral-500">{t('account.delivery_interval', 'Интервал: 18:00 – 22:00. Курьер свяжется за 30 минут.')}</p>
                  </div>
                </div>

                {/* Anti-Anxiety Privacy Banner */}
                <div className="bg-neutral-100 border border-black/5 p-4 rounded-[16px] flex items-start gap-3 mt-4">
                  <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">visibility_off</span>
                  <div>
                    <h4 className="text-[9px] font-black text-black uppercase tracking-wider">{t('account.anon_title', 'Гарантия 100% анонимности доставки:')}</h4>
                    <p className="text-[9px] text-neutral-600 leading-relaxed mt-1 font-normal">
                      {t('account.anon_desc', 'Заказ упакован в плотный непрозрачный сейф-пакет без каких-либо логотипов. В накладной содержимое указано как «Аксессуары (косметика)».')}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Order History (Bento: 2 cols) */}
              <div className="p-6 md:p-8 bg-neutral-50 border border-black/5 rounded-[28px] space-y-4 lg:col-span-2">
                <h3 className="text-xs font-black tracking-wider text-black uppercase mb-2">{t('account.history', 'История Покупок')}</h3>
                
                <div className="divide-y divide-black/5 text-xs font-sans">
                  <div className="py-4 flex justify-between items-center gap-4">
                    <div>
                      <p className="font-bold text-black uppercase">{t('account.order_completed', { num: 9810, date: '14.05.2026' })}</p>
                      <p className="text-[10px] text-neutral-500 mt-1">
                        {isPrivate ? t('account.delicate_accessory', 'Деликатный аксессуар •••• x1') : 'LELO Sona™ 3 Cruise x1'} — {t('account.completed', 'Выполнен')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900">38 900 ₸</p>
                      <button 
                        onClick={() => {
                          const prod = ALL_PRODUCTS.find(p => p.id === 4);
                          if (prod) handleAddWishlistItem(prod);
                        }}
                        className="text-[9px] font-black tracking-wider text-black hover:text-primary uppercase mt-1.5 transition-colors block cursor-pointer bg-transparent border-none p-0 focus-visible:outline-none focus-visible:underline"
                      >
                        {t('account.repeat', 'Повторить в 1 клик')}
                      </button>
                    </div>
                  </div>
                  <div className="py-4 flex justify-between items-center gap-4">
                    <div>
                      <p className="font-bold text-black uppercase">{t('account.order_completed', { num: 8520, date: '02.04.2026' })}</p>
                      <p className="text-[10px] text-neutral-500 mt-1">
                        {isPrivate ? t('account.delicate_accessory', 'Деликатный аксессуар •••• x1') : 'Personal Moisturizer x1'} — {t('account.completed', 'Выполнен')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900">12 500 ₸</p>
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-1.5 block">{t('account.archive', 'Архив')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Wishlist (Избранное) (Bento: 1 col) */}
              <div className="p-6 md:p-8 bg-neutral-50 border border-black/5 rounded-[28px] space-y-6 lg:col-span-1 flex flex-col justify-between">
                <div className="space-y-6">
                  <h3 className="text-xs font-black tracking-wider text-black uppercase">{t('account.favorites', 'Избранные Товары')}</h3>
                  
                  <div className="space-y-5">
                    {wishlistProducts.map(product => (
                      <div key={product.id} className="flex gap-4 p-3 bg-white border border-black/5 rounded-lg">
                        <div className="w-16 h-16 bg-neutral-50 rounded-[4px] overflow-hidden flex items-center justify-center flex-none relative">
                          {isPrivate ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 text-neutral-400 select-none">
                              <span className="material-symbols-outlined text-[18px]">visibility_off</span>
                              <span className="text-[7px] font-bold uppercase tracking-wider mt-0.5">{t('account.hidden', 'Скрыто')}</span>
                            </div>
                          ) : (
                            <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-[10px] font-black text-black uppercase tracking-wider truncate max-w-[150px]">
                              {isPrivate ? t('account.intimate_device', 'Интимный девайс ••••') : product.name}
                            </h4>
                            <p className="text-[11px] text-neutral-900 font-bold mt-0.5">{product.price.toLocaleString('ru-KZ')} ₸</p>
                          </div>
                          <button
                            onClick={() => handleAddWishlistItem(product)}
                            className="bg-black hover:bg-neutral-800 text-white font-sans font-black text-[8px] tracking-widest uppercase py-1.5 px-3 rounded-[2px] transition-colors self-start mt-2 cursor-pointer"
                          >
                            {t('account.to_cart', 'В КОРЗИНУ')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {wishlistProducts.length > 0 && (
                  <button
                    onClick={handleShareWishlist}
                    className="w-full bg-black hover:bg-neutral-800 text-white font-sans font-bold text-[9px] tracking-[0.2em] py-3.5 px-4 rounded-[20px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    <span className="material-symbols-outlined text-[16px] leading-none">share</span>
                    <span>НАМЕКНУТЬ ПАРТНЕРУ (АНОНИМНО)</span>
                  </button>
                )}
              </div>

              {/* 5. Session Security & Devices (Bento: 3 cols) */}
              <div className="p-6 md:p-8 bg-neutral-50 border border-black/5 rounded-[28px] space-y-6 lg:col-span-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xs font-black tracking-wider text-black uppercase mb-1 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-black">security</span>
                      <span>{t('account.security', 'Безопасность и управление сессиями')}</span>
                    </h3>
                    <p className="text-[11px] text-neutral-500 font-sans">
                      {t('account.security_desc', 'Вы можете завершить сессии на других устройствах или стереть историю входов на этом компьютере.')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const { error } = await supabase.auth.signOut({ scope: 'others' });
                          if (error) throw error;
                          alert(t('account.err_others_success', 'Все сессии на других устройствах успешно завершены!'));
                        } catch (err) {
                          console.error(err);
                          alert(t('common.error', 'Ошибка') + ': ' + err.message);
                        }
                      }}
                      className="bg-black hover:bg-neutral-800 text-white font-sans font-black text-[9px] tracking-wider uppercase py-2.5 px-4 rounded-[20px] transition-colors cursor-pointer active:scale-95"
                    >
                      {t('account.logout_others', 'Выйти на других устройствах')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(t('account.clear_history_confirm', 'Вы уверены, что хотите очистить историю входов на этом устройстве? При следующем входе вам потребуется подтверждение по коду.'))) {
                          localStorage.removeItem('hs_registered_users');
                          setSavedAccounts([]);
                          setRegisteredUsers(MOCK_REGISTERED_USERS);
                          alert(t('account.err_history_cleared', 'История входов на этом устройстве очищена!'));
                        }
                      }}
                      className="border border-black/10 hover:border-black text-black font-sans font-black text-[9px] tracking-wider uppercase py-2.5 px-4 rounded-[20px] transition-colors cursor-pointer active:scale-95"
                    >
                      {t('account.clear_history', 'Стереть историю входов здесь')}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        /* Image-accurate Light Mobile login view wrapped in a white card/plate */
        <div className="w-full max-w-[360px] bg-white text-black rounded-[28px] shadow-2xl p-6 md:p-8 flex flex-col items-center select-none z-10 border border-black/5">
          
          {/* Header */}
          <h1 className="text-xl font-light tracking-[0.2em] text-black uppercase mb-4 mt-4 text-center">
            HOT STUFF
          </h1>

          {/* Dynamic Form Header */}
          <h2 className="text-[11px] font-sans font-black tracking-widest text-neutral-400 uppercase mb-8 text-center">
            {step === 1 ? t('header.login_register') : (isRegistered ? t('account.login') : t('account.register'))}
          </h2>

          {error && (
            <div className="w-full text-center text-xs text-red-500 font-bold pb-4">
              ⚠️ {error}
            </div>
          )}

          {step === 1 ? (
            <div className="w-full flex flex-col">
              {/* List of previously saved / authorized accounts */}
              {savedAccounts.length > 0 && (
                <div className="flex flex-col gap-3 mb-6 w-full">
                  <span className="text-[11px] font-sans font-black tracking-widest text-neutral-400 uppercase text-center mb-1">
                    {t('account.login_as')}
                  </span>
                  <div className="flex flex-col gap-2.5 max-h-[180px] overflow-y-auto pr-1">
                    {savedAccounts.map((email) => (
                      <div
                        key={email}
                        className="group flex items-center justify-between w-full h-[54px] bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-[20px] px-5 transition-all duration-300 cursor-pointer"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setIdentifier(email);
                            loginSuccess(email);
                          }}
                          className="flex items-center gap-3 flex-1 h-full text-left bg-transparent border-none p-0 outline-none cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[20px] text-neutral-400 group-hover:text-black transition-colors">
                            account_circle
                          </span>
                          <span className="text-[14px] text-black font-medium truncate max-w-[200px]">
                            {email}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Delete from saved accounts list
                            setSavedAccounts(prev => {
                              const next = prev.filter(x => x !== email);
                              const savedList = localStorage.getItem('hs_registered_users');
                              const parsedList = savedList ? JSON.parse(savedList) : [];
                              const nextParsed = parsedList.filter(x => x.trim().toLowerCase() !== email);
                              localStorage.setItem('hs_registered_users', JSON.stringify(nextParsed));
                              return next;
                            });
                            // Also remove from registeredUsers state
                            setRegisteredUsers(prev => prev.filter(x => x !== email));
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-neutral-200/50 transition-all cursor-pointer border-none bg-transparent outline-none"
                          title={t('account.delete_from_list', 'Удалить из списка')}
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2 mb-2 w-full">
                    <div className="h-[0.5px] bg-neutral-200 flex-1"></div>
                    <span className="px-4 text-[11px] text-neutral-400 font-bold uppercase tracking-wider whitespace-nowrap">{t('account.other_account')}</span>
                    <div className="h-[0.5px] bg-neutral-200 flex-1"></div>
                  </div>
                </div>
              )}

              <form onSubmit={handleIdentifierSubmit} className="w-full flex flex-col text-left">
                {/* Input block */}
                <div className="flex flex-col mb-4">
                  <label className="text-[14px] text-black font-normal ml-3 mb-1.5 leading-none">
                    {t('account.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={t('account.email', 'Email')}
                    className="w-full h-[54px] bg-white border border-black rounded-[20px] px-5 text-[15px] text-black placeholder-neutral-400 outline-none transition-all focus:border-black/70 font-normal"
                    disabled={loading}
                  />
                </div>

                {/* Continue button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[54px] bg-black hover:bg-neutral-900 text-white font-normal text-[15px] rounded-[20px] transition-colors flex items-center justify-center gap-3 cursor-pointer"
                >
                  <span className="font-normal tracking-wide">{t('account.continue')}</span>
                  {/* Rotating dotted/dashed circle spinner always visible to match image_2.png */}
                  <svg 
                    className="animate-spin h-[18px] w-[18px] text-white" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeDasharray="3 3"
                  >
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" />
                  </svg>
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center justify-between mt-8 mb-6 w-full">
                <div className="h-[0.5px] bg-neutral-300 flex-1"></div>
                <span className="px-4 text-[13px] text-neutral-400 font-normal whitespace-nowrap">{t('account.or_via')}</span>
                <div className="h-[0.5px] bg-neutral-300 flex-1"></div>
              </div>

              {/* Social Buttons */}
              <div className="flex flex-col items-center justify-center gap-4 mb-14 w-full">
                
                {/* Standard buttons layout */}
                <div className="flex justify-center gap-4 w-full">
                  {/* Google */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-[58px] h-[58px] bg-black hover:bg-neutral-800 text-white rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer flex-none border border-black"
                    title={t('account.google')}
                    disabled={loading}
                  >
                    <svg className="w-[30px] h-[30px] fill-white" viewBox="0 0 512 512">
                      <path d="M500 261.8C500 403.3 403.1 504 260 504 122.8 504 12 393.2 12 256S122.8 8 260 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9c-88.3-85.2-252.5-21.2-252.5 118.2 0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9l-140.8 0 0-85.3 236.1 0c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                    </svg>
                  </button>

                  {/* Yandex */}
                  <button
                    type="button"
                    onClick={handleYandexClick}
                    className="w-[58px] h-[58px] bg-black hover:bg-neutral-800 text-white rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer flex-none border border-black"
                    title={t('account.yandex')}
                    disabled={loading}
                  >
                    <svg className="w-[30px] h-[30px] fill-white" viewBox="0 0 24 24">
                      <path d="M16.376 12.644L21 2h-3.842l-4.624 10.644h3.842z M13.915 24v-3.733c0-2.822-.352-3.64-1.407-5.988L6.933 2H3l7.124 15.709V24h3.79z" />
                    </svg>
                  </button>
                </div>

                {/* Telegram Login area */}
                <div className="w-full flex justify-center mt-2">
                  {isLocalHost() ? (
                    /* Emulator for local testing */
                    <button
                      type="button"
                      onClick={handleLocalTelegramLogin}
                      className="h-[40px] px-6 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-[20px] transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#2AABEE]"
                    >
                      {/* Telegram Icon */}
                      <svg className="w-[18px] h-[18px] fill-white" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.37.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/>
                      </svg>
                      <span>{t('account.telegram')}</span>
                    </button>
                  ) : (
                    /* Official Telegram Widget for Production */
                    <TelegramWidgetContainer
                      botName={import.meta.env.VITE_TELEGRAM_BOT_NAME || 'HotStuffStoreBot'}
                      onAuth={handleTelegramLoginSuccess}
                    />
                  )}
                </div>

              </div>
            </div>
          ) : (
            /* Verify Step (OTP/Password) - Styled in same clean white minimalist theme */
            <form onSubmit={handleVerifySubmit} className="w-full flex flex-col text-left">
              {isRegistered && password ? (
                <div className="flex flex-col mb-4">
                  <div className="text-[13px] text-neutral-500 leading-relaxed mb-4 ml-1">
                    {t('account.registered_pwd')}
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[14px] text-black font-normal ml-3 mb-1.5 leading-none">{t('account.password_label')}</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-[54px] bg-white border border-black rounded-[20px] px-5 text-[15px] text-black placeholder-neutral-400 outline-none transition-all focus:border-black/70"
                      disabled={loading}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col mb-4">
                  <div className="text-[13px] text-neutral-500 leading-relaxed mb-4 px-1 text-center">
                    {t('account.sent_code')} <br />
                    <strong className="text-black font-mono">{identifier}</strong>.
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[14px] text-black font-normal text-center mb-3">{t('account.otp_label')}</label>
                    <div className="flex justify-center gap-1.5 sm:gap-2">
                      {[0, 1, 2, 3, 4, 5].map((idx) => (
                        <input
                          key={idx}
                          id={`code-${idx}`}
                          type="text"
                          maxLength="1"
                          value={code[idx]}
                          onChange={(e) => handleCodeChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          className="w-10 h-10 sm:w-11 sm:h-11 bg-white border border-black text-center text-lg font-bold text-black focus:border-black/70 outline-none rounded-[10px]"
                          disabled={loading}
                        />
                      ))}
                    </div>
                    <div className="text-center mt-6">
                      {countdown > 0 ? (
                        <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider font-sans">
                          {t('account.resend_timer', { count: countdown })}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => triggerOtpSend(identifier)}
                          className="text-[11px] font-bold text-black hover:text-primary uppercase tracking-wider bg-transparent border-none cursor-pointer transition-colors font-sans focus-visible:outline-none focus-visible:underline"
                          disabled={loading}
                        >
                          {t('account.resend_btn')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[54px] bg-black hover:bg-neutral-900 text-white font-normal text-[15px] rounded-[20px] transition-colors flex items-center justify-center gap-3 cursor-pointer"
                >
                  <span>{t('account.confirm')}</span>
                  {loading && (
                    <svg className="animate-spin h-[18px] w-[18px] text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3">
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="w-full text-center text-[11px] font-bold text-neutral-500 hover:text-black uppercase tracking-wider py-1 bg-transparent border-none cursor-pointer"
                  disabled={loading}
                >
                  {t('account.back')}
                </button>
              </div>
            </form>
          )}

          {/* Image-accurate Disclaimer */}
          <p className="text-[9.5px] text-black/90 leading-[1.6] text-center font-normal px-2 mt-4 max-w-[325px]">
            {t('account.terms_text')}
          </p>

        </div>
      )}
      </div>
    </div>
  );
}

function TelegramWidgetContainer({ botName, onAuth }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '20');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'false');
    
    window.onTelegramAuth = (user) => {
      onAuth(user);
    };
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.async = true;

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }
  }, [botName, onAuth]);

  return <div ref={containerRef} className="flex justify-center items-center h-10" />;
}
