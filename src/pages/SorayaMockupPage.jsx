import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { MockupHeader } from '../components/SorayaMockup/MockupHeader';
import { MockupGallery } from '../components/SorayaMockup/MockupGallery';
import { MockupPricing } from '../components/SorayaMockup/MockupPricing';
import { MockupAccordion } from '../components/SorayaMockup/MockupAccordion';
import { MockupBundles } from '../components/SorayaMockup/MockupBundles';

export default function SorayaMockupPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Interactive Swatches & Gallery Options
  const [selectedColor, setSelectedColor] = useState('Deep Rose'); // Deep Rose (Magenta), Black, Blue
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // 0 to 3 for gallery slider
  const [isFavorited, setIsFavorited] = useState(false);
  const [expandedAccordions, setExpandedAccordions] = useState({
    desc: true, // Description expanded by default
    warranty: false,
    secure: false,
    delivery: false,
    package: false
  });

  const colorHexes = {
    'Deep Rose': '#B81D7A',
    'Black': '#111111',
    'Blue': '#2D5E87'
  };

  const activeColorHex = colorHexes[selectedColor];

  const toggleAccordion = (key) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-0 md:py-8 text-black">
      <Helmet>
        <title>{t('mockup.title', 'SORAYA WAVE™ — Мобильный макет')}</title>
        <meta name="description" content={t('mockup.meta_desc', 'Интерактивный мобильный макет страницы премиум вибратора-кролика SORAYA WAVE™.')} />
      </Helmet>

      {/* Centered mobile-width container for desktop, full screen on mobile */}
      <div className="w-full max-w-md bg-white text-black min-h-screen shadow-xl flex flex-col relative border-x border-gray-100">
        
        <MockupHeader isFavorited={isFavorited} setIsFavorited={setIsFavorited} onClose={() => navigate('/catalog')} />

        <MockupGallery selectedImageIndex={selectedImageIndex} setSelectedImageIndex={setSelectedImageIndex} activeColorHex={activeColorHex} />
        <hr className="border-gray-100 mx-6" />

        <MockupPricing selectedColor={selectedColor} setSelectedColor={setSelectedColor} colorHexes={colorHexes} />
        <MockupAccordion expandedAccordions={expandedAccordions} toggleAccordion={toggleAccordion} />
        <MockupBundles />
        {/* Padding at the bottom */}
        <div className="h-12 bg-white" />

      </div>
    </div>
  );
}
