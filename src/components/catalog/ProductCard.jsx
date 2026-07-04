import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage';

const ProductCard = memo(function ProductCard({ product, setSelectedPreviewProduct }) {
  const { t } = useTranslation();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);

  const colors = product.colors || [];
  const gallery = product.gallery || [];

  const activeImage = isHovered
    ? (gallery.length > 1 ? gallery[(selectedColorIndex + 1) % gallery.length] : product.image)
    : (gallery.length > 0 ? gallery[selectedColorIndex] : product.image);

  const handleTouchStart = (e) => setTouchStartX(e.targetTouches[0].clientX);
  const handleTouchEnd = (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    const total = gallery.length || 1;
    if (total <= 1 || Math.abs(diff) < 40) return;
    setSelectedColorIndex(prev =>
      diff > 0 ? (prev + 1) % total : (prev - 1 + total) % total
    );
  };

  return (
    <div
      className="relative group h-[400px] z-10 hover:z-20 text-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Border box — expands on hover */}
      <div className="absolute -inset-px border border-gray-200 bg-white transition-all duration-300 group-hover:-bottom-12 group-hover:border-black pointer-events-none" />

      {/* Hover bridge */}
      <div className="absolute top-full left-0 right-0 h-12 pointer-events-none group-hover:pointer-events-auto z-10" />

      {/* Card content */}
      <div className="relative h-full p-4 flex flex-col z-10">

        {/* Badges row */}
        <div className="flex justify-between items-start min-h-[18px]">
          <span>
            {product.isNew && (
              <span className="text-[9px] font-bold tracking-widest text-primary uppercase">NEW</span>
            )}
          </span>
          {product.discount && (
            <span className="bg-primary text-black text-[9px] font-bold px-2 py-0.5 leading-none">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* IMAGE — flex-1 so it fills space between badges and info */}
        <Link
          to={`/product/${product.id}`}
          className="flex-1 flex items-center justify-center select-none py-3"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <ResponsiveImage
            src={activeImage}
            alt={product.name}
            className="max-h-[200px] w-full object-contain group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* BOTTOM INFO */}
        <div className="mt-1 space-y-2">

          {/* Heart + Name + Category */}
          <div className="flex items-start gap-2">
            <button
              className="text-black hover:text-primary transition-colors focus:outline-none flex-none mt-0.5"
              aria-label={t('product.add_to_favorites', 'В избранное')}
            >
              <span className="material-symbols-outlined font-light text-[18px]">favorite_border</span>
            </button>
            <div className="flex-1 min-w-0">
              <Link
                to={`/product/${product.id}`}
                className="font-sans font-bold text-[11px] tracking-wide uppercase text-black leading-snug hover:text-primary transition-colors block"
              >
                {product.name}
              </Link>
              <p className="text-[10px] text-gray-400 font-sans mt-0.5 truncate">
                {t('menu.' + product.categoryLabel.toLowerCase(), product.categoryLabel)}
              </p>
            </div>
          </div>

          {/* Price + Color swatches */}
          <div className="flex items-center justify-between">
            <div className="font-sans">
              {product.oldPrice ? (
                <>
                  <p className="text-[10px] text-gray-400 line-through leading-none mb-0.5">
                    {product.oldPrice.toLocaleString('ru-KZ')} ₸
                  </p>
                  <p className="text-[13px] font-bold text-primary leading-none">
                    {product.price.toLocaleString('ru-KZ')} ₸
                  </p>
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    {t('product.save', { amount: (product.oldPrice - product.price).toLocaleString('ru-KZ') })}
                  </p>
                </>
              ) : (
                <p className="text-[13px] font-bold text-black leading-none">
                  {product.price.toLocaleString('ru-KZ')} ₸
                </p>
              )}
            </div>

            {colors.length > 0 && (
              <div className="flex items-center gap-1.5 flex-none">
                {colors.map((c, idx) => (
                  <button
                    key={c.name}
                    aria-label={c.name}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedColorIndex(idx); }}
                    className={`relative w-[14px] h-[14px] rounded-full transition-all ${
                      selectedColorIndex === idx
                        ? 'ring-1 ring-offset-1 ring-gray-500 scale-110'
                        : 'hover:scale-110'
                    }`}
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Hover preview button */}
      <div className="absolute bottom-0 group-hover:-bottom-12 left-[-1px] right-[-1px] opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none group-hover:pointer-events-auto">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedPreviewProduct(product); }}
          className="w-full bg-black text-white font-sans font-bold text-[9px] tracking-[0.2em] py-3.5 uppercase hover:bg-gray-900 transition-colors"
        >
          {t('product.preview', 'ПРЕДПРОСМОТР')}
        </button>
      </div>
    </div>
  );
});

export default ProductCard;
