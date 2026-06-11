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
    }, 1200);
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
          setError('Неверный пароль. Попробуйте "1234"');
        }
      } else {
        const enteredCode = code.join('');
        if (enteredCode === '1234') {
          loginSuccess(identifier);
        } else {
          setError('Неверный код подтверждения. Введите "1234" для проверки');
        }
      }
    }, 1200);
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
    <div className={`w-full min-h-screen flex flex-col justify-center items-center bg-background text-on-surface py-20 md:py-28 ${isLoggedIn ? 'px-margin-mobile md:px-margin-desktop' : 'px-4 md:px-8'}`}>
      
      {isLoggedIn ? (
        /* Authenticated Dashboard view */
        <div className="w-full max-w-5xl bg-surface-container-low border border-white/5 p-6 md:p-10 rounded-2xl shadow-2xl font-sans relative z-10">
          {/* Background radial highlight for dark dashboard */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none z-0"></div>

          <div className="relative z-10 space-y-10 text-left">
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
        </div>
      ) : (
        /* Image-accurate Light Mobile login view wrapped in a white card/plate */
        <div className="w-full max-w-[360px] bg-white text-black rounded-[28px] shadow-2xl p-6 md:p-8 flex flex-col items-center select-none z-10 border border-black/5">
          
          {/* Header */}
          <h1 className="text-xl font-light tracking-[0.2em] text-black uppercase mb-12 mt-4 text-center">
            HOT STUFF
          </h1>

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
                    Телефон или Email
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Телефон или Email"
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
                  onClick={() => handleSsoLogin('Telegram', '@telegram_user')}
                  className="w-[58px] h-[58px] bg-white border border-black rounded-full flex items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer flex-none"
                  title="Войти через Telegram"
                  disabled={loading}
                >
                  <svg className="w-[22px] h-[22px] fill-black ml-[-2px]" viewBox="0 0 24 24">
                    <path d="M9.78 18.65l.28-4.24 7.68-6.92c.33-.29-.07-.45-.51-.16l-9.5 5.98-4.11-1.28c-.89-.28-.91-.89.19-1.32L20.2 3.65c.74-.27 1.39.18 1.15 1.2l-2.78 13.07c-.2 1-.8 1.24-1.63.78l-4.24-3.12-2.05 1.97-.92-1.9z"/>
                  </svg>
                </button>

                {/* Apple */}
                <button
                  type="button"
                  onClick={() => handleSsoLogin('Apple', 'apple_user@icloud.com')}
                  className="w-[58px] h-[58px] bg-white border border-black rounded-full flex items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer flex-none"
                  title="Войти через Apple ID"
                  disabled={loading}
                >
                  <svg className="w-6 h-6 fill-black mb-[2px]" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.1.09 2.23-.58 2.95-1.39z"/>
                  </svg>
                </button>

                {/* Google */}
                <button
                  type="button"
                  onClick={() => handleSsoLogin('Google', 'google_user@gmail.com')}
                  className="w-[58px] h-[58px] bg-white border border-black rounded-full flex items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer flex-none"
                  title="Войти через Google"
                  disabled={loading}
                >
                  <svg className="w-[22px] h-[22px] fill-black" viewBox="0 0 24 24">
                    <path d="M21.35 11.1H12v3.8h5.38c-.24 1.28-.96 2.37-2.04 3.1v2.57h3.3c1.93-1.78 3.04-4.4 3.04-7.57 0-.62-.05-1.22-.13-1.9z"/>
                    <path d="M12 20.6c2.43 0 4.47-.8 5.96-2.2l-3.3-2.57c-.9.6-2.07.97-3.32.97-2.56 0-4.73-1.73-5.5-4.07H2.43v2.65c1.5 2.97 4.57 4.97 8.1 4.97z"/>
                    <path d="M6.5 12.73a5.55 5.55 0 0 1 0-3.46V6.62H2.43a9.89 9.89 0 0 0 0 7.6L6.5 12.73z"/>
                    <path d="M12 7.4c1.32 0 2.5.45 3.44 1.35l2.58-2.58C16.46 4.7 14.43 3.9 12 3.9c-3.53 0-6.6 2-8.1 4.97l4.07 3.15c.77-2.34 2.94-4.07 5.5-4.07z"/>
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            /* Verify Step (OTP/Password) - Styled in same clean white minimalist theme */
            <form onSubmit={handleVerifySubmit} className="w-full flex flex-col text-left">
              {isRegistered ? (
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
                  <div className="text-[13px] text-neutral-500 leading-relaxed mb-4 px-1">
                    Мы отправили 4-значный код на контакт: <strong className="text-black font-mono">{identifier}</strong>.
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[14px] text-black font-normal text-center mb-3">Код подтверждения</label>
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
                          className="w-12 h-12 bg-white border border-black text-center text-xl font-bold text-black focus:border-black/70 outline-none rounded-[12px]"
                          disabled={loading}
                        />
                      ))}
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
