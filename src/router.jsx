import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import SorayaMockupPage from './pages/SorayaMockupPage.jsx';

// Языковые префиксы: ru (default), kz, en
const LANGS = ['ru', 'kz', 'en'];

export default function AppRouter({ cartItems, onAddToCart }) {
  return (
    <Routes>
      {/* Маршруты без префикса (русский по умолчанию) */}
      <Route path="/"             element={<HomePage onAddToCart={onAddToCart} />} />
      <Route path="/catalog"      element={<CatalogPage onAddToCart={onAddToCart} />} />
      <Route path="/product/:id"  element={<ProductPage onAddToCart={onAddToCart} />} />
      <Route path="/checkout"     element={<CheckoutPage cartItems={cartItems} />} />
      <Route path="/mockup/soraya-wave" element={<SorayaMockupPage />} />

      {/* Маршруты с языковыми префиксами /kz/... /en/... /ru/... */}
      {LANGS.map((lang) => (
        <React.Fragment key={lang}>
          <Route path={`/${lang}`}             element={<HomePage lang={lang} onAddToCart={onAddToCart} />} />
          <Route path={`/${lang}/catalog`}     element={<CatalogPage lang={lang} onAddToCart={onAddToCart} />} />
          <Route path={`/${lang}/product/:id`} element={<ProductPage lang={lang} onAddToCart={onAddToCart} />} />
          <Route path={`/${lang}/checkout`}    element={<CheckoutPage lang={lang} cartItems={cartItems} />} />
          <Route path={`/${lang}/mockup/soraya-wave`} element={<SorayaMockupPage />} />
        </React.Fragment>
      ))}

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
