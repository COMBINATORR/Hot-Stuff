import Breadcrumbs from '../components/Breadcrumbs';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAccountPage } from '../hooks/useAccountPage';

import AccountDashboard from '../components/account/AccountDashboard';
import AccountLoginForm from '../components/account/AccountLoginForm';

export default function AccountPage({ onAddToCart, lang }) {
  const { t, i18n } = useTranslation();
  const {
    identifier, setIdentifier,
    step, setStep,
    isRegistered, setIsRegistered,
    password, setPassword,
    code, setCode,
    error, setError,
    loading, setLoading,
    isLoggedIn, setIsLoggedIn,
    isSessionLoading, setIsSessionLoading,
    loggedInUser, setLoggedInUser,
    countdown, setCountdown,
    isPrivate, setIsPrivate,
    activeOrders, setActiveOrders,
    orderHistory, setOrderHistory,
    favorites, setFavorites,
    loyaltyData, setLoyaltyData,
    sessionUser, setSessionUser,
    getDisplayAvatar, getDisplayName, getDisplayEmailOrPhone,
    navigate,
    MOCK_REGISTERED_USERS,
    registeredUsers, setRegisteredUsers,
    savedAccounts, setSavedAccounts,
    validateEmail, validatePhone,
    handleGoogleLogin, isLocalHost, handleLocalTelegramLogin,
    handleTelegramLoginSuccess, handleYandexClick, triggerOtpSend,
    handleIdentifierSubmit, handleVerifySubmit, loginSuccess,
    handleLogout, handleTogglePrivate, handleCodeChange, handleKeyDown,
    showSharePush, setShowSharePush, handleShareWishlist, handleAddWishlistItem
  } = useAccountPage({ t, lang, onAddToCart });

  if (isSessionLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-center items-center bg-background text-on-surface">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-xl font-light tracking-[0.2em] text-black uppercase animate-pulse">
            HOT STUFF
          </h1>
          <div className="flex items-center gap-2">
            <svg 
              className="animate-spin h-6 w-6 text-black" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeDasharray="3 3"
            >
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" />
            </svg>
            <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest font-sans">
              {t('account.checking_session', 'Проверка сессии...')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-background text-on-surface pt-24 pb-20 md:pb-28">
      <Breadcrumbs theme="dark" />
      <div className="flex-1 flex flex-col justify-center items-center px-4 md:px-8">
      
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
                <span className="text-[11px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest font-sans">{t('account.share', 'Поделиться')}</span>
                <span className="text-[10px] text-black/30 dark:text-white/30 font-medium">{t('account.now', 'сейчас')}</span>
              </div>
              <h4 className="text-xs font-black text-black dark:text-white mb-0.5 uppercase tracking-wide">{t('account.anon_title_short', 'Hot Stuff Анонимность')}</h4>
              <p className="text-[11.5px] text-black/70 dark:text-white/70 leading-relaxed font-normal">
                {t('account.hint_copied')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      
      {isLoggedIn ? (

        <AccountDashboard
          t={t}
          getDisplayAvatar={getDisplayAvatar}
          getDisplayName={getDisplayName}
          getDisplayEmailOrPhone={getDisplayEmailOrPhone}
          isPrivate={isPrivate}
          handleTogglePrivate={handleTogglePrivate}
          loading={loading}
          setLoading={setLoading}
          handleLogout={handleLogout}
          loyaltyData={loyaltyData}
          activeOrders={activeOrders}
          orderHistory={orderHistory}
          lang={lang}
          favorites={favorites}
          handleAddWishlistItem={handleAddWishlistItem}
          handleShareWishlist={handleShareWishlist}
          MOCK_REGISTERED_USERS={MOCK_REGISTERED_USERS}
          setSavedAccounts={setSavedAccounts}
          setRegisteredUsers={setRegisteredUsers}
        />

      ) : (

        <AccountLoginForm
          t={t}
          step={step}
          setStep={setStep}
          isRegistered={isRegistered}
          error={error}
          setError={setError}
          savedAccounts={savedAccounts}
          setIdentifier={setIdentifier}
          loginSuccess={loginSuccess}
          setSavedAccounts={setSavedAccounts}
          setRegisteredUsers={setRegisteredUsers}
          MOCK_REGISTERED_USERS={MOCK_REGISTERED_USERS}
          handleIdentifierSubmit={handleIdentifierSubmit}
          identifier={identifier}
          loading={loading}
          handleGoogleLogin={handleGoogleLogin}
          handleYandexClick={handleYandexClick}
          isLocalHost={isLocalHost}
          handleLocalTelegramLogin={handleLocalTelegramLogin}
          handleTelegramLoginSuccess={handleTelegramLoginSuccess}
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
      </div>
    </div>
  );
}

