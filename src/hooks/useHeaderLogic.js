
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useHeaderLogic({ i18n, t }) {
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

  const tickerItems = [
    { text: t('header.promo1', 'АКЦИИ ДЛЯ САМОНАСЛАЖДЕНИЯ: СКИДКИ ДО 50% + БЕСПЛАТНАЯ ИГРУШКА'), link: "/catalog" },
    { text: t('header.promo2', 'БЕСПЛАТНАЯ ДОСТАВКА ПО ВСЕМУ КАЗАХСТАНУ ОТ 30 000 ₸'), link: "/delivery" },
    { text: t('header.promo3', 'НОВИНКИ КАТЕГОРИИ WELLNESS УЖЕ В ПРОДАЖЕ'), link: "/catalog?cat=wellness" }
  ];

  const getHomePath = () => {
    const parts = pathname.split('/');
    if (parts.length > 1 && ['ru', 'kz', 'en'].includes(parts[1])) {
      return `/${parts[1]}`;
    }
    return '/';
  };

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

  return {
    cartOpen, setCartOpen,
    navOpen, setNavOpen,
    langMenuOpen, setLangMenuOpen,
    expandedCategory, setExpandedCategory,
    tickerIndex, setTickerIndex,
    searchOpen, setSearchOpen,
    searchQuery, setSearchQuery,
    categories,
    navigate, pathname, session, tickerItems,
    handleLangChange, handleHeaderLogout, getHomePath,
    handleAccountClick, isLightPage,
    handleSearchSubmit, handleSearchTermClick,
    handleNextTicker, handlePrevTicker, getLangLabel
  };
}
