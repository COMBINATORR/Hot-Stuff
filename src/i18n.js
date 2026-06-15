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
      menu: {
        "классическое нижнее белье": "Классическое нижнее белье",
        "эротическое белье и одежда": "Эротическое белье и одежда",
        "игрушки для женщин": "Игрушки для женщин",
        "игрушки для мужчин": "Игрушки для мужчин",
        "игрушки для пар": "Игрушки для пар",
        "анальные игрушки": "Анальные игрушки",
        "бдсм и фетиш": "БДСМ и фетиш",
        "лубриканты и интимная косметика": "Лубриканты и интимная косметика"
      }
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
      menu: {
        "классическое нижнее белье": "classic lingerie",
        "эротическое белье и одежда": "erotic lingerie & apparel",
        "игрушки для женщин": "toys for women",
        "игрушки для мужчин": "toys for men",
        "игрушки для пар": "toys for couples",
        "анальные игрушки": "anal toys",
        "бдсм и фетиш": "bdsm & fetish",
        "лубриканты и интимная косметика": "lubricants & intimate cosmetics"
      }
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
      menu: {
        "классическое нижнее белье": "классикалық іш киім",
        "эротическое белье и одежда": "эротикалық іш киім және киім",
        "игрушки для женщин": "әйелдерге арналған ойыншықтар",
        "игрушки для мужчин": "ерлерге арналған ойыншықтар",
        "игрушки для пар": "жұптарға арналған ойыншықтар",
        "анальные игрушки": "аналды ойыншықтар",
        "бдсм и фетиш": "бдсм және фетиш",
        "лубриканты и интимная косметика": "лубриканттар мен интимді косметика"
      }
    },
  },
};

// Alias kk (Kazakh) to kz so i18n handles both codes seamlessly
resources.kk = resources.kz;

i18n.use(initReactI18next).init({
  resources,
  lng: 'ru',
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
});

export default i18n;
