import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'ru',
      changeLanguage: vi.fn(),
    }
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
  I18nextProvider: ({ children }) => children,
}));

// Better Framer Motion Mock without JSX
vi.mock('framer-motion', () => {
  const createElement = React.createElement;
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }, ref) => {
        const { animate, initial, exit, whileHover, variants, transition, ...rest } = props;
        return createElement('div', { ref, ...rest }, children);
      }),
      button: React.forwardRef(({ children, ...props }, ref) => {
        const { animate, initial, exit, whileHover, variants, transition, ...rest } = props;
        return createElement('button', { ref, ...rest }, children);
      }),
      span: React.forwardRef(({ children, ...props }, ref) => {
        const { animate, initial, exit, whileHover, variants, transition, ...rest } = props;
        return createElement('span', { ref, ...rest }, children);
      }),
      a: React.forwardRef(({ children, ...props }, ref) => {
        const { animate, initial, exit, whileHover, variants, transition, ...rest } = props;
        return createElement('a', { ref, ...rest }, children);
      }),
      h1: React.forwardRef(({ children, ...props }, ref) => {
        const { animate, initial, exit, whileHover, variants, transition, ...rest } = props;
        return createElement('h1', { ref, ...rest }, children);
      }),
      p: React.forwardRef(({ children, ...props }, ref) => {
        const { animate, initial, exit, whileHover, variants, transition, ...rest } = props;
        return createElement('p', { ref, ...rest }, children);
      }),
      img: React.forwardRef(({ children, ...props }, ref) => {
        const { animate, initial, exit, whileHover, variants, transition, ...rest } = props;
        return createElement('img', { ref, ...rest }, children);
      }),
      blockquote: React.forwardRef(({ children, ...props }, ref) => {
        const { animate, initial, exit, whileHover, variants, transition, ...rest } = props;
        return createElement('blockquote', { ref, ...rest }, children);
      }),
    },
    AnimatePresence: ({ children }) => children,
  };
});

vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost:54321');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

// Also stub import.meta just in case
globalThis.importMetaEnv = {
  VITE_SUPABASE_URL: 'http://localhost:54321',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key'
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.scrollTo
window.scrollTo = vi.fn();
