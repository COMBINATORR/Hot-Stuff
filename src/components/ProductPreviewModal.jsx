import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ResponsiveImage from './ResponsiveImage';

// Mapping for color labels
const COLOR_LABEL_MAP = {
  '#4a4a4a': 'GRAPHITE',
  '#2d5e87': 'OCEAN BLUE',
  '#b8860b': 'GOLD',
  '#ffffff': 'SILK WHITE',
  '#ffd700': 'ROYAL GOLD',
  '#111111': 'BLACK',
  '#004d40': 'FOREST GREEN',
  '#b5585d': 'DEEP ROSE',
  '#d4af37': 'GOLD',
};

export default function ProductPreviewModal({ product, isOpen, onClose, onAddToCart }) {
  const navigate = useNavigate();
  
  // States
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [expandedSection, setExpandedSection] = useState('description');
  
  // Ref для мобильного контейнера — сброс скролла при открытии
  const mobileModalRef = useRef(null);
  
  // Mobile check
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Swipe state
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [touchEndY, setTouchEndY] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync state with product change
  useEffect(() => {
    if (product) {
      if (product.colors && product.colors.length > 0) {
        const firstColor = typeof product.colors[0] === 'object' ? product.colors[0].hex : product.colors[0];
        setSelectedColor(firstColor);
      }
      setSelectedImageIndex(0);
    }
  }, [product]);

  // Lock body scroll when open (desktop only — на мобильном overflow:hidden ломает отображение)
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('preview-modal-open');
      if (!isMobile) {
        document.body.style.overflow = 'hidden';
      }
      // На мобильном сбрасываем скролл модала в начало (к фото товара)
      if (isMobile && mobileModalRef.current) {
        mobileModalRef.current.scrollTop = 0;
      }
    } else {
      document.body.classList.remove('preview-modal-open');
      document.body.style.overflow = '';
    }
    return () => {
      document.body.classList.remove('preview-modal-open');
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  // Дополнительный сброс скролла при смене товара (если модал уже открыт)
  useEffect(() => {
    if (isOpen && isMobile && mobileModalRef.current) {
      mobileModalRef.current.scrollTop = 0;
    }
  }, [product, isOpen, isMobile]);

  if (!product) return null;

  // Derive colors
  const colorsList = product.colors?.map(c => {
    if (typeof c === 'object') return c;
    const hex = c.toLowerCase();
    return { hex, label: COLOR_LABEL_MAP[hex] || 'CUSTOM COLOR' };
  }) || [];

  const activeColorObject = colorsList.find(c => c.hex.toLowerCase() === selectedColor.toLowerCase());
  const activeColorName = activeColorObject ? activeColorObject.label : '';

  // Pricing calculations
  const oldPriceValue = product.oldPrice || Math.round(product.price * 1.32);
  const discountPercent = product.discount || Math.round(((oldPriceValue - product.price) / oldPriceValue) * 100);
  const savedAmount = oldPriceValue - product.price;

  // Dynamic image list
  const galleryImages = product.gallery || [product.image];

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        variant: activeColorName || 'Default',
        qty: 1
      });
      onClose();
    }
  };

  const handleNavigateToProduct = () => {
    onClose();
    navigate(`/product/${product.id}`);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  // Swipe gesture handlers (prevent fighting with vertical page scroll)
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEndX(null);
    setTouchEndY(null);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (touchStartX === null || touchEndX === null || touchStartY === null || touchEndY === null) return;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Only swipe if horizontal movement is greater than vertical movement
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > minSwipeDistance) {
        if (diffX > 0) {
          // Swipe left -> Next image
          setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
        } else {
          // Swipe right -> Previous image
          setSelectedImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
        }
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {isMobile ? (
            /* MOBILE FULL SCREEN SHEET */
            <motion.div
              key={product.id}
              ref={mobileModalRef}
              className="fixed inset-0 w-full h-full bg-white z-[300] flex flex-col overflow-y-auto text-black font-sans overscroll-y-contain"
              style={{ WebkitOverflowScrolling: 'touch' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
              onAnimationComplete={() => {
                // Гарантированный сброс скролла после рендера и анимации
                requestAnimationFrame(() => {
                  if (mobileModalRef.current) {
                    mobileModalRef.current.scrollTop = 0;
                  }
                });
              }}
            >
              {/* Floating Controls at Top Right */}
              <div className="absolute top-4 right-4 flex gap-2.5 z-40">
                <button 
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-black border border-gray-100 shadow-sm"
                  aria-label="В избранное"
                >
                  <span className={`material-symbols-outlined text-[18px] ${isFavorited ? 'fill-current text-[#FF5C3F]' : ''}`}>
                    {isFavorited ? 'favorite' : 'favorite_border'}
                  </span>
                </button>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-black border border-gray-100 shadow-sm"
                  aria-label="Закрыть"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Swipeable Image Gallery Area */}
              <div 
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className="w-full bg-[#F9F9F9] pt-12 pb-8 px-6 flex flex-col items-center justify-center relative min-h-[320px] select-none"
              >
                <ResponsiveImage
                  src={galleryImages[selectedImageIndex] || product.image}
                  alt={product.name}
                  className="max-h-[220px] object-contain transition-all duration-300"
                />
                
                {/* Dots Indicator */}
                {galleryImages.length > 1 && (
                  <div className="flex gap-1.5 mt-6">
                    {galleryImages.map((_, idx) => (
                      <span 
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          selectedImageIndex === idx ? 'bg-black scale-110' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Info Details Section */}
              <div className="w-full p-6 flex flex-col bg-white">
                {/* Subtitle & Title */}
                <div>
                  <span className="text-[9px] tracking-[0.25em] font-sans font-bold text-gray-400 uppercase block mb-1">
                    {product.categoryLabel || 'СЕКС-ИГРУШКИ'}
                  </span>
                  <h2 className="text-[22px] font-medium tracking-[0.1em] font-display uppercase leading-tight text-black">
                    {product.name}
                  </h2>
                </div>

                {/* Discount Badge */}
                <div className="mt-3.5 flex">
                  <span className="bg-[#FF5C3F] text-white text-[10px] font-bold px-2 py-0.5 rounded-[2px] leading-none">
                    -{discountPercent}%
                  </span>
                </div>

                {/* Price block */}
                <div className="mt-5 flex flex-col">
                  <span className="text-gray-400 line-through text-[11px] font-sans">
                    {oldPriceValue.toLocaleString('ru-KZ')} ₸
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-[#FF5C3F] font-bold text-[18px] font-sans">
                      {product.price.toLocaleString('ru-KZ')} ₸
                    </span>
                    <span className="text-gray-500 text-[10px] font-sans">
                      сохранить {savedAmount.toLocaleString('ru-KZ')} ₸
                    </span>
                  </div>
                </div>

                {/* Color Swatches */}
                {colorsList.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        {colorsList.map((colorObj) => {
                          const isSelected = selectedColor.toLowerCase() === colorObj.hex.toLowerCase();
                          return (
                            <button
                              key={colorObj.hex}
                              onClick={() => setSelectedColor(colorObj.hex)}
                              className={`w-5.5 h-5.5 rounded-full border transition-all flex items-center justify-center ${
                                isSelected ? 'border-black scale-105 ring-1 ring-black' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: colorObj.hex }}
                            >
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <span className="font-sans font-bold text-[9px] tracking-wider text-black uppercase">
                        {activeColorName}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions Grid */}
                <div className="mt-8 flex gap-3">
                  <button
                    onClick={handleNavigateToProduct}
                    className="flex-1 bg-white text-black border border-black font-sans font-bold text-[10px] tracking-[0.15em] py-3.5 uppercase text-center"
                  >
                    ПОСМОТРЕТЬ
                  </button>
                  <button
                    onClick={handleAdd}
                    className="flex-1 bg-black text-white border border-black font-sans font-bold text-[10px] tracking-[0.15em] py-3.5 uppercase"
                  >
                    ADD TO CART
                  </button>
                </div>

                {/* Accordions */}
                <div className="mt-8 border-t border-gray-100 pb-12">
                  {/* Description Accordion */}
                  <div className="border-b border-gray-100 py-3.5">
                    <button
                      onClick={() => toggleSection('description')}
                      className="w-full flex justify-between items-center text-left"
                    >
                      <span className="text-[11px] font-bold tracking-wider text-black">ОПИСАНИЕ</span>
                      <span className="material-symbols-outlined text-[16px] text-gray-500">
                        {expandedSection === 'description' ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {expandedSection === 'description' && (
                      <p className="mt-2.5 text-[11px] text-gray-600 leading-relaxed font-sans">
                        {product.description || `Вибромассажер премиального класса ${product.name}.`}
                      </p>
                    )}
                  </div>

                  {/* Warranty Accordion */}
                  <div className="border-b border-gray-100 py-3.5">
                    <button
                      onClick={() => toggleSection('warranty')}
                      className="w-full flex justify-between items-center text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-gray-500 font-light">verified_user</span>
                        <span className="text-[11px] font-bold tracking-wider text-black">ГАРАНТИЯ</span>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-gray-500">
                        {expandedSection === 'warranty' ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {expandedSection === 'warranty' && (
                      <p className="mt-2 pl-7 text-[10px] text-gray-500 font-sans">
                        гарантия 2 года на все механизмы
                      </p>
                    )}
                  </div>

                  {/* Secure Accordion */}
                  <div className="border-b border-gray-100 py-3.5">
                    <button
                      onClick={() => toggleSection('secure')}
                      className="w-full flex justify-between items-center text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-gray-500 font-light">credit_card</span>
                        <span className="text-[11px] font-bold tracking-wider text-black">БЕЗОПАСНАЯ ПОКУПКА</span>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-gray-500">
                        {expandedSection === 'secure' ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {expandedSection === 'secure' && (
                      <p className="mt-2 pl-7 text-[10px] text-gray-500 font-sans">
                        100% безопасная оплата через защищенный шлюз
                      </p>
                    )}
                  </div>

                  {/* Delivery Accordion */}
                  <div className="border-b border-gray-100 py-3.5">
                    <button
                      onClick={() => toggleSection('delivery')}
                      className="w-full flex justify-between items-center text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-gray-500 font-light">local_shipping</span>
                        <span className="text-[11px] font-bold tracking-wider text-black">ИНФОРМАЦИЯ О ДОСТАВКЕ</span>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-gray-500">
                        {expandedSection === 'delivery' ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {expandedSection === 'delivery' && (
                      <p className="mt-2 pl-7 text-[10px] text-gray-500 font-sans">
                        анонимная курьерская доставка по всему миру
                      </p>
                    )}
                  </div>

                  {/* Package Accordion */}
                  <div className="border-b border-gray-100 py-3.5">
                    <button
                      onClick={() => toggleSection('package')}
                      className="w-full flex justify-between items-center text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-gray-500 font-light">visibility_off</span>
                        <span className="text-[11px] font-bold tracking-wider text-black">НЕПРИМЕТНАЯ УПАКОВКА</span>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-gray-500">
                        {expandedSection === 'package' ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {expandedSection === 'package' && (
                      <p className="mt-2 pl-7 text-[10px] text-gray-500 font-sans">
                        сохраняйте инкогнито: коробка без опознавательных знаков
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* DESKTOP CENTERED MODAL — прямоугольник по центру экрана */
            <div className="fixed inset-0 z-[300] flex items-center justify-center outline-none focus:outline-none">
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
              />

              {/* Modal Container — фиксированная высота, центр экрана */}
              <motion.div
                className="relative z-[310] w-full max-w-[900px] mx-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                <div className="relative flex flex-row w-full bg-white text-black shadow-2xl" style={{ height: '80vh', maxHeight: '720px' }}>
                  
                  {/* LEFT: Миниатюры + Главное фото */}
                  <div className="flex flex-row h-full" style={{ width: '50%' }}>
                    {/* Thumbnails column */}
                    <div className="flex flex-col items-center gap-2.5 py-5 px-3 bg-white border-r border-gray-100 overflow-y-auto flex-none" style={{ width: '72px' }}>
                      {galleryImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`w-[50px] h-[50px] border flex-none ${
                            selectedImageIndex === idx ? 'border-black' : 'border-gray-200'
                          } p-1 hover:border-black transition-colors bg-gray-50 flex items-center justify-center`}
                        >
                          <ResponsiveImage src={img} alt="thumbnail" className="w-full h-full object-cover" />
                        </button>
                      ))}
                      {/* Play Video Icon */}
                      <button className="w-[50px] h-[50px] border border-gray-200 hover:border-black transition-colors bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black flex-none">
                        <span className="material-symbols-outlined text-[20px] fill-current">play_arrow</span>
                      </button>
                    </div>

                    {/* Main Image */}
                    <div className="flex-1 bg-[#F9F9F9] flex items-center justify-center p-8">
                      <ResponsiveImage
                        src={galleryImages[selectedImageIndex] || product.image}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* RIGHT: Информация о товаре — скроллится */}
                  <div className="flex flex-col h-full border-l border-gray-100" style={{ width: '50%' }}>
                    
                    {/* Header Controls — крестик и сердечко */}
                    <div className="flex justify-end flex-none border-b border-gray-100">
                      <button 
                        onClick={() => setIsFavorited(!isFavorited)}
                        className="flex items-center justify-center w-12 h-12 bg-white text-black hover:text-[#FF5C3F] transition-colors border-l border-gray-100"
                      >
                        <span className={`material-symbols-outlined text-[20px] ${isFavorited ? 'fill-current text-[#FF5C3F]' : ''}`}>
                          {isFavorited ? 'favorite' : 'favorite_border'}
                        </span>
                      </button>
                      <button 
                        onClick={onClose}
                        className="flex items-center justify-center w-12 h-12 bg-white text-black hover:bg-black hover:text-white transition-colors border-l border-gray-100"
                      >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      </button>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                      {/* Title */}
                      <div>
                        <h2 className="text-[22px] font-medium tracking-[0.08em] uppercase leading-tight text-black">
                          {product.name}
                        </h2>
                        <span className="text-[9px] tracking-[0.2em] font-bold text-gray-400 uppercase mt-1 block">
                          {product.categoryLabel || 'СЕКС-ИГРУШКИ'}
                        </span>
                      </div>

                      {/* Discount Badge */}
                      <div className="mt-4 flex">
                        <span className="bg-[#FF5C3F] text-white text-[10px] font-bold px-2 py-0.5 rounded-[2px] leading-none">
                          -{discountPercent}%
                        </span>
                      </div>

                      {/* Pricing */}
                      <div className="mt-4 flex flex-col">
                        <span className="text-gray-400 line-through text-[12px] font-sans">
                          {oldPriceValue.toLocaleString('ru-KZ')} ₸
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-[#FF5C3F] font-bold text-[18px] font-sans">
                            {product.price.toLocaleString('ru-KZ')} ₸
                          </span>
                          <span className="text-gray-500 text-[10px] font-sans">
                            сохранить {savedAmount.toLocaleString('ru-KZ')} ₸
                          </span>
                        </div>
                      </div>

                      {/* Color Swatches */}
                      {colorsList.length > 0 && (
                        <div className="mt-6 flex items-center gap-3">
                          <div className="flex gap-2">
                            {colorsList.map((colorObj) => {
                              const isSelected = selectedColor.toLowerCase() === colorObj.hex.toLowerCase();
                              return (
                                <button
                                  key={colorObj.hex}
                                  onClick={() => setSelectedColor(colorObj.hex)}
                                  className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${
                                    isSelected ? 'border-black scale-110 ring-1 ring-black' : 'border-gray-300 hover:border-black'
                                  }`}
                                  style={{ backgroundColor: colorObj.hex }}
                                >
                                  {isSelected && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          <span className="font-sans font-bold text-[10px] tracking-wider text-black uppercase">
                            {activeColorName}
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-6 flex gap-2.5">
                        <button
                          onClick={handleNavigateToProduct}
                          className="flex-1 bg-white text-black border border-black font-sans font-bold text-[10px] tracking-[0.15em] uppercase py-3 hover:bg-black hover:text-white transition-all text-center"
                        >
                          ПОСМОТРЕТЬ
                        </button>
                        <button
                          onClick={handleAdd}
                          className="flex-1 bg-black text-white border border-black font-sans font-bold text-[10px] tracking-[0.15em] uppercase py-3 hover:bg-gray-800 transition-all"
                        >
                          ADD TO CART
                        </button>
                      </div>

                      {/* Accordions */}
                      <div className="mt-6 border-t border-gray-100">
                        {/* Description */}
                        <div className="border-b border-gray-100 py-3.5">
                          <button onClick={() => toggleSection('description')} className="w-full flex justify-between items-center text-left">
                            <span className="text-[11px] font-bold tracking-wider text-black">ОПИСАНИЕ</span>
                            <span className="material-symbols-outlined text-[16px] text-gray-400">
                              {expandedSection === 'description' ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>
                          {expandedSection === 'description' && (
                            <p className="mt-2 text-[11px] text-gray-600 leading-relaxed font-sans">
                              {product.description || `Вибромассажер премиального класса ${product.name}.`}
                            </p>
                          )}
                        </div>

                        {/* Warranty */}
                        <div className="border-b border-gray-100 py-3.5">
                          <button onClick={() => toggleSection('warranty')} className="w-full flex justify-between items-center text-left">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px] text-gray-400 font-light">verified_user</span>
                              <div>
                                <span className="text-[11px] font-bold tracking-wider text-black block">ГАРАНТИЯ</span>
                                <span className="text-[9px] text-gray-400 font-sans">гарантия 2 года</span>
                              </div>
                            </div>
                            <span className="material-symbols-outlined text-[16px] text-gray-400">
                              {expandedSection === 'warranty' ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>
                          {expandedSection === 'warranty' && (
                            <p className="mt-2 pl-7 text-[10px] text-gray-500 font-sans">гарантия 2 года на все механизмы</p>
                          )}
                        </div>

                        {/* Secure */}
                        <div className="border-b border-gray-100 py-3.5">
                          <button onClick={() => toggleSection('secure')} className="w-full flex justify-between items-center text-left">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px] text-gray-400 font-light">credit_card</span>
                              <div>
                                <span className="text-[11px] font-bold tracking-wider text-black block">БЕЗОПАСНАЯ ПОКУПКА</span>
                                <span className="text-[9px] text-gray-400 font-sans">100% безопасная оплата</span>
                              </div>
                            </div>
                            <span className="material-symbols-outlined text-[16px] text-gray-400">
                              {expandedSection === 'secure' ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>
                          {expandedSection === 'secure' && (
                            <p className="mt-2 pl-7 text-[10px] text-gray-500 font-sans">100% безопасная оплата через защищенный шлюз</p>
                          )}
                        </div>

                        {/* Delivery */}
                        <div className="border-b border-gray-100 py-3.5">
                          <button onClick={() => toggleSection('delivery')} className="w-full flex justify-between items-center text-left">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px] text-gray-400 font-light">local_shipping</span>
                              <div>
                                <span className="text-[11px] font-bold tracking-wider text-black block">ИНФОРМАЦИЯ О ДОСТАВКЕ</span>
                                <span className="text-[9px] text-gray-400 font-sans">доставка по всему миру</span>
                              </div>
                            </div>
                            <span className="material-symbols-outlined text-[16px] text-gray-400">
                              {expandedSection === 'delivery' ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>
                          {expandedSection === 'delivery' && (
                            <p className="mt-2 pl-7 text-[10px] text-gray-500 font-sans">анонимная курьерская доставка по всему миру</p>
                          )}
                        </div>

                        {/* Package */}
                        <div className="border-b border-gray-100 py-3.5">
                          <button onClick={() => toggleSection('package')} className="w-full flex justify-between items-center text-left">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px] text-gray-400 font-light">visibility_off</span>
                              <div>
                                <span className="text-[11px] font-bold tracking-wider text-black block">НЕПРИМЕТНАЯ УПАКОВКА</span>
                                <span className="text-[9px] text-gray-400 font-sans">сохраняйте инкогнито</span>
                              </div>
                            </div>
                            <span className="material-symbols-outlined text-[16px] text-gray-400">
                              {expandedSection === 'package' ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>
                          {expandedSection === 'package' && (
                            <p className="mt-2 pl-7 text-[10px] text-gray-500 font-sans">сохраняйте инкогнито: коробка без опознавательных знаков</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
