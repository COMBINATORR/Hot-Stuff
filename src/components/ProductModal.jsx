import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function ProductModal({ product, onClose, onAddToCart }) {
  const { t } = useTranslation();
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState('One Size');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Sync state when product changes
  useEffect(() => {
    if (product) {
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      } else {
        setSelectedColor({ name: 'Default', hex: '#fff' });
      }
      setSelectedSize('One Size');
      setActiveImageIndex(0);
      
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  if (!product) return null;

  const handleAddToCartClick = () => {
    onAddToCart(product, selectedColor, selectedSize);
    onClose();
  };

  const productSizes = product.category === 'lingerie' || product.categoryLabel?.toLowerCase().includes('белье')
    ? ['S', 'M', 'L']
    : ['One Size'];

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Content container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative bg-[#0F0F0F] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto sm:overflow-visible flex flex-col md:flex-row rounded-none text-stone-100 font-sans z-10"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-20 focus:outline-none"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>

          {/* Left: Images */}
          <div className="w-full md:w-1/2 p-6 flex flex-col gap-4">
            {/* Main Image */}
            <div className="w-full aspect-[3/4] bg-stone-900 overflow-hidden border border-white/5">
              <img 
                src={product.gallery && product.gallery[activeImageIndex] ? product.gallery[activeImageIndex] : product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Gallery Thumbnails */}
            {product.gallery && product.gallery.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {product.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-20 flex-shrink-0 bg-stone-900 border overflow-hidden transition-all ${activeImageIndex === idx ? 'border-primary' : 'border-white/5 hover:border-white/20'}`}
                  >
                    <img src={img} alt={`${product.name} gallery ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="w-full md:w-1/2 p-6 md:pl-0 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              {/* Category */}
              <span className="text-[10px] text-primary font-bold tracking-[0.2em] uppercase">
                {product.categoryLabel || product.category}
              </span>

              {/* Title */}
              <h2 className="text-xl md:text-2xl font-normal tracking-[0.1em] uppercase text-white leading-tight">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-white">
                  {product.price.toLocaleString('ru-KZ')} ₸
                </span>
                {product.oldPrice && (
                  <span className="text-sm text-white/40 line-through">
                    {product.oldPrice.toLocaleString('ru-KZ')} ₸
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="h-[1px] bg-white/10 w-full"></div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-stone-400 font-light leading-relaxed">
                {product.description}
              </p>

              {/* Colors selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-[10px] text-white/50 tracking-wider uppercase font-bold">
                    {t('product.color', 'цвет')}: {selectedColor?.name}
                  </span>
                  <div className="flex gap-3">
                    {product.colors.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(color)}
                        className={`w-7 h-7 rounded-none border transition-all flex items-center justify-center p-0.5 ${selectedColor?.name === color.name ? 'border-primary scale-105' : 'border-white/10 hover:border-white/30'}`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        <span className="sr-only">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes selection */}
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[10px] text-white/50 tracking-wider uppercase font-bold">
                  {t('product.size', 'размер')}: {selectedSize}
                </span>
                <div className="flex gap-2">
                  {productSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`text-[10px] tracking-wider py-2 px-5 border transition-all rounded-none uppercase font-bold ${selectedSize === size ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/15 hover:border-white/30'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specs */}
              {product.specs && (
                <div className="flex flex-col gap-2 mt-3 text-[11px] text-stone-400">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-white/5 py-1">
                      <span className="uppercase text-[9px] tracking-wider text-white/40">{t(`product.specs.${key}`, key)}</span>
                      <span className="text-right text-stone-300">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="mt-8">
              <button
                onClick={handleAddToCartClick}
                className="w-full bg-primary hover:bg-[#FFE088] text-[#3c2f00] font-sans font-bold text-xs tracking-[0.2em] py-4 text-center uppercase transition-all rounded-none"
              >
                {t('product.add_to_cart', 'добавить в корзину')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
