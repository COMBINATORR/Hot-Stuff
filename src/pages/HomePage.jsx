import React, { useState } from 'react';


import HomeHero from '../components/home/HomeHero';
import TrustSection from '../components/home/TrustSection';
import BrandIntro from '../components/home/BrandIntro';
import PopularCategories from '../components/home/PopularCategories';
import Bestsellers from '../components/home/Bestsellers';
import PromoBanner from '../components/home/PromoBanner';
import QuizSection from '../components/home/QuizSection';
import BrandQuote from '../components/home/BrandQuote';
import NewsletterSection from '../components/home/NewsletterSection';

import ProductPreviewModal from '../components/ProductPreviewModal';
import HotspotsLookbook from '../components/HotspotsLookbook';

export default function HomePage({ onAddToCart }) {
  const [selectedPreviewProduct, setSelectedPreviewProduct] = useState(null);

  // Lock scroll when quiz modal is active is now handled inside QuizSection

  return (
    <div className="page-enter">
      <HomeHero />

      <TrustSection />

      <BrandIntro />

      <PopularCategories />

      <Bestsellers onSelectPreview={setSelectedPreviewProduct} />

      {/* ═══ HOTSPOTS LOOKBOOK ═══ */}
      <HotspotsLookbook onAddToCart={onAddToCart} onSelectQuickView={setSelectedPreviewProduct} />

      <PromoBanner />

      <QuizSection />

      <BrandQuote />

      <NewsletterSection />

      {/* Product Preview Modal */}
      <ProductPreviewModal 
        product={selectedPreviewProduct}
        isOpen={!!selectedPreviewProduct}
        onClose={() => setSelectedPreviewProduct(null)}
        onAddToCart={onAddToCart}
      />
    </div>
  );
}
