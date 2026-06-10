import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ALL_PRODUCTS } from '../data/products';
import ResponsiveImage from '../components/ResponsiveImage';

export default function ProductPage({ onAddToCart }) {
  const { id } = useParams();
  
  // Find product by id from URL, default to first product if not found
  const product = useMemo(() => {
    const found = ALL_PRODUCTS.find(p => p.id === parseInt(id));
    return found || ALL_PRODUCTS[0];
  }, [id]);

  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Reset states when active product changes
  useEffect(() => {
    if (product && product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0].name);
    }
    setQty(1);
    setActiveImageIndex(0);
  }, [product]);

  const handleAdd = () => {
    if (onAddToCart && product) {
      onAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        emoji: product.emoji || '🌸',
        variant: selectedColor,
        qty: qty,
        image: (product.gallery && product.gallery[activeImageIndex]) || product.image
      });
    }
  };

  const handleCrossSellAdd = (name, price) => {
    if (onAddToCart) {
      onAddToCart({
        id: name === 'Personal Moisturizer' ? 101 : name === 'Cleaning Spray' ? 102 : 103,
        name: name,
        price: price,
        emoji: name === 'Personal Moisturizer' ? '🧴' : name === 'Cleaning Spray' ? '🧼' : '🕯️',
        variant: 'Default',
        qty: 1
      });
    }
  };

  if (!product) return null;

  const getTechnologyDescription = (prod) => {
    if (prod.features.includes('cruise_control')) {
      return 'Испытайте вершину звуковой волновой стимуляции. Запатентованная технология Cruise Control™ автоматически увеличивает интенсивность импульсов при сильном нажатии девайса к телу, гарантируя плавный и непрерывный пик удовольствия без падения мощности.';
    }
    if (prod.features.includes('wave_motion')) {
      return 'Революционная технология WaveMotion™ имитирует ласкающие волнообразные движения пальцев внутри тела, создавая глубокое и невероятно реалистичное чувство наполненности в сочетании с нежным ритмом внешнего лепестка.';
    }
    if (prod.features.includes('sense_motion')) {
      return 'Инновационная беспроводная технология SenseMotion™ позволяет управлять интенсивностью вибрации взмахом руки. Ваши движения и жесты пультом напрямую контролируют глубину и силу каждого импульса.';
    }
    if (prod.features.includes('dual_stimulation')) {
      return 'Сбалансированная двойная стимуляция обеспечивает одновременный оргазм благодаря глубокому точечному массажу зоны G и нежным, интенсивным ласкам клитора. Идеально распределенная мощность моторов.';
    }
    return prod.description;
  };

  return (
    <div className="bg-background text-on-surface font-sans antialiased overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      <main className="pt-20">
        
        {/* Breadcrumbs */}
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-8">
          <nav className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-outline">
            <Link to="/" className="hover:text-white transition-colors">Главная</Link>
            <span>/</span>
            <Link to="/catalog" className="hover:text-white transition-colors">Каталог</Link>
            <span>/</span>
            <span className="text-white">{product.name}</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="min-h-[700px] md:min-h-[850px] flex flex-col md:flex-row max-w-container-max mx-auto relative mt-4">
          <div className="flex-1 flex flex-col justify-center px-margin-mobile md:px-margin-desktop py-12 md:py-20 z-10 text-left">
            {product.isNew && (
              <span className="text-[10px] font-black tracking-[0.25em] text-primary uppercase mb-3">NEW ARRIVAL</span>
            )}
            <h1 className="font-sans font-black text-[36px] md:text-[56px] lg:text-[64px] text-white leading-tight uppercase tracking-tight mb-4">
              {product.name}
            </h1>
            <p className="font-sans font-bold text-xs tracking-[0.15em] text-outline uppercase mb-6">{product.categoryLabel}</p>
            
            {/* Price Block */}
            <div className="flex items-baseline gap-4 mb-10">
              {product.oldPrice ? (
                <>
                  <span className="font-sans font-bold text-2xl text-primary">{product.price.toLocaleString('ru-KZ')} ₸</span>
                  <span className="font-sans text-sm text-outline line-through">{product.oldPrice.toLocaleString('ru-KZ')} ₸</span>
                  <span className="bg-[#FF5C3F] text-black text-[9px] font-black px-2 py-1 uppercase tracking-wider leading-none">
                    Сэкономить {(product.oldPrice - product.price).toLocaleString('ru-KZ')} ₸
                  </span>
                </>
              ) : (
                <span className="font-sans font-bold text-2xl text-white">{product.price.toLocaleString('ru-KZ')} ₸</span>
              )}
            </div>

            <p className="font-sans text-sm text-on-surface-variant leading-relaxed max-w-lg mb-10">
              {product.description}
            </p>

            {/* Colors Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-10">
                <span className="font-sans font-bold text-[10px] tracking-widest text-outline block mb-4 uppercase">Цвет: {selectedColor}</span>
                <div className="flex gap-4">
                  {product.colors.map(color => (
                    <button
                      key={color.name}
                      aria-label={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ring-1 ring-offset-2 ring-offset-black ${
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
            
            {/* Quantity and Add to Cart */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center border border-white/10 h-[52px]">
                <button
                  className="px-4 text-on-surface-variant hover:text-white transition-colors text-sm font-bold"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                >−</button>
                <span className="px-5 text-xs font-bold text-center min-w-[2.5rem] select-none">{qty}</span>
                <button
                  className="px-4 text-on-surface-variant hover:text-white transition-colors text-sm font-bold"
                  onClick={() => setQty(q => q + 1)}
                >+</button>
              </div>
              
              <button 
                onClick={handleAdd}
                className="bg-primary text-on-primary font-sans font-black text-xs tracking-[0.2em] uppercase h-[52px] px-12 hover:bg-[#ffe088] transition-colors duration-300 flex-1 md:flex-none"
              >
                В КОРЗИНУ
              </button>
            </div>
          </div>

          {/* Product image container with Gallery */}
          <div className="flex-1 relative min-h-[400px] md:min-h-full flex flex-col md:flex-row items-center justify-center bg-surface-container-lowest p-6 md:p-12 gap-6">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background z-10 hidden md:block pointer-events-none"></div>
            
            {/* Gallery Thumbnails */}
            {product.gallery && product.gallery.length > 1 && (
              <div className="flex md:flex-col gap-3 z-20 order-2 md:order-1">
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
            <div className="w-full flex-1 max-h-[500px] md:max-h-[600px] flex items-center justify-center z-10 order-1 md:order-2">
              <ResponsiveImage 
                src={product.gallery && product.gallery[activeImageIndex] ? product.gallery[activeImageIndex] : product.image} 
                alt={`${product.name} product shot`} 
                className="w-full h-full max-h-[400px] md:max-h-[500px] object-contain transition-all duration-500 hover:scale-105" 
                loading="eager"
              />
            </div>
          </div>
        </section>

        {/* The Ritual Section */}
        <section className="min-h-[500px] md:min-h-[600px] flex flex-col md:flex-row max-w-container-max mx-auto mt-24">
          <div className="flex-1 flex flex-col justify-center px-margin-mobile md:px-margin-desktop py-16 order-2 md:order-1 bg-surface-container-low text-left">
            <h2 className="font-sans font-black text-[22px] md:text-[30px] tracking-[0.15em] text-white mb-6 uppercase">МАГИЯ ТЕХНОЛОГИЙ</h2>
            <p className="font-sans text-sm md:text-base text-on-surface-variant max-w-lg leading-relaxed mb-6">
              {getTechnologyDescription(product)}
            </p>
            <div className="w-16 h-[2px] bg-primary mt-4"></div>
          </div>
          <div className="flex-1 relative min-h-[350px] md:min-h-full order-1 md:order-2">
            <img 
              alt="Macro texture of product" 
              className="absolute inset-0 w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm0netM0VEG4-KSXkwu2BgS1iXKGqAVsXjR0pG2uuNzv_s9-dxVvFRmdA1NZntDyit89lBQFNQCUlNGVAWWj-0Qxc7dy2aocCcHbDpbREYDw3Torhhx-NJOfEXJxW-b8xrCK3j36ajbHAFrUFxNkXCNd1uqhjHEjczESxjJviya9XE4U93F40tQH0oCmZyWEdudNk-hveqGOQkwTNRKt8q0x--mZVu6nSs2RMz5EhoKcehP4s7CIoNulqiGKuSH8NQ8YNdmfRdJSA"
              loading="lazy"
            />
          </div>
        </section>

        {/* Features Icons */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto border-b border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-4xl text-primary mb-6 font-light">water_drop</span>
              <h3 className="font-sans font-bold text-xs tracking-widest text-white uppercase mb-2">100% ВОДОНЕПРОНИЦАЕМОСТЬ</h3>
              <p className="font-sans text-xs text-on-surface-variant max-w-xs leading-relaxed">Полностью герметичный корпус подходит для использования в ванне или душе и легко очищается.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-4xl text-primary mb-6 font-light">spa</span>
              <h3 className="font-sans font-bold text-xs tracking-widest text-white uppercase mb-2">МЕДИЦИНСКИЙ СИЛИКОН</h3>
              <p className="font-sans text-xs text-on-surface-variant max-w-xs leading-relaxed">Сверхгладкий, гипоаллергенный и безопасный для тела премиум-силикон премиального качества.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-4xl text-primary mb-6 font-light">battery_charging_full</span>
              <h3 className="font-sans font-bold text-xs tracking-widest text-white uppercase mb-2">ЗАРЯДКА ОТ USB</h3>
              <p className="font-sans text-xs text-on-surface-variant max-w-xs leading-relaxed">Долговечный встроенный аккумулятор для длительных и беспрерывных сессий удовольствия.</p>
            </div>
          </div>
        </section>

        {/* Technical Specs */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto bg-black text-left">
          <h2 className="font-sans font-black text-[22px] md:text-[30px] tracking-[0.15em] text-center text-white mb-16 uppercase">Технические Характеристики</h2>
          <div className="max-w-3xl mx-auto border-t border-white/10 font-sans text-sm">
            <div className="flex flex-col sm:flex-row py-6 border-b border-white/10">
              <div className="w-full sm:w-1/3 font-bold text-outline uppercase tracking-wider mb-2 sm:mb-0">Материал</div>
              <div className="w-full sm:w-2/3 text-white">{product.specs?.material || 'Безопасный медицинский силикон, ABS-пластик'}</div>
            </div>
            <div className="flex flex-col sm:flex-row py-6 border-b border-white/10">
              <div className="w-full sm:w-1/3 font-bold text-outline uppercase tracking-wider mb-2 sm:mb-0">Время работы</div>
              <div className="w-full sm:w-2/3 text-white">{product.specs?.runtime || 'До 2 часов непрерывного использования'}</div>
            </div>
            <div className="flex flex-col sm:flex-row py-6 border-b border-white/10">
              <div className="w-full sm:w-1/3 font-bold text-outline uppercase tracking-wider mb-2 sm:mb-0">Режимы стимуляции</div>
              <div className="w-full sm:w-2/3 text-white">{product.specs?.modes || 'Множество настраиваемых паттернов'}</div>
            </div>
            <div className="flex flex-col sm:flex-row py-6 border-b border-white/10">
              <div className="w-full sm:w-1/3 font-bold text-outline uppercase tracking-wider mb-2 sm:mb-0">Размеры</div>
              <div className="w-full sm:w-2/3 text-white">{product.specs?.dimensions || 'Эргономичный дизайн'}</div>
            </div>
          </div>
        </section>

        {/* Lifestyle Section */}
        <section className="relative h-[600px] md:h-[750px] w-full flex items-center justify-center my-16">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <img 
            alt="Lifestyle shot on dark silk sheets" 
            className="absolute inset-0 w-full h-full object-cover z-0" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEHeDiealyOW57R_zYXMkviBV4EUx0LiFb9N60NHhOB59AwTAMqQwQPDBj6sklNyCawZIK0GnB2JDJ_JUv9K4XL2yhlOP61fvYvj_nzBXEULPcng9i60iYDuVytTIVrNzwCmDJ0Oe1aLa-TCzE2kAv_ju7wK-hIq_rX8uGjTr8b6VIqSk86LEeDIQ1eRiDRgCyEPJx9KufEGPnHWPyoJPZz-D_lMxNcGiL6xHSiQ2b47ZxlcC3SNtc7YrWxEcJG7ly5cHwxhTR1QA"
            loading="lazy"
          />
          <div className="z-20 text-center px-6">
            <p className="font-sans font-black text-[32px] sm:text-[48px] md:text-[56px] text-white italic max-w-4xl mx-auto drop-shadow-2xl">
              "The closest you can get to magic."
            </p>
          </div>
        </section>

        {/* Cross-Sell Grid */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-left">
          <div className="flex items-center justify-between mb-16">
            <h2 className="font-sans font-black text-[22px] md:text-[30px] tracking-[0.15em] text-white uppercase">ДОПОЛНИТЕ СВОЙ РИТУАЛ</h2>
            <div className="hidden md:block h-px bg-white/10 flex-1 ml-12"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Card 1 */}
            <div className="group cursor-pointer bg-neutral-900 text-white transition-all duration-500 hover:-translate-y-2 border border-white/5">
              <div className="aspect-square bg-neutral-950 relative overflow-hidden">
                <img 
                  alt="Personal Moisturizer" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqziSFCyLTp7ZLVXgrCSd1GePgC3HAKS0mYEaBM-cogjUvU_IbGOr54AhzAV7l17BSBJ8NToWG7P-Q90rpYo5VJ1jqo8fCDomA-W_8En_-faig-jbzpJ5AJIodEagawEFD8vfZML54fFo-Sn9JRKUbC5QzPZmS4zXpS3zcgjUbqGrP0C5ph9rNp6L5u9VBJjPoRmOBmKAOPQQBKi_EQvllMByBqf0tUmIufN2l5MnAyRhIebm3WCk-pYy9CmcRBs-_mXpPt5Gsjtg"
                  loading="lazy"
                />
              </div>
              <div className="p-8 text-center flex flex-col items-center">
                <h3 className="font-sans font-bold text-xs tracking-widest uppercase mb-4 text-white">Personal Moisturizer</h3>
                <p className="font-sans text-xs text-outline mb-6 line-clamp-2">Премиальный водный лубрикант для максимального скольжения и комфорта.</p>
                <div className="font-sans font-bold text-lg mb-6 text-primary">12 500 ₸</div>
                <button 
                  onClick={() => handleCrossSellAdd('Personal Moisturizer', 12500)}
                  className="font-sans font-bold text-[10px] tracking-widest border border-white text-white px-8 py-3 uppercase hover:bg-white hover:text-black transition-colors duration-300"
                >
                  В КОРЗИНУ
                </button>
              </div>
            </div>
            {/* Card 2 */}
            <div className="group cursor-pointer bg-neutral-900 text-white transition-all duration-500 hover:-translate-y-2 border border-white/5">
              <div className="aspect-square bg-neutral-950 relative overflow-hidden">
                <img 
                  alt="Cleaning Spray" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmig59xczUoR-n2aVFxU9txL_56FEhxwyEgECdo2yXniir4QXBo1bxBWPcJctm2VSIeih2xnJmMlChC4VNROdjPoFBbxjpL7zErkfbsK7D3f7bFeaD6wOZckEKNOs9ePZNaP7TOJZ6L8vS2N6g90pjVD1ATcpbCRjle14oV7cgW7WxoDuWmc7ctiae-gTKrWMNuCsiGLgado_cEuxAO4H-cBYUKUyIjQmG0AFQJ7FHOpcY99mtq_Ak6Bw88XX9VFP91aEB2aqVauw"
                  loading="lazy"
                />
              </div>
              <div className="p-8 text-center flex flex-col items-center">
                <h3 className="font-sans font-bold text-xs tracking-widest uppercase mb-4 text-white">Cleaning Spray</h3>
                <p className="font-sans text-xs text-outline mb-6 line-clamp-2">Бесспиртовой антибактериальный спрей для безопасного ухода за игрушками.</p>
                <div className="font-sans font-bold text-lg mb-6 text-primary">8 900 ₸</div>
                <button 
                  onClick={() => handleCrossSellAdd('Cleaning Spray', 8900)}
                  className="font-sans font-bold text-[10px] tracking-widest border border-white text-white px-8 py-3 uppercase hover:bg-white hover:text-black transition-colors duration-300"
                >
                  В КОРЗИНУ
                </button>
              </div>
            </div>
            {/* Card 3 */}
            <div className="group cursor-pointer bg-neutral-900 text-white transition-all duration-500 hover:-translate-y-2 border border-white/5">
              <div className="aspect-square bg-neutral-950 relative overflow-hidden">
                <img 
                  alt="Scented Candle" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmCMa-6UB3n17ENxC8klc0m-CCMwCLMksjHuQVb8I4mF-4GxB6NyhN0aFjfQFyPdTmmo4Ll3b-dtMUYbvPo7HN1cpkBWLq-gqa-1vxhWsS97tPE_YxriZOsQ7QcRwhGX6P8_XklTHxbIp6_xmqZWyNdsF3xwk1JRMeifaMH5SlRqvU0TTQ2R8Ro4og8Xvz3Vx7AfYIa6kzgxCJV9FKk9ojiZGkxh0kR-WbCQ60Bqu3y3l878T_M4FsrPDqtWZpAiBGJtAq55z7-pQ"
                  loading="lazy"
                />
              </div>
              <div className="p-8 text-center flex flex-col items-center">
                <h3 className="font-sans font-bold text-xs tracking-widest uppercase mb-4 text-white">Scented Candle</h3>
                <p className="font-sans text-xs text-outline mb-6 line-clamp-2">Парфюмированная свеча с теплыми нотами амбры, ванили и черного дерева.</p>
                <div className="font-sans font-bold text-lg mb-6 text-primary">15 200 ₸</div>
                <button 
                  onClick={() => handleCrossSellAdd('Scented Candle', 15200)}
                  className="font-sans font-bold text-[10px] tracking-widest border border-white text-white px-8 py-3 uppercase hover:bg-white hover:text-black transition-colors duration-300"
                >
                  В КОРЗИНУ
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Review Section */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-low flex items-center justify-center text-center">
          <div className="max-w-4xl mx-auto">
            <span className="material-symbols-outlined text-4xl text-primary mb-8 block opacity-40">format_quote</span>
            <p className="font-sans font-black text-xl md:text-3xl text-white italic leading-snug">
              "A masterpiece of engineering and pleasure."
            </p>
            <div className="w-12 h-px bg-primary mx-auto mt-8"></div>
          </div>
        </section>
      </main>
    </div>
  );
}
