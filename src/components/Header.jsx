import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

/** CartDrawer — slide-in panel (Stitch design) */
function CartDrawer({ isOpen, onClose, items = [], onUpdateQty, onRemove }) {
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const [promo, setPromo] = useState('');
  const navigate = useNavigate();

  // lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* overlay */}
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* drawer */}
          <motion.div
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.25,0.46,0.45,0.94] }}
          >
            {/* Header */}
            <div className="cart-drawer-header">
              <h2 className="label-caps text-on-surface tracking-[0.2em]">ВАША КОРЗИНА</h2>
              <button className="header-icon" onClick={onClose}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Items */}
            <div className="cart-drawer-items">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <span className="material-symbols-outlined text-5xl text-outline">shopping_bag</span>
                  <p className="label-caps text-on-surface-variant">Корзина пуста</p>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ duration: 0.25 }}
                      className="flex gap-4"
                    >
                      {/* image */}
                      <div className="w-24 h-24 bg-surface-container-low flex-none overflow-hidden">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          : <div className="product-card-placeholder text-2xl">{item.emoji || '🛍️'}</div>
                        }
                      </div>
                      {/* info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <p className="label-caps text-on-surface mb-1">{item.name}</p>
                          {item.variant && (
                            <p className="text-xs text-on-surface-variant mb-1">{item.variant}</p>
                          )}
                          <p className="text-primary font-body-md">{(item.price * item.qty).toLocaleString('ru-KZ')} ₸</p>
                        </div>
                        <div className="flex items-center justify-between">
                          {/* qty stepper */}
                          <div className="flex items-center border border-white/10">
                            <button
                              className="px-3 py-1 text-on-surface-variant hover:text-primary transition-colors"
                              onClick={() => onUpdateQty(item.id, Math.max(1, item.qty - 1))}
                            >−</button>
                            <span className="px-3 py-1 text-body-md min-w-[2rem] text-center">{item.qty}</span>
                            <button
                              className="px-3 py-1 text-on-surface-variant hover:text-primary transition-colors"
                              onClick={() => onUpdateQty(item.id, item.qty + 1)}
                            >+</button>
                          </div>
                          <button
                            className="label-caps text-[10px] text-on-surface-variant hover:text-error transition-colors"
                            onClick={() => onRemove(item.id)}
                          >Удалить</button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="cart-drawer-footer">
                {/* promo */}
                <div>
                  <p className="field-label mb-2">ПРОМОКОД</p>
                  <div className="flex gap-2">
                    <input
                      className="promo-input"
                      placeholder="Введите код"
                      value={promo}
                      onChange={e => setPromo(e.target.value)}
                    />
                    <button className="btn-outline px-4 py-0 text-[10px]">ПРИМЕНИТЬ</button>
                  </div>
                </div>
                {/* divider */}
                <div className="h-px bg-white/10" />
                {/* total */}
                <div className="flex items-end justify-between">
                  <span className="label-caps text-on-surface-variant">ИТОГО</span>
                  <span className="text-primary font-medium text-xl tracking-wide">
                    {total.toLocaleString('ru-KZ')} ₸
                  </span>
                </div>
                {/* CTA */}
                <button
                  className="btn-primary w-full py-5"
                  onClick={() => { onClose(); navigate('/checkout'); }}
                >
                  ОФОРМИТЬ ЗАКАЗ
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Main Header component */
export default function Header({ cartItems = [], onUpdateQty, onRemove }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [navOpen,  setNavOpen]  = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close nav on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setNavOpen(false); setCartOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const navLinks = [
    { to: '/catalog', label: 'Collections' },
    { to: '/catalog?cat=wellness', label: 'Wellness' },
    { to: '/catalog?cat=philosophy', label: 'Philosophy' },
  ];

  return (
    <>
      <header
        className="site-header"
        style={{ boxShadow: scrolled ? '0 4px 40px rgba(0,0,0,0.4)' : 'none' }}
      >
        <div className="container-hs header-inner">
          {/* LEFT — desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* MOBILE — hamburger */}
          <button className="header-icon md:hidden" onClick={() => setNavOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>

          {/* CENTER — Logo */}
          <Link to="/" className="header-logo-text absolute left-1/2 -translate-x-1/2">
            HOT STUFF
          </Link>

          {/* RIGHT — icons */}
          <div className="flex items-center gap-5">
            <button className="header-icon hidden md:flex">
              <span className="material-symbols-outlined">search</span>
            </button>
            <NavLink to="/account" className="header-icon hidden md:flex">
              <span className="material-symbols-outlined">person</span>
            </NavLink>
            <button className="header-icon" onClick={() => setCartOpen(true)}>
              <span className="material-symbols-outlined">shopping_bag</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Nav Drawer ───────────────────── */}
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div
              className="mobile-nav-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setNavOpen(false)}
            />
            <motion.div
              className="mobile-nav-panel open"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.32, ease: [0.25,0.46,0.45,0.94] }}
            >
              <div className="flex justify-between items-center p-8 border-b border-white/10">
                <span className="header-logo-text">HOT STUFF</span>
                <button className="header-icon" onClick={() => setNavOpen(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <nav className="flex flex-col p-8 gap-8">
                {navLinks.map(l => (
                  <NavLink
                    key={l.to} to={l.to}
                    className="label-caps text-on-surface flex items-center justify-between"
                    onClick={() => setNavOpen(false)}
                  >
                    {l.label}
                    <span className="material-symbols-outlined text-xl text-outline">chevron_right</span>
                  </NavLink>
                ))}
              </nav>
              <div className="mt-auto p-8 border-t border-white/10">
                <NavLink to="/account" className="label-caps text-on-surface-variant flex items-center gap-3" onClick={() => setNavOpen(false)}>
                  <span className="material-symbols-outlined text-xl">person</span> Личный кабинет
                </NavLink>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Cart Drawer ─────────────────────────── */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQty={onUpdateQty}
        onRemove={onRemove}
      />
    </>
  );
}
