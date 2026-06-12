import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ResponsiveImage from './ResponsiveImage';
import { supabase } from '../lib/supabase';

// Promo Ticker Data
const TICKER_ITEMS = [
  { text: "АКЦИИ ДЛЯ САМОНАСЛАЖДЕНИЯ: СКИДКИ ДО 50% + БЕСПЛАТНАЯ ИГРУШКА", link: "/catalog" },
  { text: "БЕСПЛАТНАЯ ДОСТАВКА ПО ВСЕМУ КАЗАХСТАНУ ОТ 30 000 ₸", link: "/delivery" },
  { text: "НОВИНКИ КАТЕГОРИИ WELLNESS УЖЕ В ПРОДАЖЕ", link: "/catalog?cat=wellness" }
];

function CategoryLink({ category, onClick }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const subcategories = category.subcategories || [];
  const hasSub = subcategories.length > 0;

  return (
    <div className="relative flex flex-col w-full">
      {/* Mobile-only layout */}
      <div className="block md:hidden">
        {hasSub ? (
          <>
            <div className="flex justify-between items-center w-full py-1.5">
              <span
                onClick={() => setIsOpen(!isOpen)}
                className="text-white text-[11px] font-bold tracking-widest lowercase cursor-pointer hover:text-primary transition-colors text-left flex-1"
              >
                {category.name}
              </span>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white hover:text-primary transition-colors p-1"
              >
                <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden pl-4 flex flex-col gap-2 border-l border-white/10 my-1 pb-2"
                >
                  <Link
                    to={`/catalog?cat=${category.slug}`}
                    onClick={onClick}
                    className="text-neutral-300 text-[10px] tracking-wider uppercase hover:text-primary transition-colors text-left"
                  >
                    посмотреть все
                  </Link>
                  {subcategories.map((sub) => (
                    <Link
                      key={sub.slug}
                      to={`/catalog?cat=${sub.slug}`}
                      onClick={onClick}
                      className="text-neutral-400 text-[10px] tracking-wider uppercase hover:text-primary transition-colors text-left"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <>
            <Link
              to={`/catalog?cat=${category.slug}`}
              onClick={onClick}
              className="text-white text-[11px] font-bold tracking-widest lowercase block w-full py-1.5 hover:text-primary transition-colors text-left"
            >
              {category.name}
            </Link>
            {category.description && (
              <span className="text-[10px] text-neutral-400 leading-normal block -mt-1 pb-2 font-normal font-sans text-left">
                {category.description}
              </span>
            )}
          </>
        )}
      </div>

      {/* Desktop-only layout */}
      {hasSub ? (
        <div
          className="hidden md:block relative text-left"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="flex justify-between items-center w-full py-2">
            <span
              onClick={() => setIsOpen(!isOpen)}
              className="text-white text-[11px] font-bold tracking-widest lowercase cursor-pointer hover:text-primary transition-colors flex-1"
            >
              {category.name}
            </span>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-primary transition-colors p-1"
            >
              <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 top-full mt-1 z-[9999] min-w-[220px] bg-[#0c0c0d] border border-neutral-800 p-4 shadow-2xl flex flex-col gap-2.5 rounded-[2px]"
              >
                <Link
                  to={`/catalog?cat=${category.slug}`}
                  onClick={() => { setIsOpen(false); onClick(); }}
                  className="text-neutral-300 hover:text-primary transition-colors text-[10px] font-bold tracking-widest uppercase"
                >
                  посмотреть все
                </Link>
                {subcategories.map((sub) => (
                  <Link
                    key={sub.slug}
                    to={`/catalog?cat=${sub.slug}`}
                    onClick={() => { setIsOpen(false); onClick(); }}
                    className="text-neutral-400 hover:text-primary transition-colors text-[10px] font-bold tracking-widest uppercase"
                  >
                    {sub.name}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div
          className="hidden md:block relative text-left"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Link
            to={`/catalog?cat=${category.slug}`}
            onClick={onClick}
            className="text-white text-[11px] font-bold tracking-widest lowercase block w-full py-2 hover:text-primary transition-colors"
          >
            {category.name}
          </Link>
          {category.description && (
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 z-[9999] max-w-[240px] bg-black text-white text-[9.5px] leading-relaxed font-sans font-normal p-3 rounded border border-neutral-800 shadow-xl pointer-events-none text-left"
                >
                  {category.description}
                  {/* Arrow pointing up */}
                  <div className="absolute bottom-full left-4 border-4 border-transparent border-b-black" />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      )}
    </div>
  );
}

/** CartDrawer — slide-in panel (Stitch design) */
function CartDrawer({ isOpen, onClose, items = [], onUpdateQty, onRemove, onAddToCart }) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const [promo, setPromo] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const navigate = useNavigate();

  // lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 30000;
  const progressPercent = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const discountAmount = appliedPromo ? subtotal * 0.15 : 0;
  const finalTotal = subtotal - discountAmount;

  const handleApplyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (code === 'LELO15' || code === 'HOT15') {
      setAppliedPromo(code);
    } else {
      alert('Неверный промокод. Попробуйте LELO15 или HOT15');
      setAppliedPromo('');
    }
  };

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

        {/* Free Shipping Progress Indicator */}
        {items.length > 0 && (
          <div className="px-8 py-5 bg-surface-container-low border-b border-white/5 space-y-3">
            <div className="text-[10px] font-sans font-black tracking-[0.15em] text-on-surface-variant uppercase flex justify-between">
              {subtotal < FREE_SHIPPING_THRESHOLD ? (
                <>
                  <span>Добавьте еще {(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString('ru-KZ')} ₸ до бесплатной доставки</span>
                  <span className="text-primary">{Math.round(progressPercent)}%</span>
                </>
              ) : (
                <span className="text-green-400">✨ Поздравляем! Доставка бесплатна!</span>
              )}
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <span className="material-symbols-outlined text-5xl text-outline">shopping_bag</span>
              <p className="font-label-caps text-on-surface-variant">Корзина пуста</p>
            </div>
          ) : (
            <>
              <div className="space-y-8">
                {items.map(item => (
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
                ))}
              </div>

              {/* Cross-selling Section inside scrollable list */}
              <div className="pt-8 border-t border-white/5 space-y-4">
                <h4 className="font-sans font-black text-[10px] tracking-[0.15em] text-white uppercase">ДОБАВЬТЕ К ЗАКАЗУ:</h4>
                <div className="space-y-3">
                  {/* LELO Personal Moisturizer */}
                  {onAddToCart && !items.some(i => i.id === 101) && (
                    <div className="flex items-center justify-between bg-surface-container-low p-4 border border-white/5 rounded-[2px]">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🧴</span>
                        <div>
                          <p className="font-sans font-bold text-[10px] text-white uppercase tracking-wider">Personal Moisturizer</p>
                          <p className="font-sans text-[11px] text-primary">12 500 ₸</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => onAddToCart({ id: 101, name: 'Personal Moisturizer', price: 12500, emoji: '🧴', variant: 'Default', qty: 1 })}
                        className="border border-primary text-primary font-sans font-bold text-[9px] tracking-widest px-3 py-1.5 uppercase hover:bg-primary hover:text-on-primary transition-all rounded-[2px]"
                      >
                        + ДОБАВИТЬ
                      </button>
                    </div>
                  )}
                  {/* LELO Cleaning Spray */}
                  {onAddToCart && !items.some(i => i.id === 102) && (
                    <div className="flex items-center justify-between bg-surface-container-low p-4 border border-white/5 rounded-[2px]">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🧼</span>
                        <div>
                          <p className="font-sans font-bold text-[10px] text-white uppercase tracking-wider">Cleaning Spray</p>
                          <p className="font-sans text-[11px] text-primary">8 900 ₸</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => onAddToCart({ id: 102, name: 'Cleaning Spray', price: 8900, emoji: '🧼', variant: 'Default', qty: 1 })}
                        className="border border-primary text-primary font-sans font-bold text-[9px] tracking-widest px-3 py-1.5 uppercase hover:bg-primary hover:text-on-primary transition-all rounded-[2px]"
                      >
                        + ДОБАВИТЬ
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
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
                  <button 
                    onClick={handleApplyPromo}
                    className="px-4 py-2 border border-primary text-primary font-label-caps text-[10px] hover:bg-primary hover:text-on-primary transition-all"
                  >
                    ПРИМЕНИТЬ
                  </button>
                </div>
                {appliedPromo && (
                  <p className="text-[10px] text-green-400 font-sans mt-1">✓ Промокод {appliedPromo} применен (-15%)</p>
                )}
              </div>
              <div className="h-px bg-white/10"></div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-end text-on-surface-variant">
                  <span className="font-label-caps uppercase">ПОДЫТОГ</span>
                  <span>{subtotal.toLocaleString('ru-KZ')} ₸</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between items-end text-red-400">
                    <span className="font-label-caps uppercase">СКИДКА 15%</span>
                    <span>- {discountAmount.toLocaleString('ru-KZ')} ₸</span>
                  </div>
                )}
                <div className="h-px bg-white/10 my-2"></div>
                <div className="flex justify-between items-end">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">ИТОГО</span>
                  <span className="font-title-md text-title-md text-primary">{finalTotal.toLocaleString('ru-KZ')} ₸</span>
                </div>
              </div>
            </div>
            <button 
              className="w-full bg-primary text-on-primary font-label-caps text-label-caps uppercase py-5 hover:bg-[#ffe088] transition-colors tracking-widest"
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

export default function Header({ cartItems = [], onUpdateQty, onRemove, onAddToCart }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [navOpen,  setNavOpen]  = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    async function loadCategories() {
      // 1. Load instantly from localStorage if cached
      const cached = localStorage.getItem('hs_categories');
      if (cached) {
        try {
          setCategories(JSON.parse(cached));
        } catch (e) {
          console.error('[Header] Error parsing cached categories:', e);
        }
      }

      // 2. Fetch fresh data in the background (SWR)
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, description, subcategories(id, name, slug, description)')
          .order('id', { ascending: true });
        if (error) throw error;
        
        const processed = (data || []).map(cat => {
          if (cat.subcategories) {
            cat.subcategories.sort((a, b) => Number(a.id) - Number(b.id));
          }
          return cat;
        });
        
        setCategories(processed);
        localStorage.setItem('hs_categories', JSON.stringify(processed));
      } catch (err) {
        console.error('[Header] Error loading categories:', err);
      }
    }
    loadCategories();
  }, []);

  const getHomePath = () => {
    const parts = pathname.split('/');
    if (parts.length > 1 && ['ru', 'kz', 'en'].includes(parts[1])) {
      return `/${parts[1]}`;
    }
    return '/';
  };

  const handleAccountClick = (e) => {
    const isAccountPath = pathname === '/account' || pathname.endsWith('/account') || pathname.endsWith('/account/');
    const hsUserExists = localStorage.getItem('hs_user') !== null;
    
    if (isAccountPath && !hsUserExists) {
      e.preventDefault();
      navigate(getHomePath());
    }
  };

  const isLightPage = pathname.includes('/catalog');

  // Автоматическая смена сообщений каждые 12 секунд
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % TICKER_ITEMS.length);
    }, 12000); // интервал 12 секунд (в диапазоне 10-15 секунд)
    return () => clearInterval(timer);
  }, [tickerIndex]);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setSearchOpen(false);
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSearchTermClick = (term) => {
    setSearchOpen(false);
    navigate(`/catalog?search=${encodeURIComponent(term)}`);
  };

  const handleNextTicker = () => {
    setTickerIndex((prev) => (prev + 1) % TICKER_ITEMS.length);
  };

  const handlePrevTicker = () => {
    setTickerIndex((prev) => (prev - 1 + TICKER_ITEMS.length) % TICKER_ITEMS.length);
  };

  return (
    <>
      {/* Promo Ticker Bar */}
      <div className="w-full bg-black py-2 md:py-3 border-b border-white/5 flex items-center justify-between px-2 md:px-6 text-xs text-white z-50 relative h-12 global-promo-ticker">
        <button onClick={handlePrevTicker} className="hover:text-primary transition-colors focus:outline-none z-10 flex-none">
          <span className="material-symbols-outlined text-[16px] align-middle">chevron_left</span>
        </button>
        
        <div className="flex-1 text-center font-bold tracking-wider overflow-hidden px-1 md:px-4 flex items-center justify-center relative h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={tickerIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex items-center justify-center gap-2 md:gap-4 w-full h-full"
            >
              <span className="text-[9.5px] md:text-xs tracking-[0.05em] md:tracking-[0.15em] font-sans whitespace-normal leading-tight md:leading-normal text-center">
                {TICKER_ITEMS[tickerIndex].text}
              </span>
              <Link 
                to={TICKER_ITEMS[tickerIndex].link} 
                className="bg-[#FF5C3F] text-black text-[8px] md:text-[9px] font-black tracking-widest uppercase py-1 px-2.5 md:py-1.5 md:px-4 transition-transform hover:scale-105 inline-block flex-none"
              >
                КУПИТЬ
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        <button onClick={handleNextTicker} className="hover:text-primary transition-colors focus:outline-none z-10 flex-none">
          <span className="material-symbols-outlined text-[16px] align-middle">chevron_right</span>
        </button>
      </div>

      <header className="w-full absolute top-12 left-0 z-40 mobile-premium-header">
        <div className="w-full px-6 md:px-12 lg:px-16 flex items-center justify-between h-20">
          
          {/* LEFT: Menu / Sandwich (Desktop), Logo (Mobile) */}
          <div className="flex items-center gap-3">
            {/* Sandwich for Desktop */}
            <button onClick={() => setNavOpen(true)} className={`hidden md:flex items-center justify-center gap-3 bg-transparent ${isLightPage ? 'text-black' : 'text-white'} border-none focus:outline-none group h-[24px]`}>
              <div className="flex flex-col justify-between items-start w-6 h-[10px]">
                <span className={`w-6 h-[1.5px] ${isLightPage ? 'bg-black' : 'bg-white'} group-hover:bg-primary transition-colors`}></span>
                <span className={`w-4 h-[1.5px] ${isLightPage ? 'bg-black' : 'bg-white'} group-hover:bg-primary transition-colors`}></span>
              </div>
              <span className={`font-bold text-[11px] tracking-[0.2em] font-sans ${isLightPage ? 'text-black' : 'text-white'} uppercase group-hover:text-primary transition-colors flex items-center mt-[1px]`}>
                МЕНЮ
              </span>
            </button>

            {/* Logo for Mobile */}
            <div className="flex md:hidden flex-col items-start justify-center select-none">
              <Link to="/" className={`text-[22px] font-light tracking-[0.25em] ${isLightPage ? 'text-black' : 'text-white'} uppercase leading-none font-sans`}>
                HOT STUFF
              </Link>
              <span className={`text-[12px] tracking-[0.45em] ${isLightPage ? 'text-black' : 'text-white'} font-normal mt-1.5 uppercase font-sans`}>
                АТЫРАУ
              </span>
            </div>
          </div>

          {/* CENTER: Logo (Desktop only) */}
          <div className="hidden md:flex flex-col items-center justify-center text-center select-none absolute left-1/2 -translate-x-1/2">
            <Link to="/" className={`text-[36px] font-medium tracking-[0.3em] ${isLightPage ? 'text-black' : 'text-white'} uppercase leading-none`}>
              HOT STUFF
            </Link>
            <span className={`text-[18px] tracking-[0.45em] ${isLightPage ? 'text-black' : 'text-white'} font-medium mt-2 uppercase`}>
              АТЫРАУ
            </span>
          </div>

          {/* RIGHT: Search, Profile, Cart, Sandwich (Mobile) */}
          <div className="flex items-center justify-end gap-5 md:gap-6">
            <button onClick={() => setSearchOpen(true)} className={`flex items-center justify-center w-[24px] h-[24px] bg-transparent ${isLightPage ? 'text-black' : 'text-white'} border-none focus:outline-none hover:text-primary transition-colors`}>
              <span className="material-symbols-outlined text-[22px] font-light leading-none block">search</span>
            </button>
            <NavLink to="/account" onClick={handleAccountClick} className={`hidden sm:flex items-center justify-center w-[24px] h-[24px] bg-transparent ${isLightPage ? 'text-black' : 'text-white'} border-none focus:outline-none hover:text-primary transition-colors`}>
              <span className="material-symbols-outlined text-[22px] font-light leading-none block">person</span>
            </NavLink>
            <button onClick={() => setCartOpen(true)} className={`relative flex items-center justify-center w-[24px] h-[24px] bg-transparent ${isLightPage ? 'text-black' : 'text-white'} border-none focus:outline-none hover:text-primary transition-colors`}>
              <span className="material-symbols-outlined text-[22px] font-light leading-none block">shopping_bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none z-10">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Sandwich for Mobile */}
            <button onClick={() => setNavOpen(true)} className={`flex md:hidden items-center justify-center w-[24px] h-[24px] bg-transparent ${isLightPage ? 'text-black' : 'text-white'} border-none focus:outline-none group`}>
              <div className="flex flex-col justify-between items-end w-6 h-[10px]">
                <span className={`w-6 h-[1.5px] ${isLightPage ? 'bg-black' : 'bg-white'} group-hover:bg-primary transition-colors`}></span>
                <span className={`w-4 h-[1.5px] ${isLightPage ? 'bg-black' : 'bg-white'} group-hover:bg-primary transition-colors`}></span>
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
              <nav className="flex flex-col px-10 py-2 gap-4 overflow-y-auto flex-1">
                {categories.length === 0 ? (
                  <span className="text-[10px] text-neutral-500 font-sans text-left">Загрузка категорий...</span>
                ) : (
                  categories.map((cat) => (
                    <CategoryLink
                      key={cat.id}
                      category={cat}
                      onClick={() => setNavOpen(false)}
                    />
                  ))
                )}
                <div className="w-full h-px bg-white/10 my-2"></div>
                <Link 
                  to="/blog" 
                  className="text-white text-[11px] font-bold tracking-widest lowercase hover:text-primary transition-colors text-left" 
                  onClick={() => setNavOpen(false)}
                >
                  блог
                </Link>
                <Link 
                  to="/mockup/soraya-wave" 
                  className="text-white text-[11px] font-bold tracking-widest lowercase hover:text-primary transition-colors text-left mt-1" 
                  onClick={() => setNavOpen(false)}
                >
                  МАКЕТ SORAYA WAVE™
                </Link>
              </nav>

              <div className="px-10 pb-12 mt-auto">
                <Link to="/account" className="flex items-center justify-center w-12 h-12 border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-colors" onClick={(e) => { setNavOpen(false); handleAccountClick(e); }}>
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
        onAddToCart={onAddToCart}
      />

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex flex-col justify-start p-6 pt-24 font-sans text-white cursor-pointer"
            onClick={() => setSearchOpen(false)}
          >
            <div 
              className="w-full max-w-2xl mx-auto flex flex-col gap-8 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-white/20 pb-4">
                <input 
                  autoFocus 
                  placeholder="Поиск аксессуаров..." 
                  className="bg-transparent text-2xl font-light text-white outline-none w-full placeholder-white/30"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit();
                    }
                  }}
                />
                <button onClick={() => setSearchOpen(false)} className="text-white hover:text-primary transition-colors focus:outline-none bg-transparent border-none">
                  <span className="material-symbols-outlined text-3xl font-light">close</span>
                </button>
              </div>
              
              {/* Suggestions */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 mb-4">Популярные запросы</p>
                <div className="flex flex-wrap gap-3">
                  {['Вибраторы', 'Для пар', 'Массажеры', 'Новинки', 'Soraya'].map(term => (
                    <button
                      key={term}
                      onClick={() => handleSearchTermClick(term)}
                      className="px-4 py-2 border border-white/10 rounded-full text-xs font-bold hover:border-primary hover:text-primary hover:bg-white/5 transition-all text-white bg-transparent"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Tab Bar (Thumb Zone) - Cigar shaped floating bar */}
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
          to="/catalog" 
          className={({ isActive }) => 
            `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive ? 'text-primary' : 'text-white/60 hover:text-white'
            }`
          }
        >
          <span className="material-symbols-outlined text-[22px] font-light">grid_view</span>
          <span className="text-[9px] font-bold tracking-wider uppercase mt-1">Каталог</span>
        </NavLink>

        <button 
          onClick={() => setSearchOpen(true)}
          className="flex flex-col items-center justify-center flex-1 h-full bg-transparent border-none text-white/60 hover:text-white transition-colors focus:outline-none"
        >
          <span className="material-symbols-outlined text-[22px] font-light">search</span>
          <span className="text-[9px] font-bold tracking-wider uppercase mt-1">Поиск</span>
        </button>

        <button 
          onClick={() => setCartOpen(true)}
          className="flex flex-col items-center justify-center flex-1 h-full bg-transparent border-none text-white/60 hover:text-white transition-colors focus:outline-none relative"
        >
          <span className="material-symbols-outlined text-[22px] font-light">shopping_bag</span>
          {cartCount > 0 && (
            <span className="absolute top-1.5 right-1/2 translate-x-4 bg-primary text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
              {cartCount}
            </span>
          )}
          <span className="text-[9px] font-bold tracking-wider uppercase mt-1">Корзина</span>
        </button>

        <NavLink 
          to="/account" 
          onClick={handleAccountClick}
          className={({ isActive }) => 
            `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive ? 'text-primary' : 'text-white/60 hover:text-white'
            }`
          }
        >
          <span className="material-symbols-outlined text-[22px] font-light">person</span>
          <span className="text-[9px] font-bold tracking-wider uppercase mt-1">Кабинет</span>
        </NavLink>

        <button 
          onClick={() => window.location.replace('https://www.google.com')}
          className="flex flex-col items-center justify-center flex-1 h-full bg-transparent border-none text-[#FF5C3F] hover:text-[#ff785f] transition-colors focus:outline-none"
        >
          <span className="material-symbols-outlined text-[22px] font-light">visibility_off</span>
          <span className="text-[9px] font-bold tracking-wider uppercase mt-1">Паника</span>
        </button>
      </div>
    </>
  );
}
