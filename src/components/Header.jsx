import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Animated flame SVG logo ──────────────── */
const FlameLogo = () => (
  <motion.svg
    width="32" height="32" viewBox="0 0 32 32" fill="none"
    xmlns="http://www.w3.org/2000/svg"
    animate={{ scale: [1, 1.06, 1] }}
    transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
    aria-hidden="true"
  >
    <motion.path
      d="M16 3 C11 10 5 14 7 22 C8 27 12 30 16 32 C20 30 24 27 25 22 C27 14 21 10 16 3Z"
      animate={{
        fill: ['hsl(42,88%,54%)', 'hsl(30,80%,46%)', 'hsl(42,88%,54%)'],
      }}
      transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
    />
    <path
      d="M16 12 C14 15 11 18 12 21 C12.6 23.5 14 25.5 16 27 C18 25.5 19.4 23.5 20 21 C21 18 18 15 16 12Z"
      fill="rgba(255,255,255,0.22)"
    />
  </motion.svg>
);

/* ── Cart icon with badge ─────────────────── */
const CartIcon = ({ count = 0 }) => (
  <Link to="/cart" className="header-icon-btn" style={{ position: 'relative' }} aria-label="Корзина">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
    {count > 0 && (
      <span style={{
        position: 'absolute', top: -3, right: -3,
        background: 'var(--brand-gold)', color: '#fff',
        fontSize: '0.6rem', fontWeight: 800,
        width: 16, height: 16, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{count}</span>
    )}
  </Link>
);

const navItems = [
  { key: 'home',     to: '/' },
  { key: 'catalog',  to: '/catalog' },
  { key: 'cart',     to: '/cart' },
  { key: 'checkout', to: '/checkout' },
];

const LANGS = ['ru', 'kz', 'en'];

export default function Header() {
  const { t, i18n } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef(null);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawer on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setDrawerOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  return (
    <>
      {/* Promo bar */}
      <div className="promo-bar">
        🔥 <span>БЕСПЛАТНАЯ ДОСТАВКА</span> при заказе от 15 000 ₸ &nbsp;|&nbsp;
        <span>KASPI PAY</span> — оплата в рассрочку
      </div>

      {/* Main header */}
      <header
        id="site-header"
        className="site-header"
        style={{ boxShadow: scrolled ? 'var(--shadow-md)' : 'none' }}
      >
        <div className="container-hs header-inner">
          {/* Logo */}
          <Link to="/" className="header-logo" aria-label="Hot Stuff — Главная">
            <FlameLogo />
            <span className="header-logo-text">HOT STUFF</span>
          </Link>

          {/* Desktop nav */}
          <nav className="header-nav" aria-label="Основная навигация">
            {navItems.map(({ key, to }) => (
              <NavLink
                key={key}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  isActive ? 'active' : ''
                }
              >
                {t(`nav.${key}`)}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="header-actions">
            {/* Lang switcher (desktop) */}
            <div className="hidden md:flex items-center gap-1">
              {LANGS.map((lang) => (
                <button
                  key={lang}
                  className={`lang-btn ${i18n.language === lang ? 'active' : ''}`}
                  onClick={() => i18n.changeLanguage(lang)}
                  aria-label={`Язык: ${lang.toUpperCase()}`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <CartIcon count={0} />

            {/* Mobile burger */}
            <button
              className="header-icon-btn md:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Открыть меню"
              aria-expanded={drawerOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6"  x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="mobile-drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.div
              ref={drawerRef}
              className="mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              role="dialog"
              aria-modal="true"
              aria-label="Меню навигации"
            >
              {/* Drawer header */}
              <div className="mobile-drawer-header">
                <Link to="/" className="header-logo" onClick={() => setDrawerOpen(false)}>
                  <FlameLogo />
                  <span className="header-logo-text">HOT STUFF</span>
                </Link>
                <button
                  className="header-icon-btn"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Закрыть меню"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6"  y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Drawer nav */}
              <nav className="mobile-drawer-nav" aria-label="Мобильная навигация">
                {navItems.map(({ key, to }) => (
                  <NavLink
                    key={key}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) => isActive ? 'active' : ''}
                    onClick={() => setDrawerOpen(false)}
                  >
                    {t(`nav.${key}`)}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </NavLink>
                ))}
              </nav>

              {/* Drawer lang */}
              <div className="drawer-lang">
                {LANGS.map((lang) => (
                  <button
                    key={lang}
                    className={`lang-btn ${i18n.language === lang ? 'active' : ''}`}
                    onClick={() => { i18n.changeLanguage(lang); setDrawerOpen(false); }}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
