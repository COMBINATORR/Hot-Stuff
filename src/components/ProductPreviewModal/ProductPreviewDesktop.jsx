import React from 'react';
import { motion } from 'framer-motion';
import ResponsiveImage from '../ResponsiveImage';
import ProductPreviewAccordions from './ProductPreviewAccordions';
import ProductPreviewSwatches from './ProductPreviewSwatches';
import ProductPreviewActions from './ProductPreviewActions';

export default function ProductPreviewDesktop({
  product,
  isFavorited,
  setIsFavorited,
  onClose,
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
  onImageClick,
  t
}) {
  return (
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
            <div 
              onClick={onImageClick}
              className="flex-1 bg-white flex items-center justify-center p-8 cursor-zoom-in group/img relative overflow-hidden"
            >
              <ResponsiveImage
                src={galleryImages[selectedImageIndex] || product.image}
                alt={product.name}
                className="max-w-full max-h-full object-contain transition-all duration-300 group-hover/img:scale-[1.02]"
              />
              <div className="absolute bottom-4 right-4 opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white p-2 rounded-full flex items-center justify-center shadow-lg z-10">
                <span className="material-symbols-outlined text-[20px]">zoom_in</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Информация о товаре — скроллится */}
          <div className="flex flex-col h-full border-l border-gray-100" style={{ width: '50%' }}>

            {/* Header Controls — крестик и сердечко */}
            <div className="flex justify-end flex-none border-b border-gray-100">
              <div className="relative group/heart flex-none">
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="flex items-center justify-center w-12 h-12 bg-white text-black hover:text-primary transition-all border-l border-gray-100 focus-visible:outline-none focus-visible:text-primary active:scale-90 relative z-10"
                  aria-label={isFavorited ? t('product.remove_from_favorites', 'Убрать из избранного') : t('product.add_to_favorites', 'В избранное')}
                >
                  <span 
                    className={`material-symbols-outlined text-[20px] transition-all duration-300 ${isFavorited ? 'text-red-500' : ''}`}
                    style={isFavorited ? { fontVariationSettings: "'FILL' 1, 'wght' 200" } : {}}
                  >
                    {isFavorited ? 'favorite' : 'favorite_border'}
                  </span>
                </button>

                {/* Elegant Tooltip with slide-left fade animation */}
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2.5 py-1.5 bg-black text-white text-[9px] tracking-widest uppercase font-bold rounded-none opacity-0 translate-x-1 pointer-events-none group-hover/heart:opacity-100 group-hover/heart:translate-x-0 transition-all duration-300 whitespace-nowrap z-[99] shadow-md leading-none flex items-center">
                  <span>{isFavorited ? t('product.remove_from_favorites_short', 'УБРАТЬ') : t('product.add_to_favorites_short', 'В ИЗБРАННОЕ')}</span>
                  {/* Micro-arrow */}
                  <div className="w-2 h-2 bg-black rotate-45 absolute -right-1 top-1/2 -translate-y-1/2 -z-10" />
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-12 h-12 bg-white text-black hover:bg-black hover:text-white transition-all border-l border-gray-100 focus-visible:outline-none focus-visible:bg-black focus-visible:text-white active:scale-90"
                aria-label={t('common.close', 'Закрыть')}
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
                  {t('menu.' + (product.categoryLabel || 'СЕКС-ИГРУШКИ').toLowerCase(), product.categoryLabel || 'СЕКС-ИГРУШКИ')}
                </span>
              </div>

              {/* Discount Badge */}
              <div className="mt-4 flex">
                <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-none leading-none">
                  -{discountPercent}%
                </span>
              </div>

              {/* Pricing */}
              <div className="mt-4 flex flex-col">
                <span className="text-gray-400 line-through text-[12px] font-sans">
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
                variant="desktop"
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

              {/* Action Buttons */}
              <ProductPreviewActions
                handleNavigateToProduct={handleNavigateToProduct}
                handleAdd={handleAdd}
                variant="desktop"
              />

              {/* Accordions */}
              <ProductPreviewAccordions
                product={product}
                expandedSection={expandedSection}
                toggleSection={toggleSection}
                variant="desktop"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
