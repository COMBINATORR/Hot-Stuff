import CartDrawer from "./CartDrawer.jsx";
import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from './ResponsiveImage';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

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

export default function Header({ 
  cartItems = [], 
  onUpdateQty, 
  onRemove, 
  onAddToCart,
  favoritesCount = 0,
  onOpenCart,
  onOpenFavorites
}) {
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

  const session = useAuth();

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
      localStorage.removeItem('hs_auth_session');
      window.dispatchEvent(new Event('hs_auth_change'));
      navigate(getHomePath());
    }
  };

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
            <button 
              onClick={onOpenCart || (() => setCartOpen(true))} 
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
            </button>

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
                <button onClick={() => setSearchOpen(false)} className="w-12 h-12 flex items-center justify-center text-white hover:text-primary transition-colors focus:outline-none focus-visible:text-primary bg-transparent border-none rounded-[2px]" aria-label={t('header.close_search', 'Закрыть поиск')}>
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
