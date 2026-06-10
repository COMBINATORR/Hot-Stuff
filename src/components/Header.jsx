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

  if (!isOpen) return null;

  return (
    <>
      {/* Cart Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] transition-opacity duration-500 opacity-100" 
        id="cart-overlay"
        onClick={onClose}
      ></div>
      {/* Cart Drawer */}
      <div 
        className="fixed top-0 right-0 h-full w-full max-w-md bg-surface-container-lowest z-[201] shadow-2xl transform transition-transform duration-500 translate-x-0 flex flex-col" 
        id="cart-drawer"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/10 flex justify-between items-center">
          <h2 className="font-headline-lg text-title-md uppercase tracking-widest text-on-surface">ВАША КОРЗИНА</h2>
          <button className="text-on-surface-variant hover:text-primary transition-colors" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <span className="material-symbols-outlined text-5xl text-outline">shopping_bag</span>
              <p className="font-label-caps text-on-surface-variant">Корзина пуста</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id + (item.variant || '')} className="flex gap-6">
                <div className="w-24 h-24 bg-surface-container-low flex-none">
                  {item.image ? (
                    <img alt={item.name} className="w-full h-full object-contain" src={item.image} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-surface-container">{item.emoji || '🌸'}</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-label-caps text-label-caps text-on-surface uppercase mb-1">{item.name}</h3>
                    {item.variant && <p className="text-xs text-on-surface-variant">{item.variant}</p>}
                    <p className="text-primary font-body-md">{item.price.toLocaleString('ru-KZ')} ₸</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-white/10">
                      <button 
                        className="px-3 py-1 text-on-surface-variant hover:text-primary"
                        onClick={() => onUpdateQty(item.id, Math.max(1, item.qty - 1))}
                      >-</button>
                      <span className="px-3 py-1 font-body-md">{item.qty}</span>
                      <button 
                        className="px-3 py-1 text-on-surface-variant hover:text-primary"
                        onClick={() => onUpdateQty(item.id, item.qty + 1)}
                      >+</button>
                    </div>
                    <button 
                      className="text-xs text-on-surface-variant hover:text-error uppercase tracking-widest"
                      onClick={() => onRemove(item.id)}
                    >Удалить</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-8 bg-surface-container-low space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-[10px] text-on-surface-variant uppercase">ПРОМОКОД</label>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 bg-background border border-white/10 px-4 py-2 text-on-surface focus:border-primary outline-none transition-colors" 
                    placeholder="Введите код" 
                    type="text"
                    value={promo}
                    onChange={e => setPromo(e.target.value)}
                  />
                  <button className="px-4 py-2 border border-primary text-primary font-label-caps text-[10px] hover:bg-primary hover:text-on-primary transition-all">ПРИМЕНИТЬ</button>
                </div>
              </div>
              <div className="h-px bg-white/10"></div>
              <div className="flex justify-between items-end">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">ИТОГО</span>
                <span className="font-title-md text-title-md text-primary">{total.toLocaleString('ru-KZ')} ₸</span>
              </div>
            </div>
            <button 
              className="w-full bg-primary text-on-primary font-label-caps text-label-caps uppercase py-5 hover:bg-primary-container transition-colors tracking-widest"
              onClick={() => { onClose(); navigate('/checkout'); }}
            >
              ОФОРМИТЬ ЗАКАЗ
            </button>
          </div>
        )}
      </div>
    </>
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
