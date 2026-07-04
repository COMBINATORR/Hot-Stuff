import React from 'react';
import { motion } from 'framer-motion';
import ResponsiveImage from '../ResponsiveImage';
import ProductPreviewAccordions from './ProductPreviewAccordions';
import ProductPreviewSwatches from './ProductPreviewSwatches';
import ProductPreviewActions from './ProductPreviewActions';

export default function ProductPreviewMobile({
  product,
  isFavorited,
  setIsFavorited,
  onClose,
  mobileModalRef,
  galleryImages,
  selectedImageIndex,
  setSelectedImageIndex,
  discountPercent,
  oldPriceValue,
  savedAmount,
  colorsList,
  selectedColor,
  setSelectedColor,
  activeColorName,
  selectedSize,
  setSelectedSize,
  sizesList,
  handleNavigateToProduct,
  handleAdd,
  expandedSection,
  toggleSection,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  t
}) {
  return (
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
          className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-black border border-gray-100 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary active:scale-90 transition-all"
          aria-label={t('product.add_to_favorites', 'В избранное')}
        >
          <span className={`material-symbols-outlined text-[18px] ${isFavorited ? 'fill-current text-primary' : ''}`}>
            {isFavorited ? 'favorite' : 'favorite_border'}
          </span>
        </button>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-black border border-gray-100 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary active:scale-90 transition-all"
          aria-label={t('common.close', 'Закрыть')}
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

      {/* Content Info */}
      <div className="flex-1 bg-white px-5 pt-7 pb-10 flex flex-col">
        {/* Title */}
        <div>
          <span className="text-[9px] tracking-[0.2em] font-bold text-gray-400 uppercase mb-2 block">
            {t('menu.' + (product.categoryLabel || 'СЕКС-ИГРУШКИ').toLowerCase(), product.categoryLabel || 'СЕКС-ИГРУШКИ')}
          </span>
          <h2 className="text-[22px] font-medium tracking-[0.1em] font-display uppercase leading-tight text-black">
            {product.name}
          </h2>
        </div>

        {/* Discount Badge */}
        <div className="mt-3.5 flex">
          <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-none leading-none">
            -{discountPercent}%
          </span>
        </div>

        {/* Price block */}
        <div className="mt-5 flex flex-col">
          <span className="text-gray-400 line-through text-[11px] font-sans">
            {oldPriceValue.toLocaleString('ru-KZ')} ₸
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-primary font-bold text-[18px] font-sans">
              {product.price.toLocaleString('ru-KZ')} ₸
            </span>
            <span className="text-gray-500 text-[10px] font-sans">
              {t('product.save', { amount: savedAmount.toLocaleString('ru-KZ') })}
            </span>
          </div>
        </div>

        {/* Color Swatches */}
        <ProductPreviewSwatches
          colorsList={colorsList}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          activeColorName={activeColorName}
          variant="mobile"
        />

        {/* Sizes selection */}
        {sizesList && sizesList.length > 0 && (
          <div className="mt-6">
            <span className="font-sans font-bold text-[10px] tracking-widest text-gray-400 block mb-3 uppercase">
              {t('product.size', 'размер')}: {selectedSize}
            </span>
            <div className="flex flex-wrap gap-2.5">
              {sizesList.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`text-[10px] tracking-wider py-2 px-5 border transition-all rounded-none uppercase font-bold focus-visible:outline-none ${
                    selectedSize === size
                      ? 'bg-black text-white border-black'
                      : 'bg-transparent text-black border-gray-200 hover:border-black'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions Grid */}
        <ProductPreviewActions
          handleNavigateToProduct={handleNavigateToProduct}
          handleAdd={handleAdd}
          variant="mobile"
        />

        {/* Accordions */}
        <ProductPreviewAccordions
          product={product}
          expandedSection={expandedSection}
          toggleSection={toggleSection}
          variant="mobile"
        />
      </div>
    </motion.div>
  );
}
