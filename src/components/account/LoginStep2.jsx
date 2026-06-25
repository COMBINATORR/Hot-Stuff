export default function LoginStep2({
  t,
  setStep,
  isRegistered,
  setError,
  identifier,
  loading,
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
  );
}
