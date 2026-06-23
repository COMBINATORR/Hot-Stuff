import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import HomePage from './pages/HomePage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import SorayaMockupPage from './pages/SorayaMockupPage.jsx';
import CartPage from './pages/CartPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import LegalPage from './pages/LegalPage.jsx';
import { supabase } from './lib/supabase';

// Языковые префиксы: ru (default), kz, en
const LANGS = ['ru', 'kz', 'en'];

// Page Wrapper for fade-in / fade-out animations
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    className="w-full"
  >
    {children}
  </motion.div>
);

export default function AppRouter({ cartItems, setCartItems, onAddToCart, onUpdateQty, onRemove, favorites, setFavorites, onSelectQuickView }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Helper to determine the /account path based on the current locale prefix
  const getAccountPath = (pathname) => {
    const parts = pathname.split('/');
    if (parts.length > 1 && ['ru', 'kz', 'en'].includes(parts[1])) {
      return `/${parts[1]}/account`;
    }
    return '/account';
  };

  useEffect(() => {
    // 1. Detect OAuth/magic link callback in URL and redirect to /account immediately
    const hash = window.location.hash;
    const search = window.location.search;
    const hasCallback = hash.includes('access_token=') || 
                        search.includes('code=') ||
                        hash.includes('id_token=');
    
    if (hasCallback) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/account')) {
        const targetPath = getAccountPath(currentPath) + search + hash;
        setTimeout(() => {
          navigate(targetPath, { replace: true });
        }, 0);
        return;
      }
    }

    // 2. Sync session on startup (Automatic login check)
    async function syncSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const email = (session.user.email || '').trim().toLowerCase();
          localStorage.setItem('hs_user', JSON.stringify({ emailOrPhone: email }));
          
          // Update registered users list
          const saved = localStorage.getItem('hs_registered_users');
          const parsed = saved ? JSON.parse(saved) : [];
          const normalizedList = parsed.map(u => u.trim().toLowerCase());
          if (!normalizedList.includes(email)) {
            localStorage.setItem('hs_registered_users', JSON.stringify([...normalizedList, email]));
          }
        }
      } catch (err) {
        console.error('[Router] Error checking initial session:', err);
      }
    }
    syncSession();

    // 3. Listen to active auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        const email = (session.user.email || '').trim().toLowerCase();
        // Save user state in localStorage to login immediately on all pages
        localStorage.setItem('hs_user', JSON.stringify({ emailOrPhone: email }));

        // Update registered users list in localStorage
        const saved = localStorage.getItem('hs_registered_users');
        const parsed = saved ? JSON.parse(saved) : [];
        const normalizedList = parsed.map(u => u.trim().toLowerCase());
        if (!normalizedList.includes(email)) {
          localStorage.setItem('hs_registered_users', JSON.stringify([...normalizedList, email]));
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('hs_user');
      }
    });

    return () => {
      if (subscription) {
        if (subscription.unsubscribe) subscription.unsubscribe();
        else if (subscription.subscription && subscription.subscription.unsubscribe) subscription.subscription.unsubscribe();
      }
    };
  }, [navigate]);

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Маршруты без префикса (русский по умолчанию) */}
        <Route path="/"             element={<PageWrapper><HomePage onAddToCart={onAddToCart} favorites={favorites} setFavorites={setFavorites} onSelectQuickView={onSelectQuickView} /></PageWrapper>} />
        <Route path="/catalog"      element={<PageWrapper><CatalogPage onAddToCart={onAddToCart} /></PageWrapper>} />
        <Route path="/product/:id"  element={<PageWrapper><ProductPage onAddToCart={onAddToCart} /></PageWrapper>} />
        <Route path="/cart"         element={<PageWrapper><CartPage cartItems={cartItems} onUpdateQty={onUpdateQty} onRemove={onRemove} /></PageWrapper>} />
        <Route path="/checkout"     element={<PageWrapper><CheckoutPage cartItems={cartItems} setCartItems={setCartItems} /></PageWrapper>} />
        <Route path="/account"      element={<PageWrapper><AccountPage onAddToCart={onAddToCart} /></PageWrapper>} />
        <Route path="/legal"        element={<PageWrapper><LegalPage /></PageWrapper>} />
        <Route path="/mockup/soraya-wave" element={<PageWrapper><SorayaMockupPage /></PageWrapper>} />

        {/* Маршруты с языковыми префиксами /kz/... /en/... /ru/... */}
        {LANGS.map((lang) => (
          <React.Fragment key={lang}>
            <Route path={`/${lang}`}             element={<PageWrapper><HomePage lang={lang} onAddToCart={onAddToCart} favorites={favorites} setFavorites={setFavorites} onSelectQuickView={onSelectQuickView} /></PageWrapper>} />
            <Route path={`/${lang}/catalog`}     element={<PageWrapper><CatalogPage lang={lang} onAddToCart={onAddToCart} /></PageWrapper>} />
            <Route path={`/${lang}/product/:id`} element={<PageWrapper><ProductPage lang={lang} onAddToCart={onAddToCart} /></PageWrapper>} />
            <Route path={`/${lang}/cart`}         element={<PageWrapper><CartPage lang={lang} cartItems={cartItems} onUpdateQty={onUpdateQty} onRemove={onRemove} /></PageWrapper>} />
            <Route path={`/${lang}/checkout`}    element={<PageWrapper><CheckoutPage lang={lang} cartItems={cartItems} setCartItems={setCartItems} /></PageWrapper>} />
            <Route path={`/${lang}/account`}     element={<PageWrapper><AccountPage lang={lang} onAddToCart={onAddToCart} /></PageWrapper>} />
            <Route path={`/${lang}/legal`}        element={<PageWrapper><LegalPage /></PageWrapper>} />
            <Route path={`/${lang}/mockup/soraya-wave`} element={<PageWrapper><SorayaMockupPage /></PageWrapper>} />
          </React.Fragment>
        ))}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
