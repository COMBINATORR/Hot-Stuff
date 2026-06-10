import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';

// Языковые префиксы: ru (default), kz, en
const LANGS = ['ru', 'kz', 'en'];

export default function AppRouter() {
  return (
    <Routes>
      {/* Маршруты без префикса (русский по умолчанию) */}
      <Route path="/"          element={<HomePage />} />
      <Route path="/catalog"   element={<CatalogPage />} />
      <Route path="/cart"      element={<CartPage />} />
      <Route path="/checkout"  element={<CheckoutPage />} />

      {/* Маршруты с языковыми префиксами /kz/... /en/... /ru/... */}
      {LANGS.map((lang) => (
        <React.Fragment key={lang}>
          <Route path={`/${lang}`}           element={<HomePage lang={lang} />} />
          <Route path={`/${lang}/catalog`}   element={<CatalogPage lang={lang} />} />
          <Route path={`/${lang}/cart`}      element={<CartPage lang={lang} />} />
          <Route path={`/${lang}/checkout`}  element={<CheckoutPage lang={lang} />} />
        </React.Fragment>
      ))}

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
