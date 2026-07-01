import React, { useState } from 'react';

import HomeHero from '../components/home/HomeHero';
import TrustSection from '../components/home/TrustSection';
import BrandQuote from '../components/home/BrandQuote';
import CategoryBlocks from '../components/home/CategoryBlocks';
import QuizSection from '../components/home/QuizSection';
import NewsletterSection from '../components/home/NewsletterSection';

import ProductPreviewModal from '../components/ProductPreviewModal';

export default function HomePage({ onAddToCart }) {
  const [selectedPreviewProduct, setSelectedPreviewProduct] = useState(null);

  return (
    <div className="page-enter">
      {/* 1. Главный блок с видео */}
      <HomeHero />

      {/* Цитата бренда (Философия) */}
      <BrandQuote />

      {/* 2. Блоки категорий Часть 1: Классика и Раздельный блок 50/50 */}
      <CategoryBlocks part={1} />

      {/* 3. Блок категорий Часть 2: Эротика */}
      <CategoryBlocks part={2} />

      {/* 4. Квиз (размещен между категориями) */}
      <QuizSection />

      {/* 5. Блоки категорий Часть 3: Для пар, Анальные, БДСМ, Лубриканты, Магазин */}
      <CategoryBlocks part={3} />

      {/* 6. Блок преимуществ (спущен вниз) */}
      <TrustSection />

      {/* Подписка на рассылку */}
      <NewsletterSection />

      {/* Модальное окно просмотра товара */}
      <ProductPreviewModal 
        product={selectedPreviewProduct}
        isOpen={!!selectedPreviewProduct}
        onClose={() => setSelectedPreviewProduct(null)}
        onAddToCart={onAddToCart}
      />
    </div>
  );
}
