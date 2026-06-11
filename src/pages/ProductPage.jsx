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

  const deviceLength = useMemo(() => {
    if (!product) return 15;
    if (product.id === 8) return 21.8; // Soraya
    if (product.id === 1) return 20.0; // Ina
    if (product.id === 2) return 12.0; // Boomerang
    if (product.id === 3) return 9.8;  // Surfer
    if (product.id === 4) return 9.9;  // Sona
    if (product.id === 7) return 10.4; // Hugo
    if (product.id === 9) return 16.5; // Gigi
    return 15;
  }, [product]);

  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [displayMode, setDisplayMode] = useState('studio'); // 'studio' vs 'scale'
  const [timeLeft, setTimeLeft] = useState(4500); // 1 hour 15 minutes default

  // Reviews State
  const [reviewsList, setReviewsList] = useState([]);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState('25-34');
  const [formExp, setFormExp] = useState('Средний');
  const [formSens, setFormSens] = useState('Нормальная');
  const [formText, setFormText] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formNoise, setFormNoise] = useState(8);
  const [formStrength, setFormStrength] = useState(8);
  const [formErgo, setFormErgo] = useState(9);

  // Monitor scroll for sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowStickyCta(true);
      } else {
        setShowStickyCta(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ticking countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 4500));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}ч ${String(m).padStart(2, '0')}м ${String(s).padStart(2, '0')}с`;
  };

  // Reset states when active product changes
  useEffect(() => {
    if (product && product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0].name);
    }
    setQty(1);
    setActiveImageIndex(0);
    setDisplayMode('studio');

    // Populate dynamic reviews for the product
    setReviewsList([
      {
        id: 1,
        author: 'Аделина',
        age: '25-34',
        experience: 'Сексперт',
        sensitivity: 'Высокая',
        rating: 5,
        date: '10.06.2026',
        text: `Игрушка ${product.name} полностью оправдала ожидания. Очень мягкий силикон и тихая работа. Функция волновых движений ощущается совершенно иначе, чем обычная вибрация.`,
        noise: 9,
        strength: 9,
        ergo: 10
      },
      {
        id: 2,
        author: 'Кирилл',
        age: '35-44',
        experience: 'Средний',
        sensitivity: 'Нормальная',
        rating: 4.8,
        date: '05.06.2026',
        text: 'Покупал в подарок партнерше. Мы оба в восторге. Качество сборки на высшем уровне, упаковано было абсолютно анонимно. Доставка в Атырау заняла всего день.',
        noise: 8,
        strength: 10,
        ergo: 9
      }
    ]);
  }, [product]);

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;
    const totalImages = product.gallery?.length || 1;
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Swipe left, show next image
        setActiveImageIndex((prev) => (prev + 1) % totalImages);
      } else {
        // Swipe right, show prev image
        setActiveImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
      }
    }
  };

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

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formText.trim()) {
      alert('Пожалуйста, заполните имя и текст отзыва');
      return;
    }
    const newRev = {
      id: reviewsList.length + 1,
      author: formName,
      age: formAge,
      experience: formExp,
      sensitivity: formSens,
      rating: formRating,
      date: new Date().toLocaleDateString('ru-RU'),
      text: formText,
      noise: formNoise,
      strength: formStrength,
      ergo: formErgo
    };
    setReviewsList(prev => [newRev, ...prev]);
    // Reset inputs
    setFormName('');
    setFormText('');
    setFormRating(5);
    setFormNoise(8);
    setFormStrength(8);
    setFormErgo(9);
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
            <div className="flex flex-wrap items-center gap-4 mb-4">
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

            {/* Kaspi Red Installments */}
            <div className="w-full flex items-center gap-3 bg-neutral-900/40 p-4 border border-white/5 rounded-[2px] mb-4">
              <div className="flex-none bg-[#E11D48] text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-[2px] uppercase font-sans">Kaspi Red</div>
              <div className="text-left font-sans text-xs text-white/90">
                Рассрочка 0-0-3: <span className="font-bold text-primary">{Math.round(product.price / 3).toLocaleString('ru-KZ')} ₸</span> / мес без переплат
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="w-full flex items-center gap-3 bg-[#FF5C3F]/10 p-4 border border-[#FF5C3F]/20 rounded-[2px] mb-6">
              <span className="material-symbols-outlined text-[#FF5C3F] text-[18px]">alarm</span>
              <div className="text-left font-sans text-xs text-white/95">
                Закажите в течение <span className="font-black text-[#FF5C3F] font-mono">{formatTime(timeLeft)}</span>, и мы отправим сегодня!
              </div>
            </div>

            {/* Trust Badges */}
            <div className="w-full grid grid-cols-3 gap-2.5 border-t border-white/10 pt-6 mt-2">
              <div className="flex flex-col items-center text-center p-2.5 rounded-[2px] bg-neutral-900/20 border border-white/5">
                <span className="material-symbols-outlined text-[18px] text-primary mb-1">visibility_off</span>
                <span className="text-[8px] font-black tracking-wider text-white uppercase">Анонимно</span>
              </div>
              <div className="flex flex-col items-center text-center p-2.5 rounded-[2px] bg-neutral-900/20 border border-white/5">
                <span className="material-symbols-outlined text-[18px] text-primary mb-1">verified_user</span>
                <span className="text-[8px] font-black tracking-wider text-white uppercase">2 года гарантии</span>
              </div>
              <div className="flex flex-col items-center text-center p-2.5 rounded-[2px] bg-neutral-900/20 border border-white/5">
                <span className="material-symbols-outlined text-[18px] text-primary mb-1">shield</span>
                <span className="text-[8px] font-black tracking-wider text-white uppercase">Безопасно</span>
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
                <div className="w-full flex flex-col items-center justify-center py-6 px-4 bg-neutral-950/40 rounded-[4px] border border-white/5 font-sans text-left min-h-[350px]">
                  <p className="text-[10px] font-black tracking-widest text-primary uppercase mb-6 text-center">Сравнение размеров</p>
                  
                  <div className="flex items-end justify-center gap-8 md:gap-12 w-full h-56 pb-4">
                    {/* Palm */}
                    <div className="flex flex-col items-center gap-2 h-full justify-end">
                      <div className="relative w-12 bg-neutral-900 border border-white/10 flex items-center justify-center text-2xl transition-all" style={{ height: `${18 * 8}px` }}>
                        ✋
                        <span className="absolute -top-6 text-[10px] font-bold text-white/70">~18 см</span>
                      </div>
                      <span className="text-[8px] font-bold tracking-wider text-outline uppercase text-center">Ладонь</span>
                    </div>

                    {/* Product Device */}
                    <div className="flex flex-col items-center gap-2 h-full justify-end">
                      <div className="relative w-16 bg-primary/20 border-2 border-primary flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(242,202,80,0.2)]" style={{ height: `${deviceLength * 8}px` }}>
                        {product.emoji || '🌸'}
                        <span className="absolute -top-6 text-[11px] font-black text-primary">{deviceLength} см</span>
                      </div>
                      <span className="text-[9px] font-black tracking-wider text-white uppercase text-center truncate max-w-[80px]">{product.name}</span>
                    </div>

                    {/* iPhone 15 */}
                    <div className="flex flex-col items-center gap-2 h-full justify-end">
                      <div className="relative w-12 bg-neutral-900 border border-white/10 flex items-center justify-center text-xl" style={{ height: `${14.6 * 8}px` }}>
                        📱
                        <span className="absolute -top-6 text-[10px] font-bold text-white/70">14.6 см</span>
                      </div>
                      <span className="text-[8px] font-bold tracking-wider text-outline uppercase text-center">iPhone 15</span>
                    </div>
                  </div>

                  <p className="text-[9px] text-outline text-center leading-relaxed mt-4 max-w-xs">
                    * Сравнение габаритов с раскрытой ладонью взрослого человека и стандартным смартфоном iPhone 15.
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

              {/* Mobile Swipe Indicator (Line progress bar) */}
              {displayMode === 'studio' && product.gallery && product.gallery.length > 1 && (
                <div className="w-full max-w-[150px] mx-auto h-[2px] bg-white/10 mt-6 relative overflow-hidden md:hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
                    style={{ 
                      width: `${((activeImageIndex + 1) / product.gallery.length) * 100}%` 
                    }}
                  />
                </div>
              )}

              {/* Toggle Display Mode */}
              <div className="flex gap-4 mt-6 z-20">
                <button
                  onClick={() => setDisplayMode('studio')}
                  className={`px-4 py-1.5 font-sans font-bold text-[9px] tracking-widest uppercase border transition-all rounded-[2px] ${
                    displayMode === 'studio'
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-white/50 border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  Студийный ракурс
                </button>
                <button
                  onClick={() => setDisplayMode('scale')}
                  className={`px-4 py-1.5 font-sans font-bold text-[9px] tracking-widest uppercase border transition-all rounded-[2px] ${
                    displayMode === 'scale'
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-white/50 border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  Сравнение размера
                </button>
              </div>
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
        <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-low text-left font-sans">
          <div className="max-w-5xl mx-auto flex flex-col gap-16">
            <h2 className="font-sans font-black text-[22px] md:text-[30px] tracking-[0.15em] text-white uppercase text-center">ОТЗЫВЫ ПОКУПАТЕЛЕЙ</h2>
            
            {/* Reviews Summary and Add Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              
              {/* Left Column: Ratings Summary & Sub-criteria */}
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="text-left">
                    <p className="text-5xl font-black text-white leading-none">4.9</p>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-2">из 5 звезд</p>
                  </div>
                  <div className="flex flex-col gap-1 text-primary">
                    <div className="flex gap-1 text-lg">★★★★★</div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">На основе {reviewsList.length} отзывов</p>
                  </div>
                </div>

                {/* Sub-criteria progress bars */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <h3 className="text-[10px] font-black tracking-widest text-white uppercase">Оценка характеристик</h3>
                  
                  {/* Noise Level */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                      <span className="uppercase tracking-wider">Уровень шума (Тишина)</span>
                      <span className="text-white">9.2 / 10</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '92%' }} />
                    </div>
                  </div>

                  {/* Vibration Strength */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                      <span className="uppercase tracking-wider">Сила вибрации</span>
                      <span className="text-white">9.5 / 10</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '95%' }} />
                    </div>
                  </div>

                  {/* Ergonomics */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                      <span className="uppercase tracking-wider">Эргономика и дизайн</span>
                      <span className="text-white">9.8 / 10</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '98%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Write a Review Form */}
              <div className="bg-neutral-900/40 p-6 md:p-8 border border-white/5 rounded-[4px]">
                <h3 className="text-sm font-black tracking-widest text-white uppercase mb-6">Написать отзыв</h3>
                <form onSubmit={handleSubmitReview} className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold tracking-wider text-outline uppercase">Ваше имя</label>
                    <input 
                      type="text" 
                      required
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="Введите имя"
                      className="w-full bg-neutral-950 border border-white/10 px-4 py-2.5 text-xs text-white focus:border-primary outline-none transition-colors rounded-[2px]"
                    />
                  </div>

                  {/* Dropdowns Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold tracking-wider text-outline uppercase">Возраст</label>
                      <select 
                        value={formAge} 
                        onChange={e => setFormAge(e.target.value)}
                        className="w-full bg-neutral-950 border border-white/10 px-2.5 py-2.5 text-[10px] text-white focus:border-primary outline-none transition-colors rounded-[2px]"
                      >
                        <option value="18-24">18-24</option>
                        <option value="25-34">25-34</option>
                        <option value="35-44">35-44</option>
                        <option value="45+">45+</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold tracking-wider text-outline uppercase">Опыт</label>
                      <select 
                        value={formExp} 
                        onChange={e => setFormExp(e.target.value)}
                        className="w-full bg-neutral-950 border border-white/10 px-2.5 py-2.5 text-[10px] text-white focus:border-primary outline-none transition-colors rounded-[2px]"
                      >
                        <option value="Новичок">Новичок</option>
                        <option value="Средний">Средний</option>
                        <option value="Сексперт">Сексперт</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold tracking-wider text-outline uppercase">Чувствительность</label>
                      <select 
                        value={formSens} 
                        onChange={e => setFormSens(e.target.value)}
                        className="w-full bg-neutral-950 border border-white/10 px-2.5 py-2.5 text-[10px] text-white focus:border-primary outline-none transition-colors rounded-[2px]"
                      >
                        <option value="Низкая">Низкая</option>
                        <option value="Нормальная">Нормальная</option>
                        <option value="Высокая">Высокая</option>
                      </select>
                    </div>
                  </div>

                  {/* Character Sliders */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-bold text-outline uppercase tracking-wider">
                      <span>Шум: {formNoise}/10</span>
                      <input 
                        type="range" min="1" max="10" 
                        value={formNoise} onChange={e => setFormNoise(parseInt(e.target.value))}
                        className="accent-primary w-24 h-1 bg-neutral-800 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-outline uppercase tracking-wider">
                      <span>Вибрация: {formStrength}/10</span>
                      <input 
                        type="range" min="1" max="10" 
                        value={formStrength} onChange={e => setFormStrength(parseInt(e.target.value))}
                        className="accent-primary w-24 h-1 bg-neutral-800 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-outline uppercase tracking-wider">
                      <span>Эргономика: {formErgo}/10</span>
                      <input 
                        type="range" min="1" max="10" 
                        value={formErgo} onChange={e => setFormErgo(parseInt(e.target.value))}
                        className="accent-primary w-24 h-1 bg-neutral-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold tracking-wider text-outline uppercase">Ваш отзыв</label>
                    <textarea 
                      required
                      value={formText}
                      onChange={e => setFormText(e.target.value)}
                      placeholder="Поделитесь вашим опытом..."
                      rows={3}
                      className="w-full bg-neutral-950 border border-white/10 px-4 py-2.5 text-xs text-white focus:border-primary outline-none transition-colors rounded-[2px] resize-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-primary text-on-primary font-sans font-black text-[10px] tracking-[0.2em] py-3.5 uppercase hover:bg-[#ffe088] transition-colors rounded-[2px]"
                  >
                    ОТПРАВИТЬ ОТЗЫВ
                  </button>
                </form>
              </div>

            </div>

            {/* Bottom Reviews List Stack */}
            <div className="space-y-6 pt-12 border-t border-white/10">
              <h3 className="text-sm font-black tracking-widest text-white uppercase mb-6 text-left">Список отзывов ({reviewsList.length})</h3>
              
              <div className="space-y-6">
                {reviewsList.map(rev => (
                  <div key={rev.id} className="p-6 md:p-8 bg-neutral-900/20 border border-white/5 rounded-[4px] space-y-4">
                    {/* Review Header Metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="text-left">
                        <p className="text-sm font-bold text-white uppercase">{rev.author}</p>
                        <p className="text-[9px] text-outline mt-1 font-bold">{rev.date}</p>
                      </div>
                      
                      {/* Profile Badges */}
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-neutral-900 text-primary border border-primary/20 text-[8px] font-black tracking-widest uppercase py-1 px-3 rounded-full">
                          Возраст: {rev.age}
                        </span>
                        <span className="bg-neutral-900 text-primary border border-primary/20 text-[8px] font-black tracking-widest uppercase py-1 px-3 rounded-full">
                          Опыт: {rev.experience}
                        </span>
                        <span className="bg-neutral-900 text-primary border border-primary/20 text-[8px] font-black tracking-widest uppercase py-1 px-3 rounded-full">
                          Чувствительность: {rev.sensitivity}
                        </span>
                      </div>
                    </div>

                    {/* Review text */}
                    <p className="text-xs text-white/80 leading-relaxed font-sans font-normal text-left">{rev.text}</p>

                    {/* Review sub-ratings */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-[9px] text-outline font-bold tracking-wider uppercase pt-4 border-t border-white/5">
                      <span>Шум: <span className="text-white font-mono">{rev.noise}/10</span></span>
                      <span>Вибрация: <span className="text-white font-mono">{rev.strength}/10</span></span>
                      <span>Эргономика: <span className="text-white font-mono">{rev.ergo}/10</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Mobile Sticky CTA Bar */}
      {showStickyCta && (
        <div className="fixed bottom-16 left-0 right-0 h-16 bg-[#09090b]/95 backdrop-blur-md border-t border-white/10 flex items-center justify-between px-6 z-40 md:hidden shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-900 flex items-center justify-center text-xl rounded-[2px] overflow-hidden">
              {product.emoji || '🌸'}
            </div>
            <div className="text-left">
              <p className="font-sans font-bold text-[10px] tracking-wider text-white uppercase truncate max-w-[150px]">{product.name}</p>
              <p className="font-sans text-[11px] text-primary font-bold">{product.price.toLocaleString('ru-KZ')} ₸</p>
            </div>
          </div>
          
          <button 
            onClick={handleAdd}
            className="bg-primary text-on-primary font-sans font-black text-[10px] tracking-[0.15em] uppercase py-3 px-6 hover:bg-[#ffe088] transition-colors rounded-[2px]"
          >
            В КОРЗИНУ
          </button>
        </div>
      )}
    </div>
  );
}
