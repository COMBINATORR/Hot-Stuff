import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_PRODUCTS } from '../data/products';
import ResponsiveImage from './ResponsiveImage';

import lookbookLingerie1 from '../assets/images/lookbook_lingerie_1.png';
import lookbookLingerie2 from '../assets/images/lookbook_lingerie_2.png';
import lookbookLingerie3 from '../assets/images/lookbook_lingerie_3.png';
import lookbookLingerie4 from '../assets/images/lookbook_lingerie_4.png';
import lookbookLingerie5 from '../assets/images/lookbook_lingerie_5.png';
import lookbookLingerie6 from '../assets/images/lookbook_lingerie_6.png';
import lookbookLingerie7 from '../assets/images/lookbook_lingerie_7.png';
import lookbookLingerie8 from '../assets/images/lookbook_lingerie_8.png';
import lookbookLingerie9 from '../assets/images/lookbook_lingerie_9.png';
import lookbookLingerie10 from '../assets/images/lookbook_lingerie_10.png';

const SCENES = [
  {
    id: 1,
    image: lookbookLingerie1,
    hotspots: [
      { productId: 1, top: '45%', left: '51%', tooltipAlign: 'right-start' },
      { productId: 2, top: '68%', left: '50%', tooltipAlign: 'top-center' }
    ]
  },
  {
    id: 2,
    image: lookbookLingerie2,
    hotspots: [
      { productId: 4, top: '42%', left: '48%', tooltipAlign: 'right-start' },
      { productId: 9, top: '65%', left: '52%', tooltipAlign: 'left-start' }
    ]
  },
  {
    id: 3,
    image: lookbookLingerie3,
    hotspots: [
      { productId: 8, top: '38%', left: '49%', tooltipAlign: 'top-center' },
      { productId: 7, top: '62%', left: '49%', tooltipAlign: 'right-start' }
    ]
  },
  {
    id: 4,
    image: lookbookLingerie4,
    hotspots: [
      { productId: 1, top: '40%', left: '52%', tooltipAlign: 'right-start' },
      { productId: 2, top: '66%', left: '51%', tooltipAlign: 'top-center' }
    ]
  },
  {
    id: 5,
    image: lookbookLingerie5,
    hotspots: [
      { productId: 3, top: '45%', left: '51%', tooltipAlign: 'right-start' },
      { productId: 8, top: '68%', left: '50%', tooltipAlign: 'top-center' }
    ]
  },
  {
    id: 6,
    image: lookbookLingerie6,
    hotspots: [
      { productId: 3, top: '42%', left: '48%', tooltipAlign: 'left-start' },
      { productId: 4, top: '65%', left: '52%', tooltipAlign: 'right-start' }
    ]
  },
  {
    id: 7,
    image: lookbookLingerie7,
    hotspots: [
      { productId: 8, top: '38%', left: '49%', tooltipAlign: 'top-center' },
      { productId: 9, top: '62%', left: '49%', tooltipAlign: 'right-start' }
    ]
  },
  {
    id: 8,
    image: lookbookLingerie8,
    hotspots: [
      { productId: 4, top: '40%', left: '52%', tooltipAlign: 'right-start' },
      { productId: 7, top: '66%', left: '51%', tooltipAlign: 'left-start' }
    ]
  },
  {
    id: 9,
    image: lookbookLingerie9,
    hotspots: [
      { productId: 1, top: '45%', left: '51%', tooltipAlign: 'right-start' },
      { productId: 2, top: '68%', left: '50%', tooltipAlign: 'top-center' }
    ]
  },
  {
    id: 10,
    image: lookbookLingerie10,
    hotspots: [
      { productId: 9, top: '42%', left: '48%', tooltipAlign: 'left-start' },
      { productId: 7, top: '65%', left: '52%', tooltipAlign: 'right-start' }
    ]
  }
];

