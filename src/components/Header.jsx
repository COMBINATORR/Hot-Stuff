import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ResponsiveImage from './ResponsiveImage';

// Promo Ticker Data
const TICKER_ITEMS = [
  { text: "АКЦИИ ДЛЯ САМОНАСЛАЖДЕНИЯ: СКИДКИ ДО 50% + БЕСПЛАТНАЯ ИГРУШКА", link: "/catalog" },
  { text: "БЕСПЛАТНАЯ ДОСТАВКА ПО ВСЕМУ КАЗАХСТАНУ ОТ 30 000 ₸", link: "/delivery" },
  { text: "НОВИНКИ КАТЕГОРИИ WELLNESS УЖЕ В ПРОДАЖЕ", link: "/catalog?cat=wellness" }
];

const MENU_ITEMS = [
  { label: 'популярные секс-игрушки', link: '/catalog' },
  { 
    label: 'секс-игрушки для женщин', 
    subItems: [
      { label: 'ПОСМОТРЕТЬ ВСЕ ПРОДУКТЫ', link: '/catalog?cat=women' },
      { label: 'ВИБРАТОРЫ ДЛЯ ТОЧКИ G', link: '/catalog?cat=g-spot' },
      { label: 'ВИБРАТОРЫ ДЛЯ КЛИТОРА', link: '/catalog?cat=clitoral' },
      { label: 'ВИБРАТОРЫ-КРОЛИКИ', link: '/catalog?cat=rabbit' },
      { label: 'АНАЛЬНЫЕ ПРОБКИ', link: '/catalog?cat=anal-plugs' },
      { label: 'ВИБРОПУЛЯ', link: '/catalog?cat=bullets' },
      { label: 'ВИБРАТОРЫ С ПУЛЬТОМ', link: '/catalog?cat=remote' },
      { label: 'СЕКС-ИГРУШКИ ДЛЯ ПОЕЗДОК', link: '/catalog?cat=travel' },
      { label: 'ЖЕЗЛОВЫЕ МАССАЖЕРЫ', link: '/catalog?cat=wands' },
      { label: 'ВАГИНАЛЬНЫЕ ШАРИКИ', link: '/catalog?cat=kegel' },
      { label: 'АНАЛЬНЫЕ ВИБРОШАРИКИ', link: '/catalog?cat=anal-balls' }
    ]
  },
  {
    label: 'секс-игрушки для мужчин',
    subItems: [
      { label: 'ПОСМОТРЕТЬ ВСЕ ПРОДУКТЫ', link: '/catalog?cat=men' },
      { label: 'МАССАЖЕРЫ ПРОСТАТЫ', link: '/catalog?cat=prostate' },
      { label: 'АНАЛЬНЫЕ ПРОБКИ', link: '/catalog?cat=anal-plugs' },
      { label: 'ЭРЕКЦИОННЫЕ КОЛЬЦА', link: '/catalog?cat=rings' },
      { label: 'АНАЛЬНЫЕ ВИБРОШАРИКИ', link: '/catalog?cat=anal-balls' },
      { label: 'МУЖСКОЙ МАСТУРБАТОР', link: '/catalog?cat=masturbators' }
    ]
  },
  {
    label: 'секс-игрушки для пар',
    subItems: [
      { label: 'ПОСМОТРЕТЬ ВСЕ ПРОДУКТЫ', link: '/catalog?cat=couples' },
      { label: 'ВИБРАТОРЫ С ПУЛЬТОМ', link: '/catalog?cat=remote' },
      { label: 'НАДЕВАЕМЫЕ ВИБРОМАССАЖЕРЫ', link: '/catalog?cat=wearable' }
    ]
  },
  {
    label: 'секс-аксессуары',
    subItems: [
      { label: 'БДСМ-ИГРУШКИ', link: '/catalog?cat=bdsm' },
      { label: 'ВЭЛНЕС', link: '/catalog?cat=wellness' },
      { label: 'ЗАРЯДНЫЕ УСТРОЙСТВА И КАБЕЛИ USB', link: '/catalog?cat=chargers' },
      { label: 'СЕКС-СВЕЧИ', link: '/catalog?cat=candles' },
      { label: 'СМАЗКИ', link: '/catalog?cat=lubes' },
      { label: 'СПРЕЙ ДЛЯ ОЧИСТКИ', link: '/catalog?cat=cleaners' }
    ]
  },
  { label: 'эротическое белье', link: '/catalog?cat=lingerie' },
  { label: 'подарочные наборы', link: '/catalog?cat=gifts' },
  { label: 'блог', link: '/blog' },
  { label: 'МАКЕТ SORAYA WAVE™', link: '/mockup/soraya-wave' },
];

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
                    <ResponsiveImage alt={item.name} className="w-full h-full object-cover" src={item.image} loading="lazy" />
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

