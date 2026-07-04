import ResponsiveImage from '../ResponsiveImage';

export default function ProductHero({
  t,
  i18n,
  product,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  sizesList,
  qty,
  setQty,
  handleAdd,
  timeLeft,
  formatTime,
  activeImageIndex,
  setActiveImageIndex,
  handleTouchStart,
  handleTouchEnd,
  displayMode,
  setDisplayMode,
  deviceLength,
  favorites = [],
  setFavorites
}) {
  const isFavorite = favorites?.some(fav => fav.id === product?.id);
  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!setFavorites || !product) return;
    if (isFavorite) {
      setFavorites(prev => prev.filter(fav => fav.id !== product.id));
    } else {
      setFavorites(prev => [...prev, product]);
    }
  };
  return (
    <>
    {/* Hero Section */}
        <section className="min-h-[700px] md:min-h-[850px] flex flex-col md:flex-row max-w-container-max mx-auto relative mt-4">
          <div className="flex-1 flex flex-col justify-center px-margin-mobile md:px-margin-desktop py-12 md:py-20 z-10 text-left">
            {product.isNew && (
              <span className="text-[10px] font-black tracking-[0.25em] text-primary uppercase mb-3">{t('product.new_arrival', 'NEW ARRIVAL')}</span>
            )}
            <h1 className="font-sans font-black text-[36px] md:text-[56px] lg:text-[64px] text-white leading-tight uppercase tracking-tight mb-4">
              {product.name}
            </h1>
            <p className="font-sans font-bold text-xs tracking-[0.15em] text-outline uppercase mb-6">{t('menu.' + product.categoryLabel.toLowerCase(), product.categoryLabel)}</p>

            {/* Price Block */}
            <div className="flex items-baseline gap-4 mb-10">
              {product.oldPrice ? (
                <>
                  <span className="font-sans font-bold text-2xl text-primary">{product.price.toLocaleString('ru-KZ')} ₸</span>
                  <span className="font-sans text-sm text-outline line-through">{product.oldPrice.toLocaleString('ru-KZ')} ₸</span>
                  <span className="bg-primary text-on-primary text-[9px] font-black px-2 py-1 uppercase tracking-wider leading-none">
                    {t('product.save', { amount: (product.oldPrice - product.price).toLocaleString('ru-KZ') })}
                  </span>
                </>
              ) : (
                <span className="font-sans font-bold text-2xl text-white">{product.price.toLocaleString('ru-KZ')} ₸</span>
              )}
            </div>

            <p className="font-sans text-sm text-on-surface-variant leading-relaxed max-w-lg mb-10">
              {t('product.tech_defaults.' + product.id, product.description)}
            </p>

            {/* Colors Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-10">
                <span className="font-sans font-bold text-[10px] tracking-widest text-outline block mb-4 uppercase">{t('product.color_label', { color: selectedColor })}</span>
                <div className="flex gap-5">
                  {product.colors.map(color => (
                    <button
                      key={color.name}
                      aria-label={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`relative w-9 h-9 rounded-full border-2 transition-all ring-1 ring-offset-2 ring-offset-black after:absolute after:-inset-1.5 after:content-[''] ${
                        selectedColor === color.name
                          ? 'border-white ring-primary'
                          : 'border-transparent ring-transparent'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    ></button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes Selection */}
            {sizesList && sizesList.length > 0 && (
              <div className="mb-10">
                <span className="font-sans font-bold text-[10px] tracking-widest text-outline block mb-4 uppercase">
                  {t('product.size', 'размер')}: {selectedSize}
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {sizesList.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`text-[11px] tracking-widest py-3 px-6 border transition-all rounded-none uppercase font-bold focus-visible:outline-none ${
                        selectedSize === size
                          ? 'bg-primary text-black border-primary'
                          : 'bg-transparent text-white border-white/15 hover:border-white/40'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center border border-white/10 h-[52px]">
                <button
                  className="px-4 text-on-surface-variant hover:text-white transition-colors text-sm font-bold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-[2px]"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  aria-label={t('common.decrease', 'Уменьшить')}
                >−</button>
                <span className="px-5 text-xs font-bold text-center min-w-[2.5rem] select-none">{qty}</span>
                <button
                  className="px-4 text-on-surface-variant hover:text-white transition-colors text-sm font-bold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-[2px]"
                  onClick={() => setQty(q => q + 1)}
                  aria-label={t('common.increase', 'Увеличить')}
                >+</button>
              </div>

              <button
                onClick={handleAdd}
                className="bg-primary text-on-primary font-sans font-black text-xs tracking-[0.2em] uppercase h-[52px] px-12 hover:bg-[#ffe088] transition-colors duration-300 flex-1 md:flex-none"
              >
                {t('product.add_to_cart')}
              </button>

              <div className="relative group/heart flex-none h-[52px]">
                <button
                  onClick={toggleFavorite}
                  className="flex items-center justify-center w-[52px] h-[52px] bg-transparent hover:bg-white/5 text-white hover:text-primary transition-all border border-white/10 focus-visible:outline-none focus-visible:border-primary active:scale-95 relative z-10"
                  aria-label={isFavorite ? t('product.remove_from_favorites', 'Убрать из избранного') : t('product.add_to_favorites', 'В избранное')}
                >
                  <span 
                    className={`material-symbols-outlined text-[20px] transition-all duration-300 ${isFavorite ? 'text-red-500' : ''}`}
                    style={isFavorite ? { fontVariationSettings: "'FILL' 1, 'wght' 200" } : {}}
                  >
                    {isFavorite ? 'favorite' : 'favorite_border'}
                  </span>
                </button>

                {/* Elegant Tooltip with slide-up fade animation */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-2.5 py-1.5 bg-black text-white text-[9px] tracking-widest uppercase font-bold rounded-none opacity-0 translate-y-1 pointer-events-none group-hover/heart:opacity-100 group-hover/heart:translate-y-0 transition-all duration-300 whitespace-nowrap z-[99] shadow-md leading-none flex flex-col items-center">
                  <span>{isFavorite ? t('product.remove_from_favorites_short', 'УБРАТЬ') : t('product.add_to_favorites_short', 'В ИЗБРАННОЕ')}</span>
                  {/* Micro-arrow */}
                  <div className="w-2 h-2 bg-black rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 -z-10" />
                </div>
              </div>
            </div>

            {/* Kaspi Red Installments */}
            <div className="w-full flex items-center gap-3 bg-neutral-900/40 p-4 border border-white/5 rounded-none mb-4">
              <div className="flex-none bg-[#E11D48] text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-none uppercase font-sans">Kaspi Red</div>
              <div className="text-left font-sans text-xs text-white/90">
                {t('product.installment', { amount: Math.round(product.price / 3).toLocaleString('ru-KZ') })}
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="w-full flex items-center gap-3 bg-primary/10 p-4 border border-primary/20 rounded-none mb-6">
              <span className="material-symbols-outlined text-primary text-[18px]">alarm</span>
              <div className="text-left font-sans text-xs text-white/95 text-balance">
                {t('product.order_countdown', { time: formatTime(timeLeft) })}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="w-full grid grid-cols-3 gap-2.5 border-t border-white/10 pt-6 mt-2">
              <div className="flex flex-col items-center text-center p-2.5 rounded-none bg-neutral-900/20 border border-white/5">
                <span className="material-symbols-outlined text-[18px] text-primary mb-1">visibility_off</span>
                <span className="text-[8px] font-black tracking-wider text-white uppercase">{t('product.anon')}</span>
              </div>
              <div className="flex flex-col items-center text-center p-2.5 rounded-none bg-neutral-900/20 border border-white/5">
                <span className="material-symbols-outlined text-[18px] text-primary mb-1">verified_user</span>
                <span className="text-[8px] font-black tracking-wider text-white uppercase">{t('product.warranty_badge')}</span>
              </div>
              <div className="flex flex-col items-center text-center p-2.5 rounded-none bg-neutral-900/20 border border-white/5">
                <span className="material-symbols-outlined text-[18px] text-primary mb-1">shield</span>
                <span className="text-[8px] font-black tracking-wider text-white uppercase">{t('product.safe')}</span>
              </div>
            </div>
          </div>

          {/* Product image container with Gallery */}
          <div className="flex-1 relative min-h-[400px] md:min-h-full flex flex-col md:flex-row items-center justify-center bg-surface-container-lowest p-6 md:p-12 gap-6">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background z-10 hidden md:block pointer-events-none"></div>

            {/* Gallery Thumbnails */}
            {product.gallery && product.gallery.length > 1 && (
              <div className="hidden md:flex md:flex-col gap-3 z-20 order-2 md:order-1">
                {product.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 md:w-20 md:h-20 bg-neutral-900 border transition-all duration-300 overflow-hidden flex items-center justify-center ${
                      activeImageIndex === idx ? 'border-primary scale-105' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Hero Image */}
            <div className="w-full flex-1 max-h-[500px] md:max-h-[600px] flex flex-col items-center justify-center z-10 order-1 md:order-2">

              {displayMode === 'scale' ? (
                <div className="w-full flex flex-col items-center justify-center py-6 px-4 bg-neutral-950/40 rounded-none border border-white/5 font-sans text-left min-h-[350px]">
                  <p className="text-[10px] font-black tracking-widest text-primary uppercase mb-6 text-center">{t('product.size_comparison')}</p>

                  <div className="flex items-end justify-center gap-8 md:gap-12 w-full h-56 pb-4">
                    {/* Palm */}
                    <div className="flex flex-col items-center gap-2 h-full justify-end">
                      <div className="relative w-12 bg-neutral-900 border border-white/10 flex items-center justify-center text-2xl transition-all" style={{ height: `${18 * 8}px` }}>
                        ✋
                        <span className="absolute -top-6 text-[10px] font-bold text-white/70">~18 {i18n.language === 'en' ? 'cm' : 'см'}</span>
                      </div>
                      <span className="text-[8px] font-bold tracking-wider text-outline uppercase text-center">{t('product.palm')}</span>
                    </div>

                    {/* Product Device */}
                    <div className="flex flex-col items-center gap-2 h-full justify-end">
                      <div className="relative w-16 bg-primary/20 border-2 border-primary flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(242,202,80,0.2)]" style={{ height: `${deviceLength * 8}px` }}>
                        {product.emoji || '🌸'}
                        <span className="absolute -top-6 text-[11px] font-black text-primary">{deviceLength} {i18n.language === 'en' ? 'cm' : 'см'}</span>
                      </div>
                      <span className="text-[9px] font-black tracking-wider text-white uppercase text-center truncate max-w-[80px]">{product.name}</span>
                    </div>

                    {/* iPhone 15 */}
                    <div className="flex flex-col items-center gap-2 h-full justify-end">
                      <div className="relative w-12 bg-neutral-900 border border-white/10 flex items-center justify-center text-xl" style={{ height: `${14.6 * 8}px` }}>
                        📱
                        <span className="absolute -top-6 text-[10px] font-bold text-white/70">14.6 {i18n.language === 'en' ? 'cm' : 'см'}</span>
                      </div>
                      <span className="text-[8px] font-bold tracking-wider text-outline uppercase text-center">iPhone 15</span>
                    </div>
                  </div>

                  <p className="text-[9px] text-outline text-center leading-relaxed mt-4 max-w-xs text-balance">
                    {t('product.size_note')}
                  </p>
                </div>
              ) : (
                <div
                  className="w-full flex items-center justify-center"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <ResponsiveImage
                    src={product.gallery && product.gallery[activeImageIndex] ? product.gallery[activeImageIndex] : product.image}
                    alt={`${product.name} product shot`}
                    className="w-full h-full max-h-[400px] md:max-h-[500px] object-contain transition-all duration-500 hover:scale-105 select-none"
                    loading="eager"
                  />
                </div>
              )}

              {/* Mobile Swipe Indicator (Pagination Dots) */}
              {displayMode === 'studio' && product.gallery && product.gallery.length > 1 && (
                <div className="flex justify-center gap-2 mt-5 md:hidden z-20">
                  {product.gallery.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 border-none outline-none focus:outline-none p-0 cursor-pointer ${
                        activeImageIndex === idx ? 'bg-primary w-4' : 'bg-white/25 hover:bg-white/40'
                      }`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Toggle Display Mode */}
              <div className="flex gap-4 mt-6 z-20">
                <button
                  onClick={() => setDisplayMode('studio')}
                  className={`px-4 py-1.5 font-sans font-bold text-[9px] tracking-widest uppercase border transition-all rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary active:scale-95 ${
                    displayMode === 'studio'
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-white/50 border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {t('product.studio_view')}
                </button>
                <button
                  onClick={() => setDisplayMode('scale')}
                  className={`px-4 py-1.5 font-sans font-bold text-[9px] tracking-widest uppercase border transition-all rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary active:scale-95 ${
                    displayMode === 'scale'
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-white/50 border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {t('product.size_view')}
                </button>
              </div>
            </div>
          </div>
        </section>


    </>
  );
}
