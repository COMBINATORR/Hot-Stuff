import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ALL_PRODUCTS } from '../data/products';

export default function AccountPage({ onAddToCart }) {
  const [identifier, setIdentifier] = useState('');
  const [step, setStep] = useState(1); // 1 = Input, 2 = Verify Code / Password
  const [isRegistered, setIsRegistered] = useState(false);
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(['', '', '', '']); // 4 digit code inputs
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const navigate = useNavigate();

  // Simple mock database of registered logins
  const MOCK_REGISTERED_USERS = [
    'test@test.com',
    'admin@hotstuff.kz',
    '+77777777777',
    '87777777777'
  ];

  // Check login state on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('hs_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setIsLoggedIn(true);
        setLoggedInUser(parsed.emailOrPhone);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

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

  const handleSsoLogin = (provider, mockEmail) => {
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      loginSuccess(`${provider} ID: ${mockEmail}`);
    }, 1200);
  };

  const handleIdentifierSubmit = (e) => {
    e.preventDefault();
    setError('');
    const cleanedVal = identifier.trim();

    if (!cleanedVal) {
      setError('Пожалуйста, введите телефон или почту');
      return;
    }

    if (!validateEmail(cleanedVal) && !validatePhone(cleanedVal)) {
      setError('Неверный формат почты или телефона. Пример: test@mail.ru или +7 (777) 777-77-77');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const registered = MOCK_REGISTERED_USERS.includes(cleanedVal);
      setIsRegistered(registered);
      setStep(2);
    }, 800);
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (isRegistered) {
        if (password === 'password' || password === '123456' || password === '1234') {
          loginSuccess(identifier);
        } else {
          setError('Неверный пароль. Попробуйте "1234" или "password"');
        }
      } else {
        const enteredCode = code.join('');
        if (enteredCode === '1234') {
          loginSuccess(identifier);
        } else {
          setError('Неверный код подтверждения. Введите "1234" для проверки');
        }
      }
    }, 800);
  };

  const loginSuccess = (userVal) => {
    setIsLoggedIn(true);
    setLoggedInUser(userVal);
    localStorage.setItem('hs_user', JSON.stringify({ emailOrPhone: userVal }));
  };

  const handleLogout = () => {
    localStorage.removeItem('hs_user');
    setIsLoggedIn(false);
    setLoggedInUser(null);
    setStep(1);
    setIdentifier('');
    setPassword('');
    setCode(['', '', '', '']);
    setError('');
  };

  const handleCodeChange = (index, value) => {
    if (isNaN(value)) return;
    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);

    if (value && index < 3) {
      document.getElementById(`code-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus();
    }
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
    <div className="bg-background text-on-surface min-h-screen font-sans flex flex-col justify-center items-center px-margin-mobile md:px-margin-desktop py-28 selection:bg-primary-container selection:text-on-primary-container relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none z-0"></div>

      <div className={`w-full ${isLoggedIn ? 'max-w-5xl' : 'max-w-[450px]'} bg-surface-container-low border border-white/5 p-6 md:p-10 rounded-2xl shadow-2xl relative z-10 font-sans transition-all duration-500`}>
        
        {isLoggedIn ? (
          <div className="space-y-10 text-left">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-4xl text-primary font-light">account_circle</span>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">Кабинет Покупателя</h1>
                  <p className="text-xs text-outline font-bold uppercase tracking-wider mt-1">{loggedInUser}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="self-start md:self-auto border border-white/10 hover:border-[#FF5C3F] hover:text-[#FF5C3F] text-white font-sans font-black text-[9px] tracking-[0.2em] px-6 py-3.5 uppercase transition-colors rounded-[2px] cursor-pointer"
              >
                ВЫЙТИ ИЗ АККАУНТА
              </button>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Loyalty & Active Shipping */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Loyalty Tier */}
                <div className="p-6 bg-neutral-900/40 border border-white/5 rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black tracking-wider text-white uppercase">Клуб Привилегий</h3>
                    <span className="bg-primary/10 text-primary text-[8px] font-black tracking-widest px-2.5 py-1 rounded-[2px] uppercase">
                      HOT STUFF GOLD
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white leading-none">12%</span>
                    <span className="text-[10px] text-outline uppercase font-bold tracking-wide">Ваша персональная скидка</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-bold text-outline uppercase tracking-wider">
                      <span>До скидки 15% (VIP уровень) осталось:</span>
                      <span className="text-white">45 000 ₸</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '60%' }} />
                    </div>
                  </div>
                </div>

                {/* 2. Anonymous Active Delivery */}
                <div className="p-6 bg-neutral-900/40 border border-white/5 rounded-xl space-y-5">
                  <div className="flex items-center gap-3 text-green-400">
                    <span className="material-symbols-outlined text-[20px] font-light">local_shipping</span>
                    <h3 className="text-xs font-black tracking-wider text-white uppercase">Текущая Доставка</h3>
                  </div>
                  
                  <div className="border-l-2 border-primary pl-4 py-1 space-y-2">
                    <p className="text-xs font-black text-white">Заказ №10492 — Доставляется курьером сегодня</p>
                    <p className="text-[10px] text-outline">Интервал: 18:00 – 22:00. Курьер свяжется за 30 минут.</p>
                  </div>

                  {/* Anti-Anxiety Privacy Banner */}
                  <div className="bg-[#09090b]/80 border border-white/10 p-4 rounded-[4px] flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">visibility_off</span>
                    <div>
                      <h4 className="text-[9px] font-black text-white uppercase tracking-wider">Грантия 100% анонимности доставки:</h4>
                      <p className="text-[9px] text-outline/80 leading-relaxed mt-1 font-normal">
                        Заказ упакован в плотный непрозрачный сейф-пакет без каких-либо логотипов или названия магазина. В накладной курьера содержимое указано как «Аксессуары (косметика)». Курьер не знает, что внутри посылки.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Order History */}
                <div className="p-6 bg-neutral-900/40 border border-white/5 rounded-xl space-y-4">
                  <h3 className="text-xs font-black tracking-wider text-white uppercase mb-2">История Покупок</h3>
                  
                  <div className="divide-y divide-white/5 text-xs font-sans">
                    <div className="py-4 flex justify-between items-center gap-4">
                      <div>
                        <p className="font-bold text-white uppercase">Заказ №9810 от 14.05.2026</p>
                        <p className="text-[10px] text-outline mt-1">LELO Sona™ 3 Cruise x1 — Выполнен</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">38 900 ₸</p>
                        <button 
                          onClick={() => {
                            const prod = ALL_PRODUCTS.find(p => p.id === 4);
                            if (prod) handleAddWishlistItem(prod);
                          }}
                          className="text-[9px] font-black tracking-wider text-white hover:text-primary uppercase mt-1.5 transition-colors block cursor-pointer"
                        >
                          Повторить в 1 клик
                        </button>
                      </div>
                    </div>
                    <div className="py-4 flex justify-between items-center gap-4">
                      <div>
                        <p className="font-bold text-white uppercase">Заказ №8520 от 02.04.2026</p>
                        <p className="text-[10px] text-outline mt-1">Personal Moisturizer x1 — Выполнен</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">12 500 ₸</p>
                        <span className="text-[9px] font-bold text-outline/50 uppercase tracking-widest mt-1.5 block">Архив</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Wishlist (Избранное) */}
              <div className="space-y-6">
                <div className="p-6 bg-neutral-900/40 border border-white/5 rounded-xl space-y-6">
                  <h3 className="text-xs font-black tracking-wider text-white uppercase">Избранные Товары</h3>
                  
                  <div className="space-y-5">
                    {wishlistProducts.map(product => (
                      <div key={product.id} className="flex gap-4 p-3 bg-neutral-950/40 border border-white/5 rounded-lg">
                        <div className="w-16 h-16 bg-neutral-900 rounded-[4px] overflow-hidden flex items-center justify-center flex-none">
                          <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-[10px] font-black text-white uppercase tracking-wider truncate max-w-[150px]">{product.name}</h4>
                            <p className="text-[11px] text-primary font-bold mt-0.5">{product.price.toLocaleString('ru-KZ')} ₸</p>
                          </div>
                          <button
                            onClick={() => handleAddWishlistItem(product)}
                            className="bg-primary hover:bg-[#ffe088] text-black font-sans font-black text-[8px] tracking-widest uppercase py-1.5 px-3 rounded-[2px] transition-colors self-start mt-2 cursor-pointer"
                          >
                            В КОРЗИНУ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div>
            {/* Header logo/title */}
            <div className="mb-8 text-center">
              <span className="material-symbols-outlined text-4xl text-primary font-light mb-4 block">lock_open</span>
              <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">Вход в Кабинет</h1>
              <p className="text-[10px] text-outline font-bold uppercase tracking-widest mt-2">HOT STUFF ATYRAU</p>
            </div>

            {error && (
              <div className="bg-[#FF5C3F]/10 border border-[#FF5C3F]/20 text-[#FF5C3F] text-xs py-3 px-4 rounded-[2px] mb-6 text-left font-bold">
                ⚠️ {error}
              </div>
            )}

            {step === 1 ? (
              <div className="space-y-6">
                <form onSubmit={handleIdentifierSubmit} className="space-y-6 text-left">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black tracking-widest text-outline uppercase">Почта или Номер телефона</label>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="example@mail.com или +7..."
                      className="w-full bg-neutral-950 border border-white/10 px-4 py-3 text-xs text-white focus:border-primary outline-none transition-colors rounded-[2px]"
                      disabled={loading}
                    />
                    <p className="text-[9px] text-outline/60 leading-relaxed mt-2 font-normal">
                      * На указанный контакт будет отправлен одноразовый код для входа. Никаких паролей, рекламных рассылок и спама.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-on-primary font-sans font-black text-[10px] tracking-[0.2em] py-4 uppercase hover:bg-[#ffe088] transition-colors rounded-[2px] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      'ПРОДОЛЖИТЬ'
                    )}
                  </button>
                </form>

                {/* SSO Section */}
                <div className="pt-6 border-t border-white/5 space-y-4 text-center">
                  <div className="flex items-center justify-between text-[9px] font-bold text-outline/40 uppercase tracking-widest">
                    <span className="h-px bg-white/5 flex-1 mr-3"></span>
                    <span>Войти через</span>
                    <span className="h-px bg-white/5 flex-1 ml-3"></span>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    {/* Google */}
                    <button
                      type="button"
                      onClick={() => handleSsoLogin('Google', 'google_user@gmail.com')}
                      className="w-11 h-11 bg-neutral-950 hover:bg-white/5 border border-white/10 rounded-full flex items-center justify-center transition-all duration-300 group cursor-pointer"
                      title="Войти через Google"
                      disabled={loading}
                    >
                      <svg className="w-5 h-5 fill-white/60 group-hover:fill-[#4285F4] transition-colors" viewBox="0 0 24 24">
                        <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.377-2.87-6.377-6.377 0-3.508 2.87-6.377 6.377-6.377 1.62 0 3.09.614 4.225 1.62l3.14-3.14A11.96 11.96 0 0 0 12.24 2c-5.523 0-10 4.477-10 10s4.477 10 10 10c5.787 0 9.63-4.068 9.63-9.782 0-.668-.073-1.328-.193-1.933H12.24z"/>
                      </svg>
                    </button>

                    {/* Apple */}
                    <button
                      type="button"
                      onClick={() => handleSsoLogin('Apple', 'apple_user@icloud.com')}
                      className="w-11 h-11 bg-neutral-950 hover:bg-white/5 border border-white/10 rounded-full flex items-center justify-center transition-all duration-300 group cursor-pointer"
                      title="Войти через Apple ID"
                      disabled={loading}
                    >
                      <svg className="w-5 h-5 fill-white/60 group-hover:fill-white transition-colors" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.1.09 2.23-.58 2.95-1.39z"/>
                      </svg>
                    </button>

                    {/* Telegram */}
                    <button
                      type="button"
                      onClick={() => handleSsoLogin('Telegram', '@telegram_user')}
                      className="w-11 h-11 bg-neutral-950 hover:bg-white/5 border border-white/10 rounded-full flex items-center justify-center transition-all duration-300 group cursor-pointer"
                      title="Войти через Telegram"
                      disabled={loading}
                    >
                      <svg className="w-5 h-5 fill-white/60 group-hover:fill-[#0088cc] transition-colors" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.97-.74 3.79-1.65 6.32-2.74 7.59-3.27 3.6-1.5 4.35-1.76 4.84-1.77.11 0 .35.03.5.15.13.1.17.24.19.34.02.13.03.39.01.59z"/>
                      </svg>
                    </button>

                    {/* Yandex */}
                    <button
                      type="button"
                      onClick={() => handleSsoLogin('Yandex', 'yandex_user@yandex.ru')}
                      className="w-11 h-11 bg-neutral-950 hover:bg-white/5 border border-white/10 rounded-full flex items-center justify-center transition-all duration-300 group cursor-pointer"
                      title="Войти через Яндекс"
                      disabled={loading}
                    >
                      <span className="font-serif font-black text-white/60 group-hover:text-[#FF0000] text-lg transition-colors leading-none select-none">Я</span>
                    </button>
                  </div>
                  <p className="text-[9px] text-outline/50 mt-4 leading-normal text-center font-normal">
                    Нажимая кнопку продолжения или SSO, вы соглашаетесь с условиями конфиденциальности. Доставка и биллинг полностью анонимны.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleVerifySubmit} className="space-y-6 text-left">
                {isRegistered ? (
                  <div className="space-y-4">
                    <div className="text-xs text-outline leading-relaxed mb-4">
                      Вы зарегистрированы в системе. Пожалуйста, введите пароль от вашего аккаунта.
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black tracking-widest text-outline uppercase">Ваш Пароль</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-neutral-950 border border-white/10 px-4 py-3 text-xs text-white focus:border-primary outline-none transition-colors rounded-[2px]"
                        disabled={loading}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-xs text-outline leading-relaxed mb-4">
                      Мы отправили 4-значный код подтверждения на указанный контакт: <strong className="text-white font-mono">{identifier}</strong>.
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black tracking-widest text-outline uppercase text-center mb-3">Код из СМС или Почты</label>
                      <div className="flex justify-center gap-3">
                        {[0, 1, 2, 3].map((idx) => (
                          <input
                            key={idx}
                            id={`code-${idx}`}
                            type="text"
                            maxLength="1"
                            value={code[idx]}
                            onChange={(e) => handleCodeChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            className="w-12 h-12 bg-neutral-950 border border-white/10 text-center text-xl font-bold text-white focus:border-primary outline-none transition-colors rounded-[2px]"
                            disabled={loading}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-on-primary font-sans font-black text-[10px] tracking-[0.2em] py-4 uppercase hover:bg-[#ffe088] transition-colors rounded-[2px] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      'ПОДТВЕРДИТЬ'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(''); }}
                    className="w-full bg-transparent text-outline hover:text-white font-sans font-black text-[9px] tracking-[0.15em] py-2 uppercase transition-colors text-center"
                    disabled={loading}
                  >
                    ← ИЗМЕНИТЬ ПОЧТУ / ТЕЛЕФОН
                  </button>
                </div>
              </form>
            )}

            {/* Privacy Trust Grid */}
            <div className="mt-8 pt-6 border-t border-white/5 space-y-4 text-left">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 font-light">visibility_off</span>
                <div>
                  <h4 className="text-[10px] font-black text-white uppercase tracking-wider">100% Анонимный биллинг</h4>
                  <p className="text-[9px] text-outline/70 leading-normal mt-0.5 font-normal">В банковской выписке отобразится нейтральное название («Retail Atyrau»), без упоминания деликатных товаров.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 font-light">shield_lock</span>
                <div>
                  <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Безопасная SSL-авторизация</h4>
                  <p className="text-[9px] text-outline/70 leading-normal mt-0.5 font-normal">Все персональные данные и сессии входа защищены современным 256-битным протоколом шифрования.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 font-light">mail</span>
                <div>
                  <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Конфиденциальность контактов</h4>
                  <p className="text-[9px] text-outline/70 leading-normal mt-0.5 font-normal">Используем телефон или почту только для передачи кодов входа и статусов доставки. Никакого спама.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-[9px] text-outline/40 uppercase tracking-[0.25em] font-bold text-center">
              Безопасный зашифрованный вход Hot Stuff
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
