import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from './ResponsiveImage';
import { supabase } from '../lib/supabase';

function CategoryLink({ category, onClick }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const subcategories = category.subcategories || [];
  const hasSub = subcategories.length > 0;

  return (
    <div className="relative flex flex-col w-full">
      {hasSub ? (
        <>
          <div className="flex justify-between items-center w-full py-1.5">
            <span
              onClick={() => setIsOpen(!isOpen)}
              className="text-white text-[11px] font-bold tracking-widest lowercase cursor-pointer hover:text-primary transition-colors text-left flex-1"
            >
              {t(`menu.${category.name.toLowerCase()}`, category.name)}
            </span>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-primary transition-colors p-1 focus:outline-none focus-visible:text-primary active:scale-90 rounded-[2px]"
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
                  className="text-neutral-300 text-[10px] tracking-wider uppercase hover:text-primary transition-colors text-left focus:outline-none focus-visible:text-primary"
                >
                  {t('header.view_all', 'посмотреть все')}
                </Link>
                {subcategories.map((sub) => (
                  <Link
                    key={sub.slug}
                    to={`/catalog?cat=${sub.slug}`}
                    onClick={onClick}
                    className="text-neutral-400 text-[10px] tracking-wider uppercase hover:text-primary transition-colors text-left focus:outline-none focus-visible:text-primary"
                  >
                    {t(`menu.${sub.name.toLowerCase()}`, sub.name)}
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
            className="text-white text-[11px] font-bold tracking-widest lowercase block w-full py-1.5 hover:text-primary transition-colors text-left focus:outline-none focus-visible:text-primary"
          >
            {t(`menu.${category.name.toLowerCase()}`, category.name)}
          </Link>
          {category.description && (
            <span className="text-[10px] text-neutral-400 leading-normal block -mt-1 pb-2 font-normal font-sans text-left">
              {category.description}
            </span>
          )}
        </>
      )}
    </div>
  );
}

/** CartDrawer — slide-in panel (Stitch design) */
function CartDrawer({ isOpen, onClose, items = [], onUpdateQty, onRemove, onAddToCart }) {
  const { t, i18n } = useTranslation();
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const [promo, setPromo] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const navigate = useNavigate();

  // Build locale-aware checkout path
  const checkoutPath = i18n.language === 'ru' ? '/checkout' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}/checkout`;

  // Safe checkout navigation: navigate FIRST, then close drawer.
  // If we close first, CartDrawer unmounts (returns null when !isOpen),
  // and navigate() from an unmounted component may silently fail in React 18.
  const handleCheckoutNavigate = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigate(checkoutPath);
    // Close drawer AFTER navigation is scheduled
    setTimeout(() => onClose(), 0);
  };

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
      alert(t('account.err_invalid_promo', 'Неверный промокод. Попробуйте LELO15 или HOT15'));
      setAppliedPromo('');
    }
  };

  const handleKaspiCheckout = async (e) => {
    // Prevent event bubbling to any parent form or navigation handler
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsCheckingOut(true);
    setCheckoutError('');
    try {
      const orderId = `HS-${Date.now()}`;
      const amount = finalTotal;
      
      console.log(`[Kaspi Checkout] Requesting invoice for ${amount} ₸ (Order ID: ${orderId})`);
      
      const { data, error } = await supabase.functions.invoke('kaspi-checkout', {
        body: { amount, orderId }
      });

      if (error) throw error;
      
      if (data && data.paymentUrl) {
        console.log('[Kaspi Checkout] Redirecting to payment URL:', data.paymentUrl);
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(t('header.err_payment_init_fail', 'Не удалось получить ссылку на оплату от сервера'));
      }
    } catch (err) {
      console.error('[Kaspi Checkout Error]', err);
      const errMsg = err.message || t('account.auth_error_default', 'Ошибка инициализации платежа');
      setCheckoutError(errMsg);
      alert(`${t('common.error', 'Ошибка')}: ${errMsg}`);
      setIsCheckingOut(false);
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
          <h2 className="font-headline-lg text-title-md uppercase tracking-widest text-on-surface">{t('header.cart_title', 'ВАША КОРЗИНА')}</h2>
          <button className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none focus-visible:text-primary" onClick={onClose} aria-label={t('header.close_cart', 'Закрыть корзину')}>
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {items.length > 0 && (
          <div className="px-8 py-5 bg-surface-container-low border-b border-white/5 space-y-3">
            <div className="text-[10px] font-sans font-black tracking-[0.15em] text-on-surface-variant uppercase flex justify-between">
              {subtotal < FREE_SHIPPING_THRESHOLD ? (
                <>
                  <span>{t('header.free_shipping_hint', { amount: (FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString('ru-KZ') })}</span>
                  <span className="text-primary">{Math.round(progressPercent)}%</span>
                </>
              ) : (
                <span className="text-green-400">{t('header.free_shipping_success', '✨ Поздравляем! Доставка бесплатна!')}</span>
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
              <p className="font-label-caps text-on-surface-variant">{t('header.cart_empty', 'Корзина пуста')}</p>
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
                            onClick={() => onUpdateQty(item.id, item.variant, Math.max(1, item.qty - 1))}
                          >-</button>
                          <span className="px-3 py-1 font-body-md">{item.qty}</span>
                          <button 
                            className="px-3 py-1 text-on-surface-variant hover:text-primary"
                            onClick={() => onUpdateQty(item.id, item.variant, item.qty + 1)}
                          >+</button>
                        </div>
                        <button 
                          className="text-xs text-on-surface-variant hover:text-error uppercase tracking-widest"
                          onClick={() => onRemove(item.id, item.variant)}
                        >{t('header.remove', 'Удалить')}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cross-selling Section inside scrollable list */}
              <div className="pt-8 border-t border-white/5 space-y-4">
                <h4 className="font-sans font-black text-[10px] tracking-[0.15em] text-white uppercase">{t('header.add_to_order', 'ДОБАВЬТЕ К ЗАКАЗУ:')}</h4>
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
                        + {t('header.add_btn', 'ДОБАВИТЬ')}
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
                        + {t('header.add_btn', 'ДОБАВИТЬ')}
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
                <label className="font-label-caps text-[10px] text-on-surface-variant uppercase">{t('header.promo_label', 'ПРОМОКОД')}</label>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 bg-background border border-white/10 px-4 py-2 text-on-surface focus:border-primary outline-none transition-colors" 
                    placeholder={t('header.promo_placeholder', 'Введите код')} 
                    type="text"
                    value={promo}
                    onChange={e => setPromo(e.target.value)}
                  />
                  <button 
                    onClick={handleApplyPromo}
                    className="px-4 py-2 border border-primary text-primary font-label-caps text-[10px] hover:bg-primary hover:text-on-primary transition-all"
                  >
                    {t('header.promo_btn', 'ПРИМЕНИТЬ')}
                  </button>
                </div>
                {appliedPromo && (
                  <p className="text-[10px] text-green-400 font-sans mt-1">{t('header.promo_applied', { code: appliedPromo })}</p>
                )}
              </div>
              <div className="h-px bg-white/10"></div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-end text-on-surface-variant">
                  <span className="font-label-caps uppercase">{t('header.subtotal', 'ПОДЫТОГ')}</span>
                  <span>{subtotal.toLocaleString('ru-KZ')} ₸</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between items-end text-red-400">
                    <span className="font-label-caps uppercase">{t('header.discount', 'СКИДКА 15%')}</span>
                    <span>- {discountAmount.toLocaleString('ru-KZ')} ₸</span>
                  </div>
                )}
                <div className="h-px bg-white/10 my-2"></div>
                <div className="flex justify-between items-end">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">{t('header.total', 'ИТОГО')}</span>
                  <span className="font-title-md text-title-md text-primary">{finalTotal.toLocaleString('ru-KZ')} ₸</span>
                </div>
              </div>
            </div>
            <button 
              type="button"
              className="w-full bg-primary text-on-primary font-label-caps text-label-caps uppercase py-5 hover:bg-[#ffe088] transition-colors tracking-widest"
              onClick={handleCheckoutNavigate}
            >
              {t('header.checkout_btn', 'ОФОРМИТЬ ЗАКАЗ')}
            </button>
            <button
              type="button"
              onClick={handleKaspiCheckout}
              disabled={isCheckingOut}
              className="w-full flex items-center justify-center gap-2 bg-[#E31E24] hover:bg-[#c9181e] disabled:bg-[#E31E24]/60 text-white font-sans font-black text-[10px] tracking-[0.2em] py-5 uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E31E24] active:scale-95 transition-all rounded-none cursor-pointer border-none mt-2"
              id="cart-drawer-kaspi"
            >
              {isCheckingOut ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3">
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  <span>{t('header.processing', 'Обработка...')}</span>
                </>
              ) : (
                <>
                  <span>{t('header.pay_kaspi', 'Оплатить через Kaspi Pay')}</span>
                  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm12 0h4v4h-4zm-6 6h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4z" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function Header({ cartItems = [], onUpdateQty, onRemove, onAddToCart }) {
  const { t, i18n } = useTranslation();
  const [cartOpen, setCartOpen] = useState(false);
  const [navOpen,  setNavOpen]  = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const [session, setSession] = useState(null);

  // Localized Ticker items computed dynamically using t()
  const tickerItems = [
    { text: t('header.promo1', 'АКЦИИ ДЛЯ САМОНАСЛАЖДЕНИЯ: СКИДКИ ДО 50% + БЕСПЛАТНАЯ ИГРУШКА'), link: "/catalog" },
    { text: t('header.promo2', 'БЕСПЛАТНАЯ ДОСТАВКА ПО ВСЕМУ КАЗАХСТАНУ ОТ 30 000 ₸'), link: "/delivery" },
    { text: t('header.promo3', 'НОВИНКИ КАТЕГОРИИ WELLNESS УЖЕ В ПРОДАЖЕ'), link: "/catalog?cat=wellness" }
  ];

  const handleLangChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setLangMenuOpen(false);
    
    // Parse current pathname
    const parts = location.pathname.split('/');
    if (['ru', 'kz', 'en'].includes(parts[1])) {
      parts.splice(1, 1);
    }
    
    let newPathname = parts.join('/');
    if (newPathname === '') newPathname = '/';
    
    const prefix = langCode === 'kk' ? 'kz' : langCode;
    localStorage.setItem('app_language', prefix);
    
    const targetPath = (prefix === 'ru' ? newPathname : `/${prefix}${newPathname === '/' ? '' : newPathname}`) + location.search + location.hash;
    
    navigate(targetPath);
  };

  const handleHeaderLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('[Header Logout Error]', err);
      alert(t('account.logout_err_alert', 'Произошла ошибка при выходе из системы. Сессия будет закрыта локально.'));
    } finally {
      localStorage.removeItem('hs_user');
      navigate(getHomePath());
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

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

  // Switch promo ticker items
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerItems.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [tickerIndex, tickerItems.length]);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setSearchOpen(false);
      const prefix = i18n.language === 'ru' ? '' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}`;
      navigate(`${prefix}/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSearchTermClick = (term) => {
    setSearchOpen(false);
    const prefix = i18n.language === 'ru' ? '' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}`;
    navigate(`${prefix}/catalog?search=${encodeURIComponent(term)}`);
  };

  const handleNextTicker = () => {
    setTickerIndex((prev) => (prev + 1) % tickerItems.length);
  };

  const handlePrevTicker = () => {
    setTickerIndex((prev) => (prev - 1 + tickerItems.length) % tickerItems.length);
  };

  const getLangLabel = (lng) => {
    if (!lng) return 'RU';
    const l = lng.toLowerCase();
    if (l === 'kk' || l === 'kz') return 'KZ';
    if (l === 'en') return 'EN';
    return 'RU';
  };

  return (
    <>
      {/* Promo Ticker Bar */}
      <div className="w-full bg-black py-2 md:py-3 border-b border-white/5 flex items-center justify-between px-2 md:px-6 text-xs text-white z-50 relative h-12 global-promo-ticker">
        <button onClick={handlePrevTicker} className="hover:text-primary transition-colors focus:outline-none focus-visible:text-primary z-10 flex-none" aria-label={t('header.prev_promo', 'Предыдущая акция')}>
          <span className="material-symbols-outlined text-[16px] align-middle" aria-hidden="true">chevron_left</span>
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
                {tickerItems[tickerIndex]?.text}
              </span>
              <Link 
                to={i18n.language === 'ru' ? tickerItems[tickerIndex].link : `/${i18n.language === 'kk' ? 'kz' : i18n.language}${tickerItems[tickerIndex].link}`}
                className="bg-primary hover:bg-[#ffe088] active:scale-95 transition-all text-on-primary text-[8px] md:text-[9px] font-black tracking-widest uppercase py-1 px-2.5 md:py-1.5 md:px-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary inline-block flex-none"
              >
                {t('header.buy', 'КУПИТЬ')}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        <button onClick={handleNextTicker} className="hover:text-primary transition-colors focus:outline-none focus-visible:text-primary z-10 flex-none" aria-label={t('header.next_promo', 'Следующая акция')}>
          <span className="material-symbols-outlined text-[16px] align-middle" aria-hidden="true">chevron_right</span>
        </button>
      </div>

      <header className="w-full absolute top-12 left-0 z-40 mobile-premium-header flex flex-col pointer-events-none">
        {/* RED TEST BANNER */}
        <div className="w-full bg-[#E31E24] text-white text-center py-1.5 px-4 text-[9px] md:text-[10px] font-sans font-black tracking-widest uppercase select-none pointer-events-auto">
          {t('header.test_banner', 'ТЕСТОВЫЙ РЕЖИМ: Цены снижены для проверки оплаты')}
        </div>
        <div className="w-full px-6 md:px-12 lg:px-16 flex items-center justify-between h-20 pointer-events-auto">
          
          {/* LEFT: Menu / Sandwich (Desktop), Logo (Mobile) */}
          <div className="flex items-center gap-3">
            {/* Sandwich for Desktop */}
            <button onClick={() => setNavOpen(true)} className={`hidden md:flex items-center justify-center gap-3 bg-transparent ${isLightPage ? 'text-black' : 'text-white'} border-none focus:outline-none focus-visible:text-primary active:scale-95 transition-all group h-[24px]`} aria-label={t('header.open_menu', 'Открыть меню')}>
              <div className="flex flex-col justify-between items-start w-6 h-[10px]" aria-hidden="true">
                <span className={`w-6 h-[1.5px] ${isLightPage ? 'bg-black' : 'bg-white'} group-hover:bg-primary group-focus-visible:bg-primary transition-colors`}></span>
                <span className={`w-4 h-[1.5px] ${isLightPage ? 'bg-black' : 'bg-white'} group-hover:bg-primary group-focus-visible:bg-primary transition-colors`}></span>
              </div>
              <span className={`font-bold text-[11px] tracking-[0.2em] font-sans ${isLightPage ? 'text-black' : 'text-white'} uppercase group-hover:text-primary group-focus-visible:text-primary transition-colors flex items-center mt-[1px]`}>
                {t('header.menu', 'МЕНЮ')}
              </span>
            </button>

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
            <button onClick={() => setSearchOpen(true)} className={`flex items-center justify-center w-[24px] h-[24px] bg-transparent ${isLightPage ? 'text-black' : 'text-white'} border-none focus:outline-none hover:text-primary focus-visible:text-primary active:scale-90 transition-all rounded-[2px]`} aria-label={t('header.open_search', 'Открыть поиск')}>
              <span className="material-symbols-outlined text-[22px] font-light leading-none block" aria-hidden="true">search</span>
            </button>
            <AnimatePresence mode="wait">
              {session ? (
                <motion.div
                  key="auth-user"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="hidden sm:flex items-center gap-3 relative"
                >
                  <Link to={i18n.language === 'ru' ? '/account' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}/account`} className="flex items-center focus:outline-none transition-transform hover:scale-105 duration-200">
                    {session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture ? (
                      <img
                        src={session.user.user_metadata.avatar_url || session.user.user_metadata.picture}
                        alt="Avatar"
                        className="w-[28px] h-[28px] rounded-full object-cover border border-white/20 hover:border-primary transition-all duration-300"
                      />
                    ) : (
                      <div className="w-[28px] h-[28px] rounded-full bg-primary text-black flex items-center justify-center text-[12px] font-bold font-mono hover:bg-[#ffe088] transition-all duration-300">
                        {session.user.email ? session.user.email[0].toUpperCase() : 'U'}
                      </div>
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hidden sm:flex"
                >
                  <NavLink
                    to={i18n.language === 'ru' ? '/account' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}/account`}
                    onClick={handleAccountClick}
                    className={`flex items-center justify-center w-[24px] h-[24px] bg-transparent ${isLightPage ? 'text-black' : 'text-white'} border-none focus:outline-none hover:text-primary focus-visible:text-primary active:scale-90 transition-all rounded-[2px]`}
                    title={t('header.login_register', 'Вход / Регистрация')}
                  >
                    <span className="material-symbols-outlined text-[22px] font-light leading-none block">person</span>
                  </NavLink>
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={() => setCartOpen(true)} className={`relative flex items-center justify-center w-[24px] h-[24px] bg-transparent ${isLightPage ? 'text-black' : 'text-white'} border-none focus:outline-none hover:text-primary focus-visible:text-primary active:scale-90 transition-all rounded-[2px]`} aria-label={t('header.open_cart', 'Открыть корзину')}>
              <span className="material-symbols-outlined text-[22px] font-light leading-none block" aria-hidden="true">shopping_bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none z-10">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Sandwich for Mobile */}
            <button onClick={() => setNavOpen(true)} className={`flex md:hidden items-center justify-center w-[24px] h-[24px] bg-transparent ${isLightPage ? 'text-black' : 'text-white'} border-none focus:outline-none focus-visible:text-primary active:scale-90 transition-all group`} aria-label={t('header.open_menu', 'Открыть меню')}>
              <div className="flex flex-col justify-between items-end w-6 h-[10px]" aria-hidden="true">
                <span className={`w-6 h-[1.5px] ${isLightPage ? 'bg-black' : 'bg-white'} group-hover:bg-primary group-focus-visible:bg-primary transition-colors`}></span>
                <span className={`w-4 h-[1.5px] ${isLightPage ? 'bg-black' : 'bg-white'} group-hover:bg-primary group-focus-visible:bg-primary transition-colors`}></span>
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
              style={{ left: 0, right: 'auto' }}
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center p-8 pb-6">
                <div className="flex items-center gap-4">
                  <button
                    className="w-8 h-8 border border-white/40 flex flex-col justify-center items-center gap-[4px] cursor-pointer hover:border-primary transition-colors group rounded-[2px] focus:outline-none focus-visible:border-primary bg-transparent"
                    onClick={() => setNavOpen(false)}
                    aria-label={t('header.close_menu', 'Закрыть меню')}
                  >
                    <span className="w-4 h-[1px] bg-white group-hover:bg-primary group-focus-visible:bg-primary transition-colors" aria-hidden="true"></span>
                    <span className="w-4 h-[1px] bg-white group-hover:bg-primary group-focus-visible:bg-primary transition-colors" aria-hidden="true"></span>
                  </button>
                  <span className="font-bold text-[11px] tracking-[0.2em] uppercase text-white">{t('header.menu', 'МЕНЮ')}</span>
                </div>
                
                {/* Interactive Language Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    className="flex items-center gap-1 bg-transparent border-none text-white hover:text-primary transition-colors focus:outline-none font-bold text-[11px] tracking-wider uppercase cursor-pointer"
                  >
                    <span>{getLangLabel(i18n.language)}</span>
                    <span className="material-symbols-outlined text-[20px] transition-transform duration-200" style={{ transform: langMenuOpen ? 'rotate(180deg)' : 'none' }}>
                      expand_more
                    </span>
                  </button>
                  
                  <AnimatePresence>
                    {langMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-[100]" 
                          onClick={() => setLangMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-24 bg-surface-container-lowest border border-white/10 shadow-xl z-[101] flex flex-col py-1 rounded-[2px]"
                        >
                          {[
                            { code: 'ru', label: 'RU' },
                            { code: 'kk', label: 'KZ' },
                            { code: 'en', label: 'EN' }
                          ].map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => {
                                handleLangChange(lang.code);
                              }}
                              className={`w-full text-left px-4 py-2 text-[10px] tracking-widest uppercase font-bold transition-colors hover:bg-white/5 hover:text-primary ${
                                getLangLabel(i18n.language) === lang.label ? 'text-primary bg-white/5' : 'text-neutral-300'
                              }`}
                            >
                              {lang.label}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col px-10 py-2 gap-4 overflow-y-auto flex-1">
                {categories.length === 0 ? (
                  <span className="text-[10px] text-neutral-500 font-sans text-left">{t('header.loading_categories', 'Загрузка категорий...')}</span>
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
                  to={i18n.language === 'ru' ? '/blog' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}/blog`}
                  className="text-white text-[11px] font-bold tracking-widest lowercase hover:text-primary transition-colors text-left" 
                  onClick={() => setNavOpen(false)}
                >
                  {t('header.blog', 'блог')}
                </Link>
                <Link 
                  to={i18n.language === 'ru' ? '/mockup/soraya-wave' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}/mockup/soraya-wave`}
                  className="text-white text-[11px] font-bold tracking-widest lowercase hover:text-primary transition-colors text-left mt-1" 
                  onClick={() => setNavOpen(false)}
                >
                  {t('header.mockup_link', 'МАКЕТ SORAYA WAVE™')}
                </Link>
              </nav>

              <div className="px-10 pb-12 mt-auto flex items-center gap-4">
                {session ? (
                  <>
                    <Link
                      to={i18n.language === 'ru' ? '/account' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}/account`}
                      className="flex-none transition-transform active:scale-95 duration-200"
                      onClick={() => setNavOpen(false)}
                    >
                      {session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture ? (
                        <img
                          src={session.user.user_metadata.avatar_url || session.user.user_metadata.picture}
                          alt="Avatar"
                          className="w-12 h-12 rounded-full object-cover border border-white/20"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center text-sm font-bold font-mono">
                          {session.user.email ? session.user.email[0].toUpperCase() : 'U'}
                        </div>
                      )}
                    </Link>
                    <div className="flex flex-col items-start gap-1">
                      <Link
                        to={i18n.language === 'ru' ? '/account' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}/account`}
                        className="text-white text-xs font-bold hover:text-primary transition-colors uppercase tracking-widest"
                        onClick={() => setNavOpen(false)}
                      >
                        {t('header.cabinet', 'кабинет')}
                      </Link>
                      <button
                        onClick={() => {
                          setNavOpen(false);
                          handleHeaderLogout();
                        }}
                        className="text-[10px] text-white/50 hover:text-red-500 transition-colors uppercase tracking-widest font-black bg-transparent border-none p-0 cursor-pointer"
                      >
                        {t('header.logout', 'выйти')}
                      </button>
                    </div>
                  </>
                ) : (
                  <Link
                    to={i18n.language === 'ru' ? '/account' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}/account`}
                    className="flex items-center justify-center w-12 h-12 border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-colors"
                    title={t('header.login_register', 'Вход / Регистрация')}
                    onClick={(e) => {
                      setNavOpen(false);
                      handleAccountClick(e);
                    }}
                  >
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </Link>
                )}
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
                  placeholder={t('header.search_placeholder', 'Поиск аксессуаров...')} 
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
                <button onClick={() => setSearchOpen(false)} className="text-white hover:text-primary transition-colors focus:outline-none focus-visible:text-primary bg-transparent border-none" aria-label={t('header.close_search', 'Закрыть поиск')}>
                  <span className="material-symbols-outlined text-3xl font-light" aria-hidden="true">close</span>
                </button>
              </div>
              
              {/* Suggestions */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 mb-4">{t('header.popular_searches', 'Популярные запросы')}</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: 'header.query_vibrators', defaultVal: 'Вибраторы' },
                    { key: 'header.query_couples', defaultVal: 'Для пар' },
                    { key: 'header.query_massagers', defaultVal: 'Массажеры' },
                    { key: 'header.query_new', defaultVal: 'Новинки' },
                    { key: 'header.query_soraya', defaultVal: 'Soraya' }
                  ].map(item => (
                    <button
                      key={item.key}
                      onClick={() => handleSearchTermClick(t(item.key, item.defaultVal))}
                      className="px-4 py-2 border border-white/10 rounded-full text-xs font-bold hover:border-primary hover:text-primary hover:bg-white/5 transition-all text-white bg-transparent"
                    >
                      {t(item.key, item.defaultVal)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Tab Bar */}
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
          <span className="text-[9px] font-bold tracking-wider uppercase mt-1">{t('header.cart', 'Корзина')}</span>
        </button>

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
    </>
  );
}
