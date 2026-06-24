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
