import TelegramLoginWidget from '../TelegramLoginWidget';

export default function AccountLoginForm({
  t,
  step,
  setStep,
  isRegistered,
  error,
  setError,
  savedAccounts,
  setIdentifier,
  loginSuccess,
  setSavedAccounts,
  setRegisteredUsers,
  MOCK_REGISTERED_USERS,
  handleIdentifierSubmit,
  identifier,
  loading,
  handleGoogleLogin,
  handleYandexClick,
  isLocalHost,
  handleLocalTelegramLogin,
  handleTelegramLoginSuccess,
  handleVerifySubmit,
  password,
  setPassword,
  code,
  handleCodeChange,
  handleKeyDown,
  countdown,
  triggerOtpSend,
}) {
  return (
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
                    name="email"
                    autoComplete="email"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={t('account.email', 'Email')}
                    className="w-full h-[54px] bg-white border border-black rounded-[20px] px-5 text-[16px] text-black placeholder-neutral-400 outline-none transition-all focus:border-black/70 font-normal"
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
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center justify-between mt-8 mb-6 w-full">
                <div className="h-[0.5px] bg-neutral-300 flex-1"></div>
                <span className="px-4 text-[13px] text-neutral-400 font-normal whitespace-nowrap">{t('account.or_via')}</span>
                <div className="h-[0.5px] bg-neutral-300 flex-1"></div>
              </div>

              {/* Social Buttons — Google · Yandex · Telegram */}
              <div className="flex flex-col items-center justify-center gap-4 mb-14 w-full">

                <div className="flex justify-center gap-4 w-full">
                  {/* Google — official multicolor G (inline SVG, no external file) */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-[58px] h-[58px] bg-white hover:bg-neutral-50 rounded-[20px] flex items-center justify-center transition-all duration-300 cursor-pointer flex-none border border-black shadow-sm active:scale-95"
                    title={t('account.google')}
                    disabled={loading}
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </button>

                  {/* Yandex — official red background, white Y */}
                  <button
                    type="button"
                    onClick={handleYandexClick}
                    className="w-[58px] h-[58px] bg-[#FC3F1D] hover:bg-[#E03517] rounded-[20px] border border-black shadow-sm flex items-center justify-center transition-all duration-300 cursor-pointer flex-none active:scale-95"
                    title={t('account.yandex')}
                    disabled={loading}
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.654 20.893H16.892L16.892 3.107H11.517C6.732 3.107 4.298 6.302 4.298 9.947C4.298 13.593 6.732 16.666 11.517 16.666H14.153L14.153 14.288H11.664C8.423 14.288 6.643 12.277 6.643 9.947C6.643 7.618 8.423 5.485 11.664 5.485H14.153V10.153L9.695 20.893H12.01L14.654 13.974V20.893Z" fill="white"/>
                    </svg>
                  </button>
                </div>

                {/* Telegram Widget Area */}
                <div className="w-full flex justify-center mt-2 border-t border-neutral-100 pt-4">
                  {isLocalHost() ? (
                    <button
                      type="button"
                      onClick={handleLocalTelegramLogin}
                      className="w-full max-w-[220px] h-[40px] bg-[#2AABEE] hover:bg-[#229ED9] text-white font-sans font-bold text-[11px] uppercase tracking-wider rounded-[20px] transition-all cursor-pointer flex items-center justify-center gap-2 border border-black shadow-sm"
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
                      radius="20"
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
                      className="w-full h-[54px] bg-white border border-black rounded-[20px] px-5 text-[16px] text-black placeholder-neutral-400 outline-none transition-all focus:border-black/70"
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
  );
}
