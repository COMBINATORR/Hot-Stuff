import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage';


const ProductBadges = memo(({ product, t }) => (
  <div className="flex justify-between items-start w-full">
    <span>
      {product.isNew && (
        <span className="text-[9px] font-bold tracking-widest text-primary uppercase">{t('product.is_new', 'NEW')}</span>
      )}
    </span>
    {product.discount ? (
      <span className="bg-primary text-on-primary text-[9px] font-bold px-2 py-0.5 rounded-none leading-none">
        -{product.discount}%
      </span>
    ) : <div />}
  </div>
));

const ProductImage = memo(({ product, activeImage, gallery, selectedColorIndex, handleTouchStart, handleTouchEnd }) => (
  <div className="flex-1 flex items-center justify-center py-4 relative my-2 bg-gray-50/50">
    <Link
      to={`/product/${product.id}`}
      className="w-full h-full flex flex-col items-center justify-center select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <ResponsiveImage
        src={activeImage}
        alt={product.name}
        className="max-h-[160px] object-contain group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      {gallery.length > 1 && (
        <div className="w-full max-w-[80px] h-[2px] bg-gray-200 mt-4 relative overflow-hidden md:hidden">
          <div
            className="absolute top-0 left-0 h-full bg-black transition-all duration-300"
            style={{ width: `${((selectedColorIndex + 1) / gallery.length) * 100}%` }}
          />
        </div>
      )}
    </Link>
  </div>
));

const ProductInfo = memo(({ product, colors, selectedColorIndex, setSelectedColorIndex, t }) => (
  <div className="mt-2">
    {/* Heart Favorite */}
    <button className="text-black hover:text-primary transition-colors mb-2 block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-none">
      <span className="material-symbols-outlined font-light text-[20px]">favorite_border</span>
    </button>

    <div className="flex justify-between items-start gap-2">
      <div className="flex-1 min-w-0">
        <Link to={`/product/${product.id}`} className="font-sans font-bold text-[10px] tracking-wider uppercase text-black leading-tight truncate hover:text-primary transition-colors block">
          {product.name}
        </Link>
        <p className="text-[8px] text-gray-500 font-sans mt-0.5 truncate">
          {t('menu.' + product.categoryLabel.toLowerCase(), product.categoryLabel)}
        </p>
      </div>

      {/* Color dots swatches (Interactive!) */}
      <div className="flex gap-2.5 mt-0.5 flex-none z-20">
        {colors.map((c, idx) => (
          <button
            key={c.name}
            aria-label={c.name}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedColorIndex(idx);
            }}
            className={`relative w-2.5 h-2.5 rounded-full border transition-all after:absolute after:-inset-3 after:content-[''] ${
              selectedColorIndex === idx
                ? 'border-black scale-110 ring-1 ring-black/20'
                : 'border-black/10 hover:border-black/30'
            }`}
            style={{ background: c.hex }}
          />
        ))}
      </div>
    </div>

    {/* Pricing block */}
    <div className="mt-3 flex flex-col font-sans">
      {product.oldPrice ? (
        <>
          <span className="text-[9px] text-gray-400 line-through">
            {product.oldPrice.toLocaleString('ru-KZ')} ₸
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-primary font-bold text-[12px]">
              {product.price.toLocaleString('ru-KZ')} ₸
            </span>
            <span className="text-gray-500 text-[8px]">
              {t('product.save', { amount: (product.oldPrice - product.price).toLocaleString('ru-KZ') })}
            </span>
          </div>
        </>
      ) : (
        <span className="text-black font-bold text-[12px]">
          {product.price.toLocaleString('ru-KZ')} ₸
        </span>
      )}
    </div>

  </div>
));

const ProductPreviewButton = memo(({ product, setSelectedPreviewProduct, t }) => (
  <div className="absolute bottom-0 group-hover:-bottom-12 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none group-hover:pointer-events-auto">
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedPreviewProduct(product);
      }}
      className="w-full bg-black text-white text-center font-sans font-bold text-[9px] tracking-[0.2em] py-3 uppercase hover:bg-gray-800 transition-colors shadow-md border-none"
    >
      {t('product.preview', 'ПРЕДПРОСМОТР')}
    </button>
  </div>
));

// ProductCard Component to manage hover and color swatch state
const ProductCard = memo(function ProductCard({ product, setSelectedPreviewProduct }) {
  const { t } = useTranslation();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);

  const colors = product.colors || [];
  const gallery = product.gallery || [];

  // Determine active display image
  // 1. If hovered, show alternative view: (selectedColorIndex + 1) % gallery.length
  // 2. Otherwise, show gallery[selectedColorIndex] or product.image
  const activeImage = isHovered
    ? (gallery.length > 1 ? gallery[(selectedColorIndex + 1) % gallery.length] : product.image)
    : (gallery.length > 0 ? gallery[selectedColorIndex] : product.image);

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;
    const totalImages = gallery.length || 1;
    if (totalImages <= 1) return;

    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        // Swipe left, show next
        setSelectedColorIndex((prev) => (prev + 1) % totalImages);
      } else {
        // Swipe right, show prev
        setSelectedColorIndex((prev) => (prev - 1 + totalImages) % totalImages);
      }
    }
  };

  return (
    <div
      className="relative group h-[400px] z-10 hover:z-20 text-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* The expanding border box */}
      <div className="absolute -inset-px border border-black bg-white transition-all duration-300 group-hover:-bottom-16 pointer-events-none" />

      {/* Transparent hover bridge to prevent losing hover when moving cursor down */}
      <div className="absolute top-full left-0 right-0 h-16 bg-transparent opacity-0 pointer-events-none group-hover:pointer-events-auto z-10" />

      {/* The card content */}
      <div className="relative h-full p-4 flex flex-col justify-between z-10">
        {/* Top Badges */}
        <ProductBadges product={product} t={t} />

        {/* Center Image */}
        <ProductImage
          product={product}
          activeImage={activeImage}
          gallery={gallery}
          selectedColorIndex={selectedColorIndex}
          handleTouchStart={handleTouchStart}
          handleTouchEnd={handleTouchEnd}
        />

        {/* Info & Meta */}
        <ProductInfo
          product={product}
          colors={colors}
          selectedColorIndex={selectedColorIndex}
          setSelectedColorIndex={setSelectedColorIndex}
          t={t}
        />

      </div>

      {/* Hover-revealed button */}
      <ProductPreviewButton
        product={product}
        setSelectedPreviewProduct={setSelectedPreviewProduct}
        t={t}
      />

    </div>
  );
});

export default ProductCard;
