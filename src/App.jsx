import React, { useState, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n.js';
import AppRouter from './router.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import SecureProvider from './components/SecureProvider.jsx';
import PanicButton from './components/PanicButton.jsx';
import CookieBanner from './components/CookieBanner.jsx';

function App() {
  const [cartItems, setCartItems] = useState([]);

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
            <PanicButton />
            <Header
              cartItems={cartItems}
              onUpdateQty={updateQty}
              onRemove={removeItem}
              onAddToCart={addToCart}
            />
            <main className="min-h-screen pb-20 md:pb-0">
              <AppRouter
                cartItems={cartItems}
                onAddToCart={addToCart}
                onUpdateQty={updateQty}
                onRemove={removeItem}
              />
            </main>
            <Footer />
            <CookieBanner />
          </BrowserRouter>
        </SecureProvider>
      </HelmetProvider>
    </I18nextProvider>
  );
}

export default App;
