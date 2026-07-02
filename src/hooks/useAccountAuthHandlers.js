import { startTransition } from 'react';
import { supabase } from '../lib/supabase';

export function useAccountAuthHandlers({
  t, navigate, lang,
  identifier, code,
  setIsLoggedIn, setLoggedInUser, setSessionUser, setRegisteredUsers, setSavedAccounts,
  setError, setLoading, setCountdown, setCode, setStep,
  setIsSessionLoading, setIdentifier, setPassword,
  validateEmail
}) {

  const getOAuthRedirectUrl = () => {
    return window.location.origin + window.location.pathname;
  };

  const loginSuccess = (userVal, avatarUrl = null) => {
    const normalizedUser = userVal.trim().toLowerCase();
    setIsLoggedIn(true);
    setLoggedInUser(normalizedUser);

    // Set a simulated sessionUser for mock login flow
    const mockSessionUser = {
      email: normalizedUser,
      user_metadata: {
        full_name: normalizedUser === 'admin@hotstuffplay.com' ? 'Администратор' : 'Тестовый Пользователь',
        avatar_url: avatarUrl
      }
    };
    setSessionUser(mockSessionUser);

    localStorage.setItem('hs_user', JSON.stringify({ emailOrPhone: normalizedUser, avatar_url: avatarUrl }));

    window.dispatchEvent(new Event('hs_auth_change'));

    // Safely add as structured object to hs_registered_users
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
    if (!savedList.some(item => item.email.trim().toLowerCase() === normalizedUser)) {
      savedList.push({ email: normalizedUser, avatar_url: avatarUrl });
      localStorage.setItem('hs_registered_users', JSON.stringify(savedList));
    }

    setRegisteredUsers(savedList.map(item => item.email.trim().toLowerCase()));

    if (!['test@test.com', 'admin@hotstuffplay.com', '+77777777777', '87777777777'].includes(normalizedUser)) {
      setSavedAccounts(prev => {
        if (prev.some(item => item.email === normalizedUser)) {
          return prev.map(item => item.email === normalizedUser ? { ...item, avatar_url: avatarUrl || item.avatar_url } : item);
        }
        return [...prev, { email: normalizedUser, avatar_url: avatarUrl }];
      });
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getOAuthRedirectUrl(),
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline'
          }
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
      loginSuccess(email, mockUser.photo_url);
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
      localStorage.setItem('hs_user', JSON.stringify({
        emailOrPhone,
        avatar_url: user.photo_url || null,
        displayName
      }));

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
      if (emailOrPhone && !savedList.some(item => item.email.trim().toLowerCase() === emailOrPhone.trim().toLowerCase())) {
        savedList.push({ email: emailOrPhone, avatar_url: user.photo_url || null });
        localStorage.setItem('hs_registered_users', JSON.stringify(savedList));
      }

      setRegisteredUsers(savedList.map(item => item.email.trim().toLowerCase()));

      const emailClean = emailOrPhone.trim().toLowerCase();
      if (emailClean && !['test@test.com', 'admin@hotstuffplay.com', '+77777777777', '87777777777'].includes(emailClean)) {
        setSavedAccounts(prev => {
          if (prev.some(item => item.email === emailClean)) {
            return prev.map(item => item.email === emailClean ? { ...item, avatar_url: user.photo_url || item.avatar_url } : item);
          }
          return [...prev, { email: emailClean, avatar_url: user.photo_url || null }];
        });
      }

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

  const handleIdentifierSubmit = async (e, setIsRegistered) => {
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

  return {
    handleGoogleLogin, isLocalHost, handleLocalTelegramLogin,
    handleTelegramLoginSuccess, handleYandexClick, triggerOtpSend,
    handleIdentifierSubmit, handleVerifySubmit, loginSuccess,
    handleLogout
  };
}
