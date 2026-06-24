import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function TelegramAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [userData, setUserData] = useState(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const hash = params.get('hash');
    const firstName = params.get('first_name');
    const lastName = params.get('last_name');
    const username = params.get('username');
    const photoUrl = params.get('photo_url');
    const authDate = params.get('auth_date');

    if (!id || !hash) {
      setStatus('error');
      setErrorMsg('Недостаточно данных для авторизации. Передан неверный токен или отсутствует хэш.');
      return;
    }

    // Prepare user object matching the rest of the application
    const user = {
      emailOrPhone: username ? `@${username}` : `tg_${id}`,
      id,
      hash,
      firstName: firstName || 'Пользователь',
      lastName: lastName || '',
      username: username || '',
      photoUrl: photoUrl || '',
      authDate: authDate || '',
      isTelegram: true
    };

    // Save to localStorage
    localStorage.setItem('hs_user', JSON.stringify(user));
    setUserData(user);
    setStatus('success');
  }, []);

  // Handle automatic redirect on success
  useEffect(() => {
    if (status !== 'success') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/account');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, navigate]);

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#f0ece0] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#54a3e4]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#c39c59]/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/[0.03] border border-white/10 backdrop-blur-md p-8 rounded-none text-center shadow-2xl relative z-10"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center py-6">
            {/* Elegant Custom Spinner */}
            <div className="w-12 h-12 border-2 border-[#54a3e4]/20 border-t-[#54a3e4] rounded-full animate-spin mb-6" />
            <h1 className="text-xl font-bold tracking-wider uppercase mb-2">Проверка авторизации</h1>
            <p className="text-sm text-stone-400">Пожалуйста, подождите, мы обрабатываем данные Telegram...</p>
          </div>
        )}

        {status === 'success' && userData && (
          <div className="py-4">
            {/* Telegram Blue Success Icon / Avatar */}
            <div className="w-20 h-20 bg-[#54a3e4]/15 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#54a3e4]/30 relative overflow-hidden">
              {userData.photoUrl ? (
                <img 
                  src={userData.photoUrl} 
                  alt={userData.firstName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl">👤</span>
              )}
            </div>
            
            <h1 className="text-2xl font-bold tracking-wider uppercase mb-3">Добро пожаловать, {userData.firstName}!</h1>
            <p className="text-stone-400 text-sm mb-8 leading-relaxed">
              Вы успешно авторизовались через Telegram. Мы перенаправим вас в личный кабинет через {countdown} сек.
            </p>

            <button
              onClick={() => navigate('/account')}
              className="w-full bg-[#c39c59] hover:bg-[#d6b06c] text-[#0B0D12] font-bold text-xs tracking-[0.2em] py-4 text-center uppercase transition-all rounded-none"
            >
              Перейти в кабинет
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30 text-2xl">
              ✕
            </div>
            <h1 className="text-xl font-bold tracking-wider uppercase mb-3 text-red-400">Ошибка авторизации</h1>
            <p className="text-stone-400 text-sm mb-8 leading-relaxed">
              {errorMsg || 'Не удалось завершить вход через Telegram. Попробуйте еще раз.'}
            </p>

            <button
              onClick={() => navigate('/account')}
              className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs tracking-[0.2em] py-4 text-center uppercase transition-all rounded-none"
            >
              Вернуться назад
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
