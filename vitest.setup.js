import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      button: ({ children, initial, animate, transition, ...props }) => {
        return React.createElement('button', props, children);
      },
      div: ({ children, initial, animate, exit, transition, ...props }) => {
        return React.createElement('div', props, children);
      }
    },
    AnimatePresence: ({ children }) => {
      return React.createElement(React.Fragment, null, children);
    }
  };
});
