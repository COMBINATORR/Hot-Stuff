import TelegramLoginWidget from '../TelegramLoginWidget';

export default function LoginStep1({
  t,
  savedAccounts,
  setIdentifier,
  loginSuccess,
  setSavedAccounts,
  setRegisteredUsers,
  handleIdentifierSubmit,
  identifier,
  loading,
  handleGoogleLogin,
  handleYandexClick,
  isLocalHost,
  handleLocalTelegramLogin,
  handleTelegramLoginSuccess,
}) {
  return (
    <div className="w-full flex flex-col">
      {/* List of previously saved / authorized accounts */}
      {savedAccounts.length > 0 && (
        <div className="flex flex-col gap-3 mb-6 w-full">
          <span className="text-[11px] font-sans font-black tracking-widest text-neutral-400 uppercase text-center mb-1">
            {t('account.login_as')}
          </span>
          <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
            {savedAccounts.map((email) => (
              <div
                key={email}
                className="group flex items-center justify-between w-full h-12 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl px-4 transition-all duration-300 cursor-pointer"
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
                  className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-neutral-200/50 transition-all cursor-pointer border-none bg-transparent outline-none"
                  title={t('account.delete_from_list', 'Удалить из списка')}
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))}
          </div>
          <div className="relative flex items-center justify-center my-4 w-full">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-zinc-100"></div>
            </div>
            <span className="relative px-3 bg-white text-zinc-400 text-xs font-normal">
              {t('account.other_account', 'Другой аккаунт')}
            </span>
          </div>
        </div>
      )}

      {/* Social Buttons Stack — Google · Yandex · Telegram (at the TOP now) */}
      <div className="flex flex-col gap-3 w-full mb-2">
        {/* Google button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          title={t('account.google')}
          className="w-full h-12 bg-white hover:bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-center gap-3 transition-all cursor-pointer text-[14px] text-neutral-800 font-medium active:scale-98"
          disabled={loading}
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>{t('account.google', 'Войти через Google')}</span>
        </button>

        {/* Yandex button */}
        <button
          type="button"
          onClick={handleYandexClick}
          title={t('account.yandex')}
          className="w-full h-12 bg-white hover:bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-center gap-3 transition-all cursor-pointer text-[14px] text-neutral-800 font-medium active:scale-98"
          disabled={loading}
        >
          <img src="/yandex-logo-eng.svg" alt="Yandex" className="w-5 h-5 flex-shrink-0 object-contain" />
          <span>{t('account.yandex', 'Войти через Яндекс')}</span>
        </button>

        {/* Telegram button / widget */}
        <div className="w-full flex justify-center h-12 items-center">
          {isLocalHost() ? (
            <button
              type="button"
              onClick={handleLocalTelegramLogin}
              className="w-full h-12 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-sans font-bold text-[12px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-transparent shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path fill="white" d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
              </svg>
              <span>{t('account.local_login', 'Войти (Локально)')}</span>
            </button>
          ) : (
            <TelegramLoginWidget
              botName={import.meta.env.VITE_TELEGRAM_BOT_NAME || 'HotStuffStore_bot'}
              onAuth={handleTelegramLoginSuccess}
              size="large"
              radius="12"
            />
          )}
        </div>
      </div>

      {/* Beautiful Divider */}
      <div className="relative flex items-center justify-center my-6 w-full">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-zinc-100"></div>
        </div>
        <span className="relative px-3 bg-white text-zinc-400 text-xs font-normal">
          {t('account.or_via_email', 'или с помощью почты')}
        </span>
      </div>

      {/* Email Form (at the BOTTOM now) */}
      <form onSubmit={handleIdentifierSubmit} className="w-full flex flex-col text-left">
        {/* Input block */}
        <div className="flex flex-col mb-4">
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={t('account.email_placeholder', 'Введите ваш Email')}
            className="w-full h-12 bg-white border border-neutral-200 rounded-xl px-4 text-[15px] text-black placeholder-neutral-400 outline-none transition-all focus:border-black/70 font-normal"
            disabled={loading}
          />
        </div>

        {/* Continue button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-black hover:bg-neutral-900 text-white font-medium text-[15px] rounded-xl transition-colors flex items-center justify-center gap-3 cursor-pointer"
        >
          <span className="font-normal tracking-wide">{t('account.continue')}</span>
        </button>
      </form>
    </div>
  );
}