/** Main Header component with Promo Ticker */
export default function Header({ cartItems = [], onUpdateQty, onRemove }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [navOpen,  setNavOpen]  = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [tickerIndex, setTickerIndex] = useState(0);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const handleNextTicker = () => {
    setTickerIndex((prev) => (prev + 1) % TICKER_ITEMS.length);
  };

  const handlePrevTicker = () => {
    setTickerIndex((prev) => (prev - 1 + TICKER_ITEMS.length) % TICKER_ITEMS.length);
  };

  return (
    <>
      {/* Promo Ticker Bar */}
      <div className="w-full bg-black py-3 border-b border-white/5 flex items-center justify-between px-6 text-xs text-white z-50 relative h-12">
        <button onClick={handlePrevTicker} className="hover:text-primary transition-colors focus:outline-none">
          <span className="material-symbols-outlined text-[16px] align-middle">chevron_left</span>
        </button>
        
        <div className="flex-1 text-center font-bold tracking-wider overflow-hidden px-4 flex items-center justify-center gap-4">
          <span className="text-[10px] md:text-xs tracking-[0.15em] font-sans truncate">
            {TICKER_ITEMS[tickerIndex].text}
          </span>
          <Link 
            to={TICKER_ITEMS[tickerIndex].link} 
            className="bg-[#FF5C3F] text-black text-[9px] font-black tracking-widest uppercase py-1.5 px-4 transition-transform hover:scale-105 inline-block"
          >
            КУПИТЬ
          </Link>
        </div>

        <button onClick={handleNextTicker} className="hover:text-primary transition-colors focus:outline-none">
          <span className="material-symbols-outlined text-[16px] align-middle">chevron_right</span>
        </button>
      </div>

      {/* Main Glassmorphic Header */}
      <header className="w-full absolute top-12 left-0 z-40 mobile-premium-header">
        <div className="container-hs flex items-center justify-between h-20">
          
          {/* LEFT: Menu / Sandwich (Desktop), Logo (Mobile) */}
          <div className="flex items-center gap-3">
            {/* Sandwich for Desktop */}
            <button onClick={() => setNavOpen(true)} className="hidden md:flex items-center justify-center gap-3 bg-transparent text-white border-none focus:outline-none group h-[24px]">
              <div className="flex flex-col justify-between items-start w-6 h-[10px]">
                <span className="w-6 h-[1.5px] bg-white group-hover:bg-primary transition-colors"></span>
                <span className="w-4 h-[1.5px] bg-white group-hover:bg-primary transition-colors"></span>
              </div>
              <span className="font-bold text-[11px] tracking-[0.2em] font-sans text-white uppercase group-hover:text-primary transition-colors flex items-center mt-[1px]">
                МЕНЮ
              </span>
            </button>

            {/* Logo for Mobile */}
            <div className="flex md:hidden flex-col items-start justify-center select-none">
              <Link to="/" className="text-[22px] font-light tracking-[0.25em] text-white uppercase leading-none font-sans">
                HOT STUFF
              </Link>
              <span className="text-[8px] tracking-[0.45em] text-white/50 font-normal mt-1.5 uppercase font-sans">
                АТЫРАУ
              </span>
            </div>
          </div>

          {/* CENTER: Logo (Desktop only) */}
          <div className="hidden md:flex flex-col items-center justify-center text-center select-none absolute left-1/2 -translate-x-1/2">
            <Link to="/" className="text-[36px] font-medium tracking-[0.3em] text-white uppercase leading-none">
              HOT STUFF
            </Link>
            <span className="text-[10px] tracking-[0.45em] text-on-surface-variant font-medium mt-1 uppercase">
              АТЫРАУ
            </span>
          </div>

          {/* RIGHT: Search, Profile, Cart, Sandwich (Mobile) */}
          <div className="flex items-center justify-end gap-5 md:gap-6">
            <button className="flex items-center justify-center w-[24px] h-[24px] bg-transparent text-white border-none focus:outline-none hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[22px] font-light leading-none block">search</span>
            </button>
            <NavLink to="/account" className="hidden sm:flex items-center justify-center w-[24px] h-[24px] bg-transparent text-white border-none focus:outline-none hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[22px] font-light leading-none block">person</span>
            </NavLink>
            <button onClick={() => setCartOpen(true)} className="relative flex items-center justify-center w-[24px] h-[24px] bg-transparent text-white border-none focus:outline-none hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[22px] font-light leading-none block">shopping_bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none z-10">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Sandwich for Mobile */}
            <button onClick={() => setNavOpen(true)} className="flex md:hidden items-center justify-center w-[24px] h-[24px] bg-transparent text-white border-none focus:outline-none group">
              <div className="flex flex-col justify-between items-end w-6 h-[10px]">
                <span className="w-6 h-[1.5px] bg-white group-hover:bg-primary transition-colors"></span>
                <span className="w-4 h-[1.5px] bg-white group-hover:bg-primary transition-colors"></span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Nav) */}
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div
              className="mobile-nav-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setNavOpen(false)}
            />
            <motion.div
              className="mobile-nav-panel open flex flex-col"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.32, ease: [0.25,0.46,0.45,0.94] }}
              style={{ left: 0, right: 'auto' }} // Slide from left instead of right for menu
            >
              {/* Drawer Header matching screenshot */}
              <div className="flex justify-between items-center p-8 pb-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-8 h-8 border border-white/40 flex flex-col justify-center items-center gap-[4px] cursor-pointer hover:border-primary transition-colors group rounded-[2px]" 
                    onClick={() => setNavOpen(false)}
                  >
                    <span className="w-4 h-[1px] bg-white group-hover:bg-primary transition-colors"></span>
                    <span className="w-4 h-[1px] bg-white group-hover:bg-primary transition-colors"></span>
                  </div>
                  <span className="font-bold text-[11px] tracking-[0.2em] uppercase text-white">МЕНЮ</span>
                </div>
                <div className="flex items-center gap-1 cursor-pointer text-white hover:text-primary transition-colors">
                  <span className="font-bold text-[11px] tracking-wider uppercase mt-[1px]">RU</span>
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col px-10 py-2 gap-5 overflow-y-auto flex-1">
                {MENU_ITEMS.map((item, idx) => {
                  const isExpanded = expandedCategory === item.label;
                  return (
                    <div key={idx} className="flex flex-col">
                      {item.subItems ? (
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setExpandedCategory(isExpanded ? null : item.label);
                          }}
                          className="flex items-center text-left text-white text-[11px] font-bold tracking-widest lowercase w-full group"
                        >
                          <span className="w-5 text-[14px] font-light leading-none text-white/50 flex-none text-center -ml-5 group-hover:text-primary transition-colors">
                            {isExpanded ? '–' : '+'}
                          </span>
                          <span>{item.label}</span>
                        </button>
                      ) : (
                        <Link 
                          to={item.link} 
                          className="flex items-center text-left text-white text-[11px] font-bold tracking-widest lowercase w-full"
                          onClick={() => setNavOpen(false)}
                        >
                          <span>{item.label}</span>
                        </Link>
                      )}

                      {/* Sub-items accordion */}
                      {item.subItems && (
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-col gap-4 mt-5 pb-4">
                                {item.subItems.map((sub, sIdx) => (
                                  <Link 
                                    key={sIdx} 
                                    to={sub.link}
                                    className="text-white text-[10px] font-bold tracking-widest uppercase hover:text-primary transition-colors"
                                    onClick={() => setNavOpen(false)}
                                  >
                                    {sub.label}
                                  </Link>
                                ))}
                              </div>
                              <div className="w-full h-px bg-white/20 mt-2 mb-2"></div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  );
                })}
              </nav>

              <div className="px-10 pb-12 mt-auto">
                <Link to="/profile" className="flex items-center justify-center w-12 h-12 border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-colors" onClick={() => setNavOpen(false)}>
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
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
