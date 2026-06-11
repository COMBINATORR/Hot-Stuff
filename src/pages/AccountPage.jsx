import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function AccountPage() {
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

  // Simple mock database
  const MOCK_REGISTERED_USERS = [
    'test@test.com',
    'admin@hotstuff.kz',
    '+77777777777',
    '87777777777'
  ];

  // Validation
  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const validatePhone = (val) => {
    // Matches digits with optional +, length between 10-12
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
      // Check if user is already registered in our mock database
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
        // Mock password check (allow "password" or "123456" for test)
        if (password === 'password' || password === '123456' || password === '1234') {
          loginSuccess(identifier);
        } else {
          setError('Неверный пароль. Попробуйте "1234" или "password"');
        }
      } else {
        // Mock code check (allow "1234" for new registrations)
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
    // Save to localStorage for persistence
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

    // Auto-focus next input
    if (value && index < 3) {
      document.getElementById(`code-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace to focus previous input
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus();
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen font-sans flex flex-col justify-center items-center px-margin-mobile md:px-margin-desktop py-24 selection:bg-primary-container selection:text-on-primary-container relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="w-full max-w-[450px] bg-surface-container-low border border-white/5 p-8 md:p-10 rounded-2xl shadow-2xl relative z-10 font-sans text-center">
        
        {isLoggedIn ? (
          <div className="space-y-6">
            <span className="material-symbols-outlined text-5xl text-primary font-light">account_circle</span>
            <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">Личный Кабинет</h1>
            <p className="text-xs text-outline font-bold uppercase tracking-widest">Вы вошли как</p>
            <p className="text-sm text-white font-mono bg-neutral-950 px-4 py-2 border border-white/5 rounded-[4px] break-all">
              {loggedInUser}
            </p>
            
            <div className="pt-6 border-t border-white/10 space-y-4">
              <button
                onClick={() => navigate('/catalog')}
                className="w-full bg-primary text-on-primary font-sans font-black text-[10px] tracking-[0.2em] py-4 uppercase hover:bg-[#ffe088] transition-colors rounded-[2px]"
              >
                ПЕРЕЙТИ В КАТАЛОГ
              </button>
              <button
                onClick={handleLogout}
                className="w-full bg-transparent border border-white/10 text-white hover:border-[#FF5C3F] hover:text-[#FF5C3F] font-sans font-black text-[10px] tracking-[0.2em] py-4 uppercase transition-colors rounded-[2px]"
              >
                ВЫЙТИ ИЗ АККАУНТА
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header logo/title */}
            <div className="mb-8">
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
                <div className="pt-6 border-t border-white/5 space-y-4">
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

            <div className="mt-8 text-[9px] text-outline/50 uppercase tracking-widest">
              Безопасный зашифрованный вход Hot Stuff
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