export default function HotspotsLookbook({ onSelectQuickView, onAddToCart }) {
  const { t } = useTranslation();
  const [activeScene, setActiveScene] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const containerRef = useRef(null);

  // Close tooltips on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActiveHotspot(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHotspotClick = (index, e) => {
    e.stopPropagation();
    setActiveHotspot(activeHotspot === index ? null : index);
  };

  const handleQuickAdd = (product, e) => {
    e.stopPropagation();
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : { name: 'Default', hex: '#fff' };
    const defaultSize = 'One Size';
    onAddToCart(product, defaultColor, defaultSize);
    setActiveHotspot(null);
  };

  const nextScene = () => {
    setActiveHotspot(null);
    setActiveScene((prev) => (prev + 1) % SCENES.length);
  };

  const prevScene = () => {
    setActiveHotspot(null);
    setActiveScene((prev) => (prev - 1 + SCENES.length) % SCENES.length);
  };

  const currentScene = SCENES[activeScene];

  return (
    <section className="bg-black py-20 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="font-sans font-black text-[18px] md:text-[32px] tracking-[0.2em] text-white uppercase mb-4">
          {t('lookbook.title', 'интерактивный лукбук')}
        </h2>
        <div className="w-12 h-[2px] bg-primary mx-auto mb-6"></div>
        <p className="text-[11px] sm:text-xs md:text-sm tracking-[0.15em] text-neutral-400 uppercase max-w-2xl mx-auto leading-relaxed">
          {t('lookbook.subtitle', 'нажмите на светящиеся точки, чтобы рассмотреть детали образов и добавить товары в корзину')}
        </p>
      </div>

      <div className="container-hs mx-auto relative select-none group/scene" ref={containerRef}>
        {/* Backdrop Image with AnimatePresence for crossfade */}
        <div className="relative w-full aspect-[4/5] sm:aspect-[16/10] md:aspect-[16/9] lg:aspect-[21/9] overflow-hidden border border-white/10 rounded-none bg-stone-900 group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 w-full h-full"
            >
              <ResponsiveImage
                src={currentScene.image}
                alt={`Lookbook Scene ${currentScene.id}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />

          {/* Navigation Arrows */}
          <button 
            onClick={prevScene} 
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center bg-black/40 hover:bg-primary text-white hover:text-black rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
          >
            <span className="material-symbols-outlined text-[20px] md:text-[28px]">chevron_left</span>
          </button>
          
          <button 
            onClick={nextScene} 
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center bg-black/40 hover:bg-primary text-white hover:text-black rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
          >
            <span className="material-symbols-outlined text-[20px] md:text-[28px]">chevron_right</span>
          </button>

          {/* Hotspots for Current Scene */}
          <AnimatePresence>
            {currentScene.hotspots.map((hotspot, idx) => {
              const product = ALL_PRODUCTS.find(p => p.id === hotspot.productId);
              if (!product) return null;

              const isActive = activeHotspot === idx;

              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                  key={`hotspot-${currentScene.id}-${idx}`}
                  className="absolute z-30"
                  style={{ top: hotspot.top, left: hotspot.left }}
                >
                  {/* Trigger Button */}
                  <button
                    onClick={(e) => handleHotspotClick(idx, e)}
                    className="relative flex items-center justify-center w-8 h-8 focus:outline-none group/dot"
                    aria-label={`View ${product.name}`}
                  >
                    {/* Glow ring */}
                    <span className="absolute hidden group-hover/dot:inline-flex h-full w-full rounded-full bg-primary/40 opacity-75 animate-ping"></span>
                    {/* Pulsing Dot */}
                    <span className={`relative inline-flex rounded-full h-3.5 w-3.5 border border-white transition-all duration-300 ${isActive ? 'bg-white scale-125' : 'bg-primary group-hover/dot:bg-white'}`}></span>
                  </button>

                  {/* Tooltip Card */}
                  {isActive && (
                    <div
                      className={`absolute z-40 bg-[#0F0F0F] border border-white/10 p-4 w-[240px] text-left transition-all duration-300 ease-out shadow-2xl font-sans rounded-none
                        ${hotspot.tooltipAlign === 'left-start' ? 'right-full mr-3 bottom-0' : ''}
                        ${hotspot.tooltipAlign === 'right-start' ? 'left-full ml-3 bottom-0' : ''}
                        ${hotspot.tooltipAlign === 'top-center' ? 'bottom-full mb-3 left-1/2 -translate-x-1/2' : ''}
                      `}
                    >
                      <div className="flex gap-3 mb-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-14 h-18 object-cover bg-stone-900 border border-white/5 flex-shrink-0"
                        />
                        <div className="flex flex-col justify-between min-w-0">
                          <div>
                            <h4 className="text-white text-[10px] tracking-widest uppercase font-bold truncate leading-tight">
                              {product.name}
                            </h4>
                            <p className="text-primary text-xs font-bold mt-1">
                              {product.price.toLocaleString('ru-KZ')} ₸
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              onSelectQuickView(product);
                              setActiveHotspot(null);
                            }}
                            className="text-[9px] text-[#C5A880] hover:text-white uppercase tracking-widest text-left font-bold"
                          >
                            {t('lookbook.quick_view', 'быстрый просмотр')}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        className="w-full bg-primary hover:bg-[#FFE088] text-[#3c2f00] text-[10px] tracking-widest font-black py-2 text-center uppercase transition-all rounded-none"
                      >
                        {t('lookbook.add_to_cart', 'добавить в корзину')}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Scene Indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
            {SCENES.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => { setActiveHotspot(null); setActiveScene(idx); }}
                className={`w-10 h-1 rounded-full transition-all duration-300 ${activeScene === idx ? 'bg-primary' : 'bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
