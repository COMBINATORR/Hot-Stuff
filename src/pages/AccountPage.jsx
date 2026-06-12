import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_PRODUCTS } from '../data/products';
import { supabase } from '../lib/supabase';

export default function AccountPage({ onAddToCart, lang }) {
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
    const handleAuthSession = (session) => {
      if (session && session.user) {
        const email = session.user.email.trim().toLowerCase();
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
      }
    };

    console.log('[AccountPage] Checking current active Supabase session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AccountPage] getSession result:', session?.user?.email ? 'Active session found' : 'No active session');
      handleAuthSession(session);
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
      }
    });

    return () => {
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
      let errMsg = err.message || 'Ошибка авторизации через Google';
      if (errMsg.includes('provider is not enabled') || errMsg.includes('Unsupported provider')) {
        errMsg = 'Провайдер Google не включен в настройках авторизации вашего проекта Supabase. Пожалуйста, перейдите в Supabase Dashboard -> Authentication -> Providers -> Google и активируйте его.';
      }
      setError(errMsg);
      setLoading(false);
    }
  };

  const handleTelegramClick = () => {
    console.log('[Auth] Clicked Telegram SSO - Edge Function integration planned');
  };

  const handleYandexClick = () => {
    console.log('[Auth] Clicked Yandex SSO - Edge Function integration planned');
  };

  const triggerOtpSend = async (emailVal) => {
    setError('');
    setLoading(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: emailVal,
        options: {
          emailRedirectTo: window.location.origin + window.location.pathname
        }
      });

      if (otpError) throw otpError;

      setCountdown(60);
      setCode(['', '', '', '', '', '']); // Reset 6 digit code
      setStep(2);
      
      console.log(`[Supabase OTP] OTP sent to email ${emailVal}`);
    } catch (err) {
      console.error('[Supabase OTP Send Error]', err);
      setError(err.message || 'Не удалось отправить одноразовый код на почту.');
    } finally {
      setLoading(false);
    }
  };

  const handleIdentifierSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanedVal = identifier.trim().toLowerCase();

    if (!cleanedVal) {
      setError('Пожалуйста, введите Email');
      return;
    }

    if (!validateEmail(cleanedVal)) {
      setError('Неверный формат почты. Пример: test@mail.ru');
      return;
    }

    // Check if user is already in our registered list
    const isReg = registeredUsers.includes(cleanedVal);
    if (isReg) {
      // Fast path: immediately log in without OTP!
      loginSuccess(cleanedVal);
      return;
    }

    // Otherwise, first-time login: send OTP via Supabase
    setIsRegistered(false);
    await triggerOtpSend(cleanedVal);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const enteredCode = code.join('').trim();
    if (enteredCode.length < 6) {
      setError('Пожалуйста, введите все 6 цифр кода');
      setLoading(false);
      return;
    }

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
        throw new Error('Не удалось подтвердить код. Пользователь не найден.');
      }
    } catch (err) {
      console.error('[Supabase Verify Error]', err);
      setError(err.message || 'Неверный код подтверждения. Пожалуйста, попробуйте еще раз.');
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
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[Logout Error]', err);
    }
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
      alert(`Товар ${product.name} добавлен в корзину!`);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-background text-on-surface py-20 md:py-28 px-4 md:px-8">
      
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
                <span className="text-[11px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest font-sans">Сообщения</span>
                <span className="text-[10px] text-black/30 dark:text-white/30 font-medium">сейчас</span>
              </div>
              <h4 className="text-xs font-black text-black dark:text-white mb-0.5 uppercase tracking-wide">Hot Stuff</h4>
              <p className="text-[11.5px] text-black/70 dark:text-white/70 leading-relaxed font-normal">
                Код подтверждения: <span className="font-bold text-black dark:text-white font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-xs select-all">{generatedOtp}</span>. Не сообщайте его никому.
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
                <span className="text-[11px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest font-sans">Поделиться</span>
                <span className="text-[10px] text-black/30 dark:text-white/30 font-medium">сейчас</span>
              </div>
              <h4 className="text-xs font-black text-black dark:text-white mb-0.5 uppercase tracking-wide">Hot Stuff Анонимность</h4>
              <p className="text-[11.5px] text-black/70 dark:text-white/70 leading-relaxed font-normal">
                Ссылка скопирована! Получатель подарка останется полностью анонимным.
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
                  <h1 className="text-xl md:text-2xl font-black text-black uppercase tracking-wider">Личный кабинет</h1>
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
                  title={isPrivate ? "Выключить режим приватности" : "Включить режим приватности"}
                >
                  <span className="material-symbols-outlined text-[16px] leading-none">
                    {isPrivate ? 'visibility_off' : 'visibility'}
                  </span>
                  <span>{isPrivate ? 'Приватно' : 'Публично'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="border border-black/10 hover:border-[#FF5C3F] hover:text-[#FF5C3F] text-black font-sans font-black text-[9px] tracking-[0.2em] px-6 py-3.5 uppercase transition-colors rounded-[2px] cursor-pointer"
                >
                  ВЫЙТИ ИЗ АККАУНТА
                </button>
              </div>
            </div>

            {/* Main Dashboard Grid - Bento Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 1. Loyalty Tier (Bento: 2 cols) */}
              <div className="p-6 md:p-8 bg-neutral-50 border border-black/5 rounded-[28px] space-y-4 lg:col-span-2 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black tracking-wider text-black uppercase">Клуб Привилегий</h3>
                    <span className="bg-primary/15 text-[#b28b10] text-[8px] font-black tracking-widest px-2.5 py-1 rounded-[2px] uppercase">
                      HOT STUFF GOLD
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-black leading-none">12%</span>
                    <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wide">Ваша персональная скидка</span>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                    <span>До скидки 15% (VIP уровень) осталось:</span>
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
                    <h3 className="text-xs font-black tracking-wider text-black uppercase">Текущая Доставка</h3>
                  </div>
                  <div className="border-l-2 border-primary pl-4 py-1 space-y-2">
                    <p className="text-xs font-black text-black">Заказ №10492 — Доставляется курьером сегодня</p>
                    <p className="text-[10px] text-neutral-500">Интервал: 18:00 – 22:00. Курьер свяжется за 30 минут.</p>
                  </div>
                </div>

                {/* Anti-Anxiety Privacy Banner */}
                <div className="bg-neutral-100 border border-black/5 p-4 rounded-[16px] flex items-start gap-3 mt-4">
                  <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">visibility_off</span>
                  <div>
                    <h4 className="text-[9px] font-black text-black uppercase tracking-wider">Гарантия 100% анонимности доставки:</h4>
                    <p className="text-[9px] text-neutral-600 leading-relaxed mt-1 font-normal">
                      Заказ упакован в плотный непрозрачный сейф-пакет без каких-либо логотипов. В накладной содержимое указано как «Аксессуары (косметика)».
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Order History (Bento: 2 cols) */}
              <div className="p-6 md:p-8 bg-neutral-50 border border-black/5 rounded-[28px] space-y-4 lg:col-span-2">
                <h3 className="text-xs font-black tracking-wider text-black uppercase mb-2">История Покупок</h3>
                
                <div className="divide-y divide-black/5 text-xs font-sans">
                  <div className="py-4 flex justify-between items-center gap-4">
                    <div>
                      <p className="font-bold text-black uppercase">Заказ №9810 от 14.05.2026</p>
                      <p className="text-[10px] text-neutral-500 mt-1">
                        {isPrivate ? 'Деликатный аксессуар •••• x1' : 'LELO Sona™ 3 Cruise x1'} — Выполнен
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900">38 900 ₸</p>
                      <button 
                        onClick={() => {
                          const prod = ALL_PRODUCTS.find(p => p.id === 4);
                          if (prod) handleAddWishlistItem(prod);
                        }}
                        className="text-[9px] font-black tracking-wider text-black hover:text-[#FF5C3F] uppercase mt-1.5 transition-colors block cursor-pointer bg-transparent border-none p-0"
                      >
                        Повторить в 1 клик
                      </button>
                    </div>
                  </div>
                  <div className="py-4 flex justify-between items-center gap-4">
                    <div>
                      <p className="font-bold text-black uppercase">Заказ №8520 от 02.04.2026</p>
                      <p className="text-[10px] text-neutral-500 mt-1">
                        {isPrivate ? 'Деликатный аксессуар •••• x1' : 'Personal Moisturizer x1'} — Выполнен
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900">12 500 ₸</p>
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-1.5 block">Архив</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Wishlist (Избранное) (Bento: 1 col) */}
              <div className="p-6 md:p-8 bg-neutral-50 border border-black/5 rounded-[28px] space-y-6 lg:col-span-1 flex flex-col justify-between">
                <div className="space-y-6">
                  <h3 className="text-xs font-black tracking-wider text-black uppercase">Избранные Товары</h3>
                  
                  <div className="space-y-5">
                    {wishlistProducts.map(product => (
                      <div key={product.id} className="flex gap-4 p-3 bg-white border border-black/5 rounded-lg">
                        <div className="w-16 h-16 bg-neutral-50 rounded-[4px] overflow-hidden flex items-center justify-center flex-none relative">
                          {isPrivate ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 text-neutral-400 select-none">
                              <span className="material-symbols-outlined text-[18px]">visibility_off</span>
                              <span className="text-[7px] font-bold uppercase tracking-wider mt-0.5">Скрыто</span>
                            </div>
                          ) : (
                            <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-[10px] font-black text-black uppercase tracking-wider truncate max-w-[150px]">
                              {isPrivate ? 'Интимный девайс ••••' : product.name}
                            </h4>
                            <p className="text-[11px] text-neutral-900 font-bold mt-0.5">{product.price.toLocaleString('ru-KZ')} ₸</p>
                          </div>
                          <button
                            onClick={() => handleAddWishlistItem(product)}
                            className="bg-black hover:bg-neutral-800 text-white font-sans font-black text-[8px] tracking-widest uppercase py-1.5 px-3 rounded-[2px] transition-colors self-start mt-2 cursor-pointer"
                          >
                            В КОРЗИНУ
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
            {step === 1 ? 'Вход / Регистрация' : (isRegistered ? 'Вход' : 'Регистрация')}
          </h2>

          {error && (
            <div className="w-full text-center text-xs text-[#FF5C3F] font-bold pb-4">
              ⚠️ {error}
            </div>
          )}

          {step === 1 ? (
            <div className="w-full flex flex-col">
              <form onSubmit={handleIdentifierSubmit} className="w-full flex flex-col text-left">
                {/* Input block */}
                <div className="flex flex-col mb-4">
                  <label className="text-[14px] text-black font-normal ml-3 mb-1.5 leading-none">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Email"
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
                  <span className="font-normal tracking-wide">Продолжить</span>
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
                <span className="px-4 text-[13px] text-neutral-400 font-normal whitespace-nowrap">Или через</span>
                <div className="h-[0.5px] bg-neutral-300 flex-1"></div>
              </div>

              {/* Social Buttons */}
              <div className="flex justify-center gap-4 mb-14">
                {/* Telegram */}
                <button
                  type="button"
                  onClick={handleTelegramClick}
                  className="w-[58px] h-[58px] bg-black hover:bg-neutral-800 text-white rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer flex-none border border-black"
                  title="Войти через Telegram"
                  disabled={loading}
                >
                  <svg className="w-[30px] h-[30px] fill-white" viewBox="0 0 512 512">
                    <path d="M371 176.7c-3.7 39.2-19.9 134.4-28.1 178.3-3.5 18.6-10.3 24.8-16.9 25.4-14.4 1.3-25.3-9.5-39.3-18.7-21.8-14.3-34.2-23.2-55.3-37.2-24.5-16.1-8.6-25 5.3-39.5 3.7-3.8 67.1-61.5 68.3-66.7 .2-.7 .3-3.1-1.2-4.4s-3.6-.8-5.1-.5c-2.2 .5-37.1 23.5-104.6 69.1-9.9 6.8-18.9 10.1-26.9 9.9-8.9-.2-25.9-5-38.6-9.1-15.5-5-27.9-7.7-26.8-16.3 .6-4.5 6.7-9 18.4-13.7 72.3-31.5 120.5-52.3 144.6-62.3 68.9-28.6 83.2-33.6 92.5-33.8 2.1 0 6.6 .5 9.6 2.9 2 1.7 3.2 4.1 3.5 6.7 .5 3.2 .6 6.5 .4 9.8z"/>
                  </svg>
                </button>

                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-[58px] h-[58px] bg-black hover:bg-neutral-800 text-white rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer flex-none border border-black"
                  title="Войти через Google"
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
                  title="Войти через Yandex"
                  disabled={loading}
                >
                  <svg className="w-[30px] h-[30px] fill-white" viewBox="0 0 24 24">
                    <path d="M16.376 12.644L21 2h-3.842l-4.624 10.644h3.842z M13.915 24v-3.733c0-2.822-.352-3.64-1.407-5.988L6.933 2H3l7.124 15.709V24h3.79z" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            /* Verify Step (OTP/Password) - Styled in same clean white minimalist theme */
            <form onSubmit={handleVerifySubmit} className="w-full flex flex-col text-left">
              {isRegistered && password ? (
                <div className="flex flex-col mb-4">
                  <div className="text-[13px] text-neutral-500 leading-relaxed mb-4 ml-1">
                    Вы зарегистрированы в системе. Пожалуйста, введите пароль.
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[14px] text-black font-normal ml-3 mb-1.5 leading-none">Ваш Пароль</label>
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
                    Мы отправили 6-значный код на контакт: <br />
                    <strong className="text-black font-mono">{identifier}</strong>.
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[14px] text-black font-normal text-center mb-3">Код подтверждения</label>
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
                          Отправить код повторно через {countdown} сек
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => triggerOtpSend(identifier)}
                          className="text-[11px] font-bold text-black hover:text-[#FF5C3F] uppercase tracking-wider bg-transparent border-none cursor-pointer transition-colors font-sans"
                          disabled={loading}
                        >
                          Отправить код повторно
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
                  <span>Подтвердить</span>
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
                  ← Назад к вводу
                </button>
              </div>
            </form>
          )}

          {/* Image-accurate Disclaimer */}
          <p className="text-[9.5px] text-black/90 leading-[1.6] text-center font-normal px-2 mt-4 max-w-[325px]">
            Нажимая продолжить, вы соглашаетесь с <span className="underline decoration-black underline-offset-2 cursor-pointer">условиями</span>. Ваши Ваши данные шифруются по протоколу SSL. Мы гарантируем 100% анонимность. Мы никогда не передаем их третьим лицам. Ваша почта используется только для отправки чеков и статуса заказа.
          </p>

        </div>
      )}
    </div>
  );
}
