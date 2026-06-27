import LoginStep1 from './LoginStep1';
import LoginStep2 from './LoginStep2';

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
        <LoginStep1
          t={t}
          savedAccounts={savedAccounts}
          setIdentifier={setIdentifier}
          loginSuccess={loginSuccess}
          setSavedAccounts={setSavedAccounts}
          setRegisteredUsers={setRegisteredUsers}
          handleIdentifierSubmit={handleIdentifierSubmit}
          identifier={identifier}
          loading={loading}
          handleGoogleLogin={handleGoogleLogin}
          handleYandexClick={handleYandexClick}
          isLocalHost={isLocalHost}
          handleLocalTelegramLogin={handleLocalTelegramLogin}
          handleTelegramLoginSuccess={handleTelegramLoginSuccess}
        />
      ) : (
        <LoginStep2
          t={t}
          setStep={setStep}
          isRegistered={isRegistered}
          setError={setError}
          identifier={identifier}
          loading={loading}
          handleVerifySubmit={handleVerifySubmit}
          password={password}
          setPassword={setPassword}
          code={code}
          handleCodeChange={handleCodeChange}
          handleKeyDown={handleKeyDown}
          countdown={countdown}
          triggerOtpSend={triggerOtpSend}
        />
      )}

      {/* Image-accurate Disclaimer */}
      <p className="text-[11px] text-zinc-400 leading-relaxed text-center font-normal px-2 mt-4 max-w-[325px]">
        {t('account.terms_text')}
      </p>
    </div>
  );
}
