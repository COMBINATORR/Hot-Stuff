import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const cartVariants = {
  rest: { scale: 1, rotate: 0 },
  bounce: {
    scale: [1, 1.25, 0.85, 1.15, 1],
    rotate: [0, -10, 10, -5, 0],
    transition: { duration: 0.5, ease: "easeInOut" }
  }
};

export default function DesktopHeader({
  t, i18n,
  isLightPage,
  setNavOpen,
  getHomePath,
  setSearchOpen,
  session,
  handleAccountClick,
  handleHeaderLogout,
  onOpenFavorites,
  favoritesCount,
  onOpenCart,
  setCartOpen,
  cartCount
}) {
  const [cartBouncing, setCartBouncing] = useState(false);

  useEffect(() => {
    const handleBounce = () => {
      setCartBouncing(true);
      setTimeout(() => setCartBouncing(false), 600);
    };
    window.addEventListener('cart-bounce', handleBounce);
    return () => window.removeEventListener('cart-bounce', handleBounce);
  }, []);

  return (
    <header className="w-full absolute top-12 left-0 z-40 mobile-premium-header flex flex-col pointer-events-none">
      {/* RED TEST BANNER */}
      <div className="w-full bg-[#E31E24] text-white text-center py-1.5 px-4 text-[9px] md:text-[10px] font-sans font-black tracking-widest uppercase select-none pointer-events-auto">
        {t('header.test_banner', 'ТЕСТОВЫЙ РЕЖИМ: Цены снижены для проверки оплаты')}
      </div>
      <div className="w-full px-6 md:px-12 lg:px-16 flex items-center justify-between h-20 pointer-events-auto">

        {/* LEFT: Menu / Sandwich (Desktop), Logo (Mobile) */}
        <div className="flex items-center gap-3">
          {/* Sandwich for Desktop */}
          <motion.button
            whileHover="hover"
            initial="rest"
            animate="rest"
            onClick={() => setNavOpen(true)}
            className={`hidden md:flex items-center justify-center gap-3 bg-transparent ${isLightPage ? 'text-black' : 'text-white'} border-none focus:outline-none focus-visible:text-primary active:scale-95 transition-all group h-[24px]`}
            aria-label={t('header.open_menu', 'Открыть меню')}
          >
            <div className="flex flex-col justify-between items-start w-6 h-[10px]" aria-hidden="true">
              <motion.span
                variants={{
                  rest: { width: 24, x: 0 },
                  hover: { width: 16, x: 8 }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`h-[1.5px] ${isLightPage ? 'bg-black' : 'bg-white'} group-hover:bg-primary group-focus-visible:bg-primary transition-colors`}
              />
              <motion.span
                variants={{
                  rest: { width: 16 },
                  hover: { width: 24 }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`h-[1.5px] ${isLightPage ? 'bg-black' : 'bg-white'} group-hover:bg-primary group-focus-visible:bg-primary transition-colors`}
              />
            </div>
            <span className={`font-bold text-[11px] tracking-[0.2em] font-sans ${isLightPage ? 'text-black' : 'text-white'} uppercase group-hover:text-primary group-focus-visible:text-primary transition-colors flex items-center mt-[1px]`}>
              {t('header.menu', 'МЕНЮ')}
            </span>
          </motion.button>

          {/* Logo for Mobile */}
          <div className="flex md:hidden flex-col items-start justify-center select-none">
            <Link to={getHomePath()} className={`text-[22px] font-light tracking-[0.25em] ${isLightPage ? 'text-black' : 'text-white'} uppercase leading-none font-sans`}>
              HOT STUFF
            </Link>
            <span className={`text-[12px] tracking-[0.45em] ${isLightPage ? 'text-black' : 'text-white'} font-normal mt-1.5 uppercase font-sans`}>
              {t('footer.subtitle', 'АТЫРАУ')}
            </span>
          </div>
        </div>

        {/* CENTER: Logo (Desktop only) */}
        <div className="hidden md:flex flex-col items-center justify-center text-center select-none absolute left-1/2 -translate-x-1/2">
          <Link to={getHomePath()} className={`text-[36px] font-medium tracking-[0.3em] ${isLightPage ? 'text-black' : 'text-white'} uppercase leading-none`}>
            HOT STUFF
          </Link>
          <span className={`text-[18px] tracking-[0.45em] ${isLightPage ? 'text-black' : 'text-white'} font-medium mt-2 uppercase`}>
            {t('footer.subtitle', 'АТЫРАУ')}
          </span>
        </div>

        {/* RIGHT: Search, Profile, Cart, Sandwich (Mobile) */}
        <div className="flex items-center justify-end gap-5 md:gap-6">
          <button
            onClick={() => setSearchOpen(true)}
            className={`flex items-center justify-center w-[24px] h-[24px] bg-transparent ${isLightPage ? 'text-black' : 'text-white'} border-none focus:outline-none hover:text-primary focus-visible:text-primary active:scale-90 transition-all rounded-[2px]`}
            aria-label={t('header.open_search', 'Открыть поиск')}
          >
            <motion.span
              whileHover={{ scale: 1.15, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="material-symbols-outlined text-[22px] font-light leading-none block"
              aria-hidden="true"
            >
              search
            </motion.span>
          </button>
          <AnimatePresence mode="popLayout" initial={false}>
            {session ? (
              <motion.div
                key="auth-user"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="hidden sm:flex items-center gap-3 relative"
              >
                <Link to={i18n.language === 'ru' ? '/account' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}/account`} className="flex items-center focus:outline-none transition-transform hover:scale-105 duration-200">
                  {session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture ? (
                    <motion.img
                      whileHover={{ scale: 1.15, y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      src={session.user.user_metadata.avatar_url || session.user.user_metadata.picture}
                      alt="Avatar"
                      className="w-[28px] h-[28px] rounded-full object-cover border border-white/20 hover:border-primary transition-all duration-300"
                    />
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.15, y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="w-[28px] h-[28px] rounded-full bg-primary text-black flex items-center justify-center text-[12px] font-bold font-mono hover:bg-[#ffe088] transition-all duration-300"
                    >
                      {session.user.email ? session.user.email[0].toUpperCase() : 'U'}
                    </motion.div>
                  )}
                </Link>
                <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase font-sans">
                  <Link
                    to={i18n.language === 'ru' ? '/account' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}/account`}
                    className={`hover:text-primary transition-colors ${
                      isLightPage ? 'text-black font-bold' : 'text-white font-bold'
                    }`}
                  >
                    {t('header.cabinet', 'кабинет')}
                  </Link>
                  <span className="opacity-30">/</span>
                  <button
                    onClick={handleHeaderLogout}
                    className={`hover:text-error transition-colors uppercase font-bold cursor-pointer bg-transparent border-none p-0 ${
                      isLightPage ? 'text-black/60' : 'text-white/60'
                    }`}
                    title={t('header.logout', 'выйти')}
                  >
                    {t('header.logout', 'выйти')}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="guest-user"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="hidden sm:flex"
              >
                <NavLink
                  to={i18n.language === 'ru' ? '/account' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}/account`}
                  onClick={handleAccountClick}
                  className={`flex items-center justify-center w-[24px] h-[24px] bg-transparent ${isLightPage ? 'text-black' : 'text-white'} border-none focus:outline-none hover:text-primary focus-visible:text-primary active:scale-90 transition-all rounded-[2px]`}
                  title={t('header.login_register', 'Вход / Регистрация')}
                >
                  <motion.span
                    whileHover={{ scale: 1.15, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="material-symbols-outlined text-[22px] font-light leading-none block"
                  >
                    person
                  </motion.span>
                </NavLink>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={onOpenFavorites}
            className={`relative flex items-center justify-center w-[24px] h-[24px] bg-transparent ${isLightPage ? 'text-black' : 'text-white'} border-none focus:outline-none hover:text-primary focus-visible:text-primary active:scale-90 transition-all rounded-[2px]`}
            aria-label={t('header.open_favorites', 'Открыть избранное')}
          >
            <motion.span
              whileHover={{ scale: 1.15, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="material-symbols-outlined text-[22px] font-light leading-none block"
              aria-hidden="true"
            >
              favorite
            </motion.span>
            {favoritesCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none z-10">
                {favoritesCount}
              </span>
            )}
          </button>
          <motion.button
            onClick={onOpenCart || (() => setCartOpen(true))}
            id="header-cart-btn"
            variants={cartVariants}
            animate={cartBouncing ? "bounce" : "rest"}
            className={`relative flex items-center justify-center w-[24px] h-[24px] bg-transparent ${isLightPage ? 'text-black' : 'text-white'} border-none focus:outline-none hover:text-primary focus-visible:text-primary active:scale-90 transition-all rounded-[2px]`}
            aria-label={t('header.open_cart', 'Открыть корзину')}
          >
            <motion.span
              whileHover={{ scale: 1.15, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="material-symbols-outlined text-[22px] font-light leading-none block"
              aria-hidden="true"
            >
              shopping_bag
            </motion.span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none z-10">
                {cartCount}
              </span>
            )}
          </motion.button>

          {/* Sandwich for Mobile */}
          <motion.button
            whileHover="hover"
            initial="rest"
            animate="rest"
            onClick={() => setNavOpen(true)}
            className={`flex md:hidden items-center justify-center w-[24px] h-[24px] bg-transparent ${isLightPage ? 'text-black' : 'text-white'} border-none focus:outline-none focus-visible:text-primary active:scale-90 transition-all group`}
            aria-label={t('header.open_menu', 'Открыть меню')}
          >
            <div className="flex flex-col justify-between items-end w-6 h-[10px]" aria-hidden="true">
              <motion.span
                variants={{
                  rest: { width: 24, x: 0 },
                  hover: { width: 16, x: 8 }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`h-[1.5px] ${isLightPage ? 'bg-black' : 'bg-white'} group-hover:bg-primary group-focus-visible:bg-primary transition-colors`}
              />
              <motion.span
                variants={{
                  rest: { width: 16 },
                  hover: { width: 24 }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`h-[1.5px] ${isLightPage ? 'bg-black' : 'bg-white'} group-hover:bg-primary group-focus-visible:bg-primary transition-colors`}
              />
            </div>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
