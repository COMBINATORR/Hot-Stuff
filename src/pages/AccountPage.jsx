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
