import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ALL_PRODUCTS } from '../data/products';

export default function Breadcrumbs({ theme = 'dark' }) {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const pathname = location.pathname;

  // Слушатель для обновления хлебных крошек при изменении категории в кэше
  const [categories, setCategories] = useState([]);

  // Предварительно вычисляем Map для быстрого поиска подкатегорий (O(1) вместо O(N*M))
  const { subcategoriesBySlug, subcategoriesByName } = useMemo(() => {
    const bySlug = new Map();
    const byName = new Map();
    for (const c of categories) {
      for (const sub of (c.subcategories || [])) {
        if (sub.slug) bySlug.set(sub.slug, { parent: c, sub });
        if (sub.name) byName.set(sub.name.toLowerCase(), { parent: c, sub });
      }
    }
    return { subcategoriesBySlug: bySlug, subcategoriesByName: byName };
  }, [categories]);

  useEffect(() => {
    const cached = localStorage.getItem('hs_categories');
    if (cached) {
      try {
        setCategories(JSON.parse(cached));
      } catch (e) {
        console.error(e);
      }
    }
  }, [location]);

  // Разбираем путь на части
  const pathParts = pathname.split('/').filter(Boolean);
  let langPrefix = '';
  let steps = pathParts;

  // Проверяем наличие языкового префикса
  if (pathParts.length > 0 && ['ru', 'kz', 'en'].includes(pathParts[0])) {
    langPrefix = `/${pathParts[0]}`;
    steps = pathParts.slice(1);
  }

  // На главной странице хлебные крошки не нужны
  if (steps.length === 0) {
    return null;
  }

  const searchParams = new URLSearchParams(location.search);
  const catSlug = searchParams.get('cat');

  // Массив для хранения звеньев хлебных крошек
  let breadcrumbItems = [];

  // 1. Звено: Главная
  breadcrumbItems.push({
    name: t('nav.home', 'Главная'),
    link: langPrefix || '/',
    isLast: false
  });

  // 2. Логика для страницы каталога с параметром категории
  if (steps[0] === 'catalog') {
    breadcrumbItems.push({
      name: t('nav.catalog', 'Каталог'),
      link: `${langPrefix}/catalog`,
      isLast: !catSlug
    });

    if (catSlug && categories.length > 0) {
      // Ищем родительскую категорию
      const parentCat = categories.find(c => c.slug === catSlug);
      if (parentCat) {
        breadcrumbItems.push({
          name: t('menu.' + parentCat.name.toLowerCase(), parentCat.name),
          link: `${langPrefix}/catalog?cat=${parentCat.slug}`,
          isLast: true
        });
      } else {
        // Ищем подкатегорию за O(1)
        const match = subcategoriesBySlug.get(catSlug);
        if (match) {
          const { parent: c, sub } = match;
          breadcrumbItems.push({
            name: t('menu.' + c.name.toLowerCase(), c.name),
            link: `${langPrefix}/catalog?cat=${c.slug}`,
            isLast: false
          });
          breadcrumbItems.push({
            name: t('menu.' + sub.name.toLowerCase(), sub.name),
            link: `${langPrefix}/catalog?cat=${sub.slug}`,
            isLast: true
          });
        }
      }
    }
  }
  // 3. Логика для страницы товара с категорией и подкатегорией
  else if (steps[0] === 'product' && steps[1]) {
    breadcrumbItems.push({
      name: t('nav.catalog', 'Каталог'),
      link: `${langPrefix}/catalog`,
      isLast: false
    });

    const productId = parseInt(steps[1], 10);
    const product = ALL_PRODUCTS.find(p => p.id === productId);

    if (product) {
      // Определяем родительскую категорию
      let parentSlug = 'toys-women';
      if (product.category === 'massagers') parentSlug = 'toys-men';
      if (product.category === 'couples') parentSlug = 'toys-couples';
      if (product.categoryLabel === 'АНАЛЬНЫЕ ПРОБКИ' || product.categoryLabel === 'АНАЛЬНЫЕ ВИБРОШАРИКИ') parentSlug = 'toys-anal';

      const parentNames = {
        'toys-women': t('menu.игрушки для женщин', 'Игрушки для женщин'),
        'toys-men': t('menu.игрушки для мужчин', 'Игрушки для мужчин'),
        'toys-couples': t('menu.игрушки для пар', 'Игрушки для пар'),
        'toys-anal': t('menu.анальные игрушки', 'Анальные игрушки')
      };

      breadcrumbItems.push({
        name: parentNames[parentSlug] || parentSlug,
        link: `${langPrefix}/catalog?cat=${parentSlug}`,
        isLast: false
      });

      // Определяем подкатегорию
      if (categories.length > 0 && product.categoryLabel) {
        const match = subcategoriesByName.get(product.categoryLabel.toLowerCase());
        if (match) {
          const { sub } = match;
          breadcrumbItems.push({
            name: t('menu.' + sub.name.toLowerCase(), sub.name),
            link: `${langPrefix}/catalog?cat=${sub.slug}`,
            isLast: false
          });
        }
      }

      // Добавляем сам товар
      breadcrumbItems.push({
        name: product.name,
        link: `${langPrefix}/product/${product.id}`,
        isLast: true
      });
    } else {
      breadcrumbItems.push({
        name: steps[1],
        link: `${langPrefix}/product/${steps[1]}`,
        isLast: true
      });
    }
  }
  // 4. Логика для остальных стандартных страниц
  else {
    const getStepName = (step) => {
      if (step === 'cart') return t('nav.cart', 'Корзина');
      if (step === 'checkout') return t('nav.checkout', 'Оформление');
      if (step === 'account') return t('nav.account', 'Профиль');
      if (step === 'legal') return t('footer.legal_title', 'Правовая информация');
      if (step === 'blog') return t('header.blog', 'блог');
      return step;
    };

    steps.forEach((step, idx) => {
      const isLast = idx === steps.length - 1;
      const path = steps.slice(0, idx + 1).join('/');
      breadcrumbItems.push({
        name: getStepName(step),
        link: `${langPrefix}/${path}`,
        isLast: isLast
      });
    });
  }

  const isLight = theme === 'light';

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-8 text-left">
      <nav className={`flex items-center flex-wrap gap-2 text-[10px] font-bold tracking-widest uppercase ${
        isLight ? 'text-neutral-500' : 'text-neutral-400'
      }`}>
        {breadcrumbItems.map((item, idx) => {
          const isLast = item.isLast;
          return (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <span className={isLight ? 'text-black/20' : 'text-white/20'}>/</span>
              )}
              {isLast ? (
                <span className="text-primary">{item.name}</span>
              ) : (
                <Link
                  to={item.link}
                  className={`transition-colors ${
                    isLight ? 'hover:text-black text-neutral-500' : 'hover:text-white text-neutral-400'
                  }`}
                >
                  {item.name}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
}
