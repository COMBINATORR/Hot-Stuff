import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/globals.css';
import i18n from './i18n.js';

// ── Global Error Boundary ──────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0b0d12', color: '#f0ece0',
          fontFamily: 'system-ui, sans-serif', textAlign: 'center',
          padding: '2rem',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            {i18n.t('error.wrong', 'Что-то пошло не так')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', maxWidth: 400 }}>
            {this.state.error?.message || i18n.t('common.error', 'Неизвестная ошибка')}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 2rem',
              background: 'hsl(42,88%,54%)',
              color: '#fff',
              border: 'none',
              borderRadius: '100px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {i18n.t('error.reload', 'Перезагрузить страницу')}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

import { Analytics } from '@vercel/analytics/react';

// ── Mount ──────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <Analytics />
    </ErrorBoundary>
  </React.StrictMode>
);
