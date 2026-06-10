import React, { useState, useEffect } from 'react';
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

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
  const oldPriceValue = product.oldPrice || Math.round(product.price * 1.32); // fallback old price if not defined
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
      // Close modal on add
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-5xl mx-auto my-6 px-4 md:px-0 z-[310]"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          >
            {/* Modal Content */}
            <div className="relative flex flex-col md:flex-row w-full bg-white text-black shadow-2xl border-none outline-none overflow-hidden max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible">
              
              {/* LEFT SIDEBAR: Thumbnails */}
              <div className="flex md:flex-col items-center gap-3 p-4 bg-white border-r border-gray-100 flex-row w-full md:w-20 order-2 md:order-1 justify-center md:justify-start">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-12 h-12 border ${
                      selectedImageIndex === idx ? 'border-black' : 'border-gray-200'
                    } p-1 hover:border-black transition-colors bg-gray-50 flex items-center justify-center`}
                  >
                    <ResponsiveImage src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
                {/* Play Video Icon */}
                <button className="w-12 h-12 border border-gray-200 hover:border-black transition-colors bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black">
                  <span className="material-symbols-outlined text-[20px] fill-current">play_arrow</span>
                </button>
              </div>

              {/* CENTER: Main Image Display */}
              <div className="flex-1 bg-[#F9F9F9] relative flex items-center justify-center min-h-[350px] md:min-h-[500px] order-1 md:order-2 p-6">
                <ResponsiveImage
                  src={galleryImages[selectedImageIndex] || product.image}
                  alt={product.name}
                  className="max-w-full max-h-[400px] object-contain transition-all duration-300"
                />
              </div>

              {/* RIGHT SIDE: Product Info */}
              <div className="w-full md:w-[420px] p-8 md:p-10 bg-white flex flex-col order-3 border-l border-gray-100 max-h-none md:max-h-[90vh] overflow-y-auto">
                {/* Header Controls */}
                <div className="absolute top-0 right-0 flex z-20">
                  {/* Heart / Favorite Button */}
                  <button 
                    onClick={() => setIsFavorited(!isFavorited)}
                    className="flex items-center justify-center w-14 h-14 bg-white text-black hover:text-primary transition-colors border-l border-b border-gray-100"
                  >
                    <span className={`material-symbols-outlined text-[20px] ${isFavorited ? 'fill-current text-primary' : ''}`}>
                      {isFavorited ? 'favorite' : 'favorite_border'}
                    </span>
                  </button>
                  {/* Close button with square outline */}
                  <button 
                    onClick={onClose}
                    className="flex items-center justify-center w-14 h-14 bg-white text-black hover:bg-black hover:text-white transition-colors border-l border-b border-gray-100"
                  >
                    <span className="material-symbols-outlined text-[20px] font-bold">close</span>
                  </button>
                </div>

                {/* Subtitle & Title */}
                <div className="mt-4 pr-16">
                  <span className="text-[10px] tracking-[0.2em] font-sans font-bold text-gray-400 uppercase block mb-1">
                    {product.categoryLabel || 'СЕКС-ИГРУШКИ'}
                  </span>
                  <h2 className="text-[20px] md:text-[24px] font-medium tracking-[0.1em] font-display uppercase leading-tight text-black">
                    {product.name}
                  </h2>
                </div>

                {/* Promo Badge */}
                <div className="mt-4 flex">
                  <span className="bg-[#FF5C3F] text-white text-[11px] font-bold px-2.5 py-1 rounded-[2px] leading-none">
                    -{discountPercent}%
                  </span>
                </div>

                {/* Pricing Block */}
                <div className="mt-6 flex flex-col">
                  <span className="text-gray-400 line-through text-[13px] font-sans">
                    {oldPriceValue.toLocaleString('ru-KZ')} ₸
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-[#FF5C3F] font-bold text-[18px] md:text-[20px] font-sans">
                      {product.price.toLocaleString('ru-KZ')} ₸
                    </span>
                    <span className="text-gray-500 text-[11px] font-sans">
                      сохранить {savedAmount.toLocaleString('ru-KZ')} ₸
                    </span>
                  </div>
                </div>

                {/* Color Selection Swatches */}
                <div className="mt-8">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex gap-2.5">
                      {colorsList.map((colorObj) => {
                        const isSelected = selectedColor.toLowerCase() === colorObj.hex.toLowerCase();
                        return (
                          <button
                            key={colorObj.hex}
                            onClick={() => setSelectedColor(colorObj.hex)}
                            className={`w-6 h-6 rounded-full border transition-all relative flex items-center justify-center ${
                              isSelected ? 'border-black scale-110 ring-1 ring-black' : 'border-gray-300 hover:border-black'
                            }`}
                            style={{ backgroundColor: colorObj.hex }}
                            title={colorObj.label}
                          >
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <span className="font-sans font-bold text-[11px] tracking-wider text-black uppercase">
                      {activeColorName}
                    </span>
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="mt-8 flex gap-3">
                  <button
                    onClick={handleNavigateToProduct}
                    className="flex-1 bg-white text-black border border-black font-sans font-bold text-[11px] tracking-[0.15em] uppercase py-4 rounded-none hover:bg-black hover:text-white transition-all text-center"
                  >
                    ПОСМОТРЕТЬ
                  </button>
                  <button
                    onClick={handleAdd}
                    className="flex-1 bg-black text-white border border-black font-sans font-bold text-[11px] tracking-[0.15em] uppercase py-4 rounded-none hover:bg-gray-800 transition-all"
                  >
                    ADD TO CART
                  </button>
                </div>

                {/* Accordions */}
                <div className="mt-8 border-t border-gray-100 flex-1">
                  {/* Description Accordion */}
                  <div className="border-b border-gray-100 py-4">
                    <button
                      onClick={() => toggleSection('description')}
                      className="w-full flex justify-between items-center text-left"
                    >
                      <span className="text-[12px] font-bold tracking-wider text-black">ОПИСАНИЕ</span>
                      <span className="material-symbols-outlined text-[18px] text-gray-500">
                        {expandedSection === 'description' ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {expandedSection === 'description' && (
                      <p className="mt-3 text-[12px] text-gray-600 leading-relaxed font-sans">
                        {product.description || `Вибромассажер премиального класса ${product.name} с мощными режимами наслаждения для тех, кто хочет разжечь в себе искру любви. Благодаря высококачественным материалам и продуманной эргономике обеспечивает глубокое удовлетворение.`}
                      </p>
                    )}
                  </div>

                  {/* Warranty Accordion */}
                  <div className="border-b border-gray-100 py-4">
                    <button
                      onClick={() => toggleSection('warranty')}
                      className="w-full flex justify-between items-center text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[20px] text-gray-500 font-light">verified_user</span>
                        <span className="text-[11px] font-bold tracking-wider text-black">ГАРАНТИЯ</span>
                      </div>
                      <span className="material-symbols-outlined text-[18px] text-gray-500">
                        {expandedSection === 'warranty' ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {expandedSection === 'warranty' && (
                      <p className="mt-2 pl-8 text-[11px] text-gray-500 font-sans">
                        гарантия 2 года на все механизмы
                      </p>
                    )}
                  </div>

                  {/* Secure Accordion */}
                  <div className="border-b border-gray-100 py-4">
                    <button
                      onClick={() => toggleSection('secure')}
                      className="w-full flex justify-between items-center text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[20px] text-gray-500 font-light">credit_card</span>
                        <span className="text-[11px] font-bold tracking-wider text-black">БЕЗОПАСНАЯ ПОКУПКА</span>
                      </div>
                      <span className="material-symbols-outlined text-[18px] text-gray-500">
                        {expandedSection === 'secure' ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {expandedSection === 'secure' && (
                      <p className="mt-2 pl-8 text-[11px] text-gray-500 font-sans">
                        100% безопасная оплата через защищенный шлюз
                      </p>
                    )}
                  </div>

                  {/* Delivery Accordion */}
                  <div className="border-b border-gray-100 py-4">
                    <button
                      onClick={() => toggleSection('delivery')}
                      className="w-full flex justify-between items-center text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[20px] text-gray-500 font-light">local_shipping</span>
                        <span className="text-[11px] font-bold tracking-wider text-black">ИНФОРМАЦИЯ О ДОСТАВКЕ</span>
                      </div>
                      <span className="material-symbols-outlined text-[18px] text-gray-500">
                        {expandedSection === 'delivery' ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {expandedSection === 'delivery' && (
                      <p className="mt-2 pl-8 text-[11px] text-gray-500 font-sans">
                        анонимная курьерская доставка по всему миру
                      </p>
                    )}
                  </div>

                  {/* Package Accordion */}
                  <div className="border-b border-gray-100 py-4">
                    <button
                      onClick={() => toggleSection('package')}
                      className="w-full flex justify-between items-center text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[20px] text-gray-500 font-light">visibility_off</span>
                        <span className="text-[11px] font-bold tracking-wider text-black">НЕПРИМЕТНАЯ УПАКОВКА</span>
                      </div>
                      <span className="material-symbols-outlined text-[18px] text-gray-500">
                        {expandedSection === 'package' ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {expandedSection === 'package' && (
                      <p className="mt-2 pl-8 text-[11px] text-gray-500 font-sans">
                        сохраняйте инкогнито: коробка без опознавательных знаков
                      </p>
                    )}
                  </div>

                </div>

              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
