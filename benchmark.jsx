import fs from 'fs';
import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumbs from './src/components/Breadcrumbs.jsx';

// mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback,
    i18n: { language: 'en' }
  })
}));

// mock matchMedia
window.matchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
}));

const numIterations = 1000;
const start = performance.now();
for (let i = 0; i < numIterations; i++) {
  render(
    <MemoryRouter initialEntries={['/product/1']}>
      <Breadcrumbs />
    </MemoryRouter>
  );
}
const end = performance.now();
console.log(`Render time: ${end - start} ms`);
