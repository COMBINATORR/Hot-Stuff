import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function MobileTabBar({
  t, i18n,
  setSearchOpen,
  setCartOpen,
  cartCount,
  session,
  handleAccountClick
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
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] h-16 flex items-center justify-around px-4 z-50 md:hidden rounded-full"
      style={{
        background: 'rgba(9, 9, 11, 0.45)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)'
      }}
    >
      <NavLink
        to={i18n.language === 'ru' ? '/catalog' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}/catalog`}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive ? 'text-primary' : 'text-white/60 hover:text-white'
          }`
        }
      >
        <span className="material-symbols-outlined text-[22px] font-light">grid_view</span>
        <span className="text-[9px] font-bold tracking-wider uppercase mt-1">{t('header.catalog', 'Каталог')}</span>
      </NavLink>

      <button
        onClick={() => setSearchOpen(true)}
        className="flex flex-col items-center justify-center flex-1 h-full bg-transparent border-none text-white/60 hover:text-white transition-colors focus:outline-none"
      >
        <span className="material-symbols-outlined text-[22px] font-light">search</span>
        <span className="text-[9px] font-bold tracking-wider uppercase mt-1">{t('header.search', 'Поиск')}</span>
      </button>

      <motion.button
        onClick={() => setCartOpen(true)}
        id="mobile-cart-btn"
        animate={cartBouncing ? { scale: [1, 1.25, 0.85, 1.15, 1], rotate: [0, -10, 10, -5, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center flex-1 h-full bg-transparent border-none text-white/60 hover:text-white transition-colors focus:outline-none relative"
      >
        <span className="material-symbols-outlined text-[22px] font-light">shopping_bag</span>
        {cartCount > 0 && (
          <span className="absolute top-1.5 right-1/2 translate-x-4 bg-primary text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
            {cartCount}
          </span>
        )}
        <span className="text-[9px] font-bold tracking-wider uppercase mt-1">{t('header.cart', 'Корзина')}</span>
      </motion.button>

      <NavLink
        to={i18n.language === 'ru' ? '/account' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}/account`}
        onClick={handleAccountClick}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${
            isActive ? 'text-primary' : 'text-white/60 hover:text-white'
          }`
        }
      >
        {session ? (
          session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture ? (
            <img
              src={session.user.user_metadata.avatar_url || session.user.user_metadata.picture}
              alt="Avatar"
              className="w-[22px] h-[22px] rounded-full object-cover border border-white/20"
            />
          ) : (
            <div className="w-[22px] h-[22px] rounded-full bg-primary text-black flex items-center justify-center text-[9px] font-bold font-mono">
              {session.user.email ? session.user.email[0].toUpperCase() : 'U'}
            </div>
          )
        ) : (
          <span className="material-symbols-outlined text-[22px] font-light">person</span>
        )}
        <span className="text-[9px] font-bold tracking-wider uppercase mt-1">{t('header.cabinet', 'Кабинет')}</span>
      </NavLink>

      <button
        onClick={() => window.location.replace('https://www.google.com')}
        className="flex flex-col items-center justify-center flex-1 h-full bg-transparent border-none text-primary hover:text-[#ffe088] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-90"
      >
        <span className="material-symbols-outlined text-[22px] font-light">visibility_off</span>
        <span className="text-[9px] font-bold tracking-wider uppercase mt-1">{t('header.panic', 'Паника')}</span>
      </button>
    </div>
  );
}
