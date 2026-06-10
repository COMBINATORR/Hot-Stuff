import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      nav: {
        home: 'Главная',
        catalog: 'Каталог',
        cart: 'Корзина',
        checkout: 'Оформление',
      },
      footer: { copyright: '© 2026 Hot Stuff. Все права защищены.' },
      home: {
        hero: 'Добро пожаловать в Hot Stuff',
        sub: 'Премиальные товары с доставкой по Казахстану',
        cta: 'Перейти в каталог',
      },
      catalog: { title: 'Каталог товаров' },
      cart: { title: 'Корзина', empty: 'Корзина пуста' },
      checkout: { title: 'Оформление заказа' },
    },
  },
  en: {
    translation: {
      nav: {
        home: 'Home',
        catalog: 'Catalog',
        cart: 'Cart',
        checkout: 'Checkout',
      },
      footer: { copyright: '© 2026 Hot Stuff. All rights reserved.' },
      home: {
        hero: 'Welcome to Hot Stuff',
        sub: 'Premium goods delivered across Kazakhstan',
        cta: 'Browse Catalog',
      },
      catalog: { title: 'Product Catalog' },
      cart: { title: 'Cart', empty: 'Your cart is empty' },
      checkout: { title: 'Checkout' },
    },
  },
  kz: {
    translation: {
      nav: {
        home: 'Басты бет',
        catalog: 'Каталог',
        cart: 'Себет',
        checkout: 'Тапсырыс',
      },
      footer: { copyright: '© 2026 Hot Stuff. Барлық құқықтар қорғалған.' },
      home: {
        hero: 'Hot Stuff-қа қош келдіңіз',
        sub: 'Қазақстан бойынша жеткізілетін премиум тауарлар',
        cta: 'Каталогқа өту',
      },
      catalog: { title: 'Тауарлар каталогы' },
      cart: { title: 'Себет', empty: 'Себет бос' },
      checkout: { title: 'Тапсырыс рәсімдеу' },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'ru',
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
});

export default i18n;
