import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n.js';
import AppRouter from './router.jsx';
import ThemeToggler from './components/ThemeToggler.jsx';
import SecureProvider from './components/SecureProvider.jsx';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <HelmetProvider>
        <SecureProvider>
          <BrowserRouter>
            <ThemeToggler />
            <AppRouter />
          </BrowserRouter>
        </SecureProvider>
      </HelmetProvider>
    </I18nextProvider>
  );
}

export default App;
