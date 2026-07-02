import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ru from './locales/ru.json';
import kz from './locales/kz.json';
import en from './locales/en.json';

const resources = {
  ru: {
    translation: ru
  },
  kz: {
    translation: kz
  },
  en: {
    translation: en
  }
};

resources.kk = resources.kz;

const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('app_language') : 'ru';
const initialLanguage = savedLanguage === 'kz' ? 'kk' : (savedLanguage || 'ru');

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
});

export default i18n;
