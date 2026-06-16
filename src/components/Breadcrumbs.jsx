import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ALL_PRODUCTS } from '../data/products';

export default function Breadcrumbs() {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const pathname = location.pathname;

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

  const getStepName = (step, index, allSteps) => {
    if (step === 'catalog') return t('nav.catalog', 'Каталог');
    if (step === 'cart') return t('nav.cart', 'Корзина');
    if (step === 'checkout') return t('nav.checkout', 'Оформление');
    if (step === 'account') return t('nav.account', 'Профиль');
    if (step === 'legal') return t('footer.legal_title', 'Правовая информация');
    if (step === 'blog') return t('header.blog', 'блог');

    if (step === 'product' && index === 0) {
      return t('nav.catalog', 'Каталог');
    }

    // Если это ID товара после 'product'
    if (index > 0 && allSteps[index - 1] === 'product') {
      const productId = parseInt(step, 10);
      const product = ALL_PRODUCTS.find(p => p.id === productId);
      return product ? product.name : step;
    }

    if (step === 'mockup' && index === 0) {
      return t('nav.catalog', 'Каталог');
    }
    if (index > 0 && allSteps[index - 1] === 'mockup' && step === 'soraya-wave') {
      return 'SORAYA WAVE™';
    }

    return step;
  };

  const getStepLink = (step, index, allSteps) => {
    if (step === 'product') {
      return `${langPrefix}/catalog`;
    }
    if (step === 'mockup') {
      return `${langPrefix}/catalog`;
    }
    const path = allSteps.slice(0, index + 1).join('/');
    return `${langPrefix}/${path}`;
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-8 text-left">
      <nav className="flex items-center flex-wrap gap-2 text-[10px] font-bold tracking-widest uppercase text-outline text-neutral-400">
        <Link to={langPrefix || '/'} className="hover:text-white transition-colors">
          {t('nav.home', 'Главная')}
        </Link>
        {steps.map((step, idx) => {
          if (step === 'product' || step === 'mockup') return null;

          const isLast = idx === steps.length - 1;
          const name = getStepName(step, idx, steps);
          const link = getStepLink(step, idx, steps);

          return (
            <React.Fragment key={idx}>
              <span>/</span>
              {isLast ? (
                <span className="text-primary">{name}</span>
              ) : (
                <Link to={link} className="hover:text-white transition-colors">
                  {name}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
}
