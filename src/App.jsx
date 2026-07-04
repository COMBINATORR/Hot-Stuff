import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { Analytics } from '@vercel/analytics/react';
import i18n from './i18n.js';
import AppRouter from './router.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.tsx';
import SecureProvider from './components/SecureProvider.jsx';
import PanicButton from './components/PanicButton.jsx';
import CookieBanner from './components/CookieBanner.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import FavoritesDrawer from './components/FavoritesDrawer.jsx';
import ProductModal from './components/ProductModal.jsx';
import { CategoriesProvider } from './contexts/CategoriesContext.jsx';
import CartFlyEffect from './components/CartFlyEffect.jsx';

function LanguageSync() {
  const location = useLocation();
  const { i18n: i18nInstance } = useTranslation();

  useEffect(() => {
    const parts = location.pathname.split('/');
    const pathLang = parts[1]; // e.g. 'kz', 'en', 'ru'
    
    if (['ru', 'kz', 'en'].includes(pathLang)) {
      const i18nLang = pathLang === 'kz' ? 'kk' : pathLang;
      if (i18nInstance.language !== i18nLang) {
        i18nInstance.changeLanguage(i18nLang);
      }
      localStorage.setItem('app_language', pathLang);
    } else {
      const savedLang = localStorage.getItem('app_language') || 'ru';
      const i18nLang = savedLang === 'kz' ? 'kk' : savedLang;
      if (i18nInstance.language !== i18nLang) {
        i18nInstance.changeLanguage(i18nLang);
      }
    }
  }, [location.pathname, i18nInstance]);

  return null;
}

function ConditionalFooter() {
  return <Footer />;
}

function App() {
  const [cartItems, setCartItems] = useState({});
  const cartItemsArray = useMemo(() => Object.values(cartItems), [cartItems]);

  const handleSetCartItems = useCallback((action) => {
    if (typeof action === 'function') {
      setCartItems(prev => {
        const prevArray = Object.values(prev);
        const nextArray = action(prevArray);
        const nextObj = {};
        nextArray.forEach(item => {
          nextObj[`${item.id}-${item.variant}`] = item;
        });
        return nextObj;
      });
    } else if (Array.isArray(action)) {
      const nextObj = {};
      action.forEach(item => {
        nextObj[`${item.id}-${item.variant}`] = item;
      });
      setCartItems(nextObj);
    } else {
      setCartItems(action);
    }
  }, []);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('hs_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    localStorage.setItem('hs_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Track last click coordinates globally to determine flight animation starting point
  useEffect(() => {
    let lastClickCoords = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const handleWindowClick = (e) => {
      if (e.clientX !== 0 || e.clientY !== 0) {
        lastClickCoords = { x: e.clientX, y: e.clientY };
      }
    };

    window.addEventListener('click', handleWindowClick, true);

    const handleFlyTrigger = (e) => {
      if (!e.detail.startX) e.detail.startX = lastClickCoords.x;
      if (!e.detail.startY) e.detail.startY = lastClickCoords.y;
    };

    window.addEventListener('fly-to-cart', handleFlyTrigger, true);

    return () => {
      window.removeEventListener('click', handleWindowClick, true);
      window.removeEventListener('fly-to-cart', handleFlyTrigger, true);
    };
  }, []);

  const addToCart = useCallback((item) => {
    window.dispatchEvent(new CustomEvent('fly-to-cart', {
      detail: { image: item.image, name: item.name }
    }));

    setCartItems(prev => {
      const key = `${item.id}-${item.variant}`;
      const existing = prev[key];
      if (existing) {
        return {
          ...prev,
          [key]: { ...existing, qty: existing.qty + (item.qty || 1) }
        };
      }
      return {
        ...prev,
        [key]: { ...item, qty: item.qty || 1 }
      };
    });
  }, []);

  const handleAddToCart = useCallback((product, selectedColor, size) => {
    window.dispatchEvent(new CustomEvent('fly-to-cart', {
      detail: { image: product.image, name: product.name }
    }));

    const variantName = [selectedColor?.name, size].filter(Boolean).join(' / ') || 'Default';
    setCartItems(prev => {
      const key = `${product.id}-${variantName}`;
      const existing = prev[key];
      if (existing) {
        return {
          ...prev,
          [key]: { ...existing, qty: existing.qty + 1 }
        };
      }
      return {
        ...prev,
        [key]: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          variant: variantName,
          qty: 1
        }
      };
    });
    setIsCartOpen(true);
  }, []);

  const updateQty = useCallback((id, variant, qty) => {
    setCartItems(prev => {
      const key = `${id}-${variant}`;
      if (!prev[key]) return prev;
      return {
        ...prev,
        [key]: { ...prev[key], qty: Math.max(1, qty) }
      };
    });
  }, []);

  const removeItem = useCallback((id, variant) => {
    setCartItems(prev => {
      const key = `${id}-${variant}`;
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <HelmetProvider>
        <SecureProvider>
          <CategoriesProvider>
          <BrowserRouter>
            <LanguageSync />
            <PanicButton />
            <ScrollToTop />
            <Header
              cartItems={cartItemsArray}
              onUpdateQty={updateQty}
              onRemove={removeItem}
              onAddToCart={addToCart}
              favoritesCount={favorites.length}
              onOpenCart={() => setIsCartOpen(true)}
              onOpenFavorites={() => setIsFavoritesOpen(true)}
            />
            <main className="min-h-screen pb-20 md:pb-0">
              <AppRouter
                cartItems={cartItemsArray}
                setCartItems={handleSetCartItems}
                onAddToCart={handleAddToCart}
                onUpdateQty={updateQty}
                onRemove={removeItem}
                favorites={favorites}
                setFavorites={setFavorites}
                onSelectQuickView={setSelectedProduct}
              />
            </main>
            <ConditionalFooter />
            <CookieBanner />
            <Analytics />

            {/* Standalone Drawers and Modal */}
            <CartDrawer 
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              items={cartItemsArray}
              setItems={handleSetCartItems}
              onUpdateQty={updateQty}
              onRemove={removeItem}
            />
            <FavoritesDrawer 
              isOpen={isFavoritesOpen}
              onClose={() => setIsFavoritesOpen(false)}
              favorites={favorites}
              setFavorites={setFavorites}
              onAddToCart={handleAddToCart}
            />
            {selectedProduct && (
              <ProductModal 
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onAddToCart={handleAddToCart}
              />
            )}
            <CartFlyEffect />
          </BrowserRouter>
          </CategoriesProvider>
        </SecureProvider>
      </HelmetProvider>
    </I18nextProvider>
  );
}

export default App;
