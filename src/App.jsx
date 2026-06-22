import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './i18n.js';
import AppRouter from './router.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import SecureProvider from './components/SecureProvider.jsx';
import PanicButton from './components/PanicButton.jsx';
import CookieBanner from './components/CookieBanner.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import FavoritesDrawer from './components/FavoritesDrawer.jsx';
import ProductModal from './components/ProductModal.jsx';

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
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/ru' || location.pathname === '/kz' || location.pathname === '/en' || location.pathname === '/ru/' || location.pathname === '/kz/' || location.pathname === '/en/';
  
  if (isHome) return null;
  return <Footer />;
}

function App() {
  const [cartItems, setCartItems] = useState([]);
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

  const addToCart = useCallback((item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.variant === item.variant);
      if (existing) {
        return prev.map(i =>
          i.id === item.id && i.variant === item.variant
            ? { ...i, qty: i.qty + (item.qty || 1) }
            : i
        );
      }
      return [...prev, { ...item, qty: item.qty || 1 }];
    });
  }, []);

  const handleAddToCart = useCallback((product, selectedColor, size) => {
    const variantName = [selectedColor?.name, size].filter(Boolean).join(' / ') || 'Default';
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id && i.variant === variantName);
      if (existing) {
        return prev.map(i =>
          i.id === product.id && i.variant === variantName
            ? { ...i, qty: i.qty + 1 }
            : i
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        variant: variantName,
        qty: 1
      }];
    });
    setIsCartOpen(true);
  }, []);

  const updateQty = useCallback((id, variant, qty) => {
    setCartItems(prev =>
      prev.map(i => i.id === id && i.variant === variant ? { ...i, qty: Math.max(1, qty) } : i)
    );
  }, []);

  const removeItem = useCallback((id, variant) => {
    setCartItems(prev => prev.filter(i => !(i.id === id && i.variant === variant)));
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <HelmetProvider>
        <SecureProvider>
          <BrowserRouter>
            <LanguageSync />
            <PanicButton />
            <Header
              cartItems={cartItems}
              onUpdateQty={updateQty}
              onRemove={removeItem}
              onAddToCart={addToCart}
              favoritesCount={favorites.length}
              onOpenCart={() => setIsCartOpen(true)}
              onOpenFavorites={() => setIsFavoritesOpen(true)}
            />
            <main className="min-h-screen pb-20 md:pb-0">
              <AppRouter
                cartItems={cartItems}
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

            {/* Standalone Drawers and Modal */}
            <CartDrawer 
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              items={cartItems}
              setItems={setCartItems}
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
          </BrowserRouter>
        </SecureProvider>
      </HelmetProvider>
    </I18nextProvider>
  );
}

export default App;
