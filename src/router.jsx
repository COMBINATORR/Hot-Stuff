import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import HomePage from './pages/HomePage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import SorayaMockupPage from './pages/SorayaMockupPage.jsx';
import CartPage from './pages/CartPage.jsx';
import AccountPage from './pages/AccountPage.jsx';

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

export default function AppRouter({ cartItems, onAddToCart, onUpdateQty, onRemove, isLoggedIn, setIsLoggedIn }) {
  const location = useLocation();

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Маршруты без префикса (русский по умолчанию) */}
        <Route path="/"             element={<PageWrapper><HomePage onAddToCart={onAddToCart} /></PageWrapper>} />
        <Route path="/catalog"      element={<PageWrapper><CatalogPage onAddToCart={onAddToCart} /></PageWrapper>} />
        <Route path="/product/:id"  element={<PageWrapper><ProductPage onAddToCart={onAddToCart} /></PageWrapper>} />
        <Route path="/cart"         element={<PageWrapper><CartPage cartItems={cartItems} onUpdateQty={onUpdateQty} onRemove={onRemove} /></PageWrapper>} />
        <Route path="/checkout"     element={<PageWrapper><CheckoutPage cartItems={cartItems} /></PageWrapper>} />
        <Route path="/account"      element={<PageWrapper><AccountPage onAddToCart={onAddToCart} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} /></PageWrapper>} />
        <Route path="/mockup/soraya-wave" element={<PageWrapper><SorayaMockupPage /></PageWrapper>} />

        {/* Маршруты с языковыми префиксами /kz/... /en/... /ru/... */}
        {LANGS.map((lang) => (
          <React.Fragment key={lang}>
            <Route path={`/${lang}`}             element={<PageWrapper><HomePage lang={lang} onAddToCart={onAddToCart} /></PageWrapper>} />
            <Route path={`/${lang}/catalog`}     element={<PageWrapper><CatalogPage lang={lang} onAddToCart={onAddToCart} /></PageWrapper>} />
            <Route path={`/${lang}/product/:id`} element={<PageWrapper><ProductPage lang={lang} onAddToCart={onAddToCart} /></PageWrapper>} />
            <Route path={`/${lang}/cart`}         element={<PageWrapper><CartPage lang={lang} cartItems={cartItems} onUpdateQty={onUpdateQty} onRemove={onRemove} /></PageWrapper>} />
            <Route path={`/${lang}/checkout`}    element={<PageWrapper><CheckoutPage lang={lang} cartItems={cartItems} /></PageWrapper>} />
            <Route path={`/${lang}/account`}     element={<PageWrapper><AccountPage lang={lang} onAddToCart={onAddToCart} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} /></PageWrapper>} />
            <Route path={`/${lang}/mockup/soraya-wave`} element={<PageWrapper><SorayaMockupPage /></PageWrapper>} />
          </React.Fragment>
        ))}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
