import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ALL_PRODUCTS } from '../data/products';
import { useTranslation } from 'react-i18next';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductHero from '../components/product/ProductHero';
import ProductRitual from '../components/product/ProductRitual';
import ProductFeatures from '../components/product/ProductFeatures';
import ProductSpecs from '../components/product/ProductSpecs';
import ProductLifestyle from '../components/product/ProductLifestyle';
import ProductCrossSell from '../components/product/ProductCrossSell';
import ProductReviews from '../components/product/ProductReviews';

let productsMapCache = null;
let productsCacheStr = null;


export default function ProductPage({ onAddToCart, favorites, setFavorites }) {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  
  // Find product by id from URL, default to first product if not found
  const product = useMemo(() => {
    let map = productsMapCache;
    let cachedStr = null;

    try {
      cachedStr = localStorage.getItem('hs_products');
    } catch (e) {
      console.warn('Failed to get cached products in ProductPage', e);
    }

    if (cachedStr) {
      if (cachedStr !== productsCacheStr) {
        try {
          const list = JSON.parse(cachedStr);
          map = new Map(list.map(p => [String(p.id), p]));
          productsCacheStr = cachedStr;
          productsMapCache = map;
        } catch (e) {
          console.warn('Failed to parse cached products in ProductPage', e);
        }
      }
    }

    if (!map) {
      map = new Map(ALL_PRODUCTS.map(p => [String(p.id), p]));
      productsMapCache = map;
    }

    const found = map.get(String(id));
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
  const [selectedSize, setSelectedSize] = useState('One Size');
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
    const lang = i18n.language;
    const hUnit = lang === 'en' ? 'h' : lang === 'kk' ? 'сағ' : 'ч';
    const mUnit = lang === 'en' ? 'm' : lang === 'kk' ? 'мин' : 'м';
    const sUnit = lang === 'en' ? 's' : lang === 'kk' ? 'сек' : 'с';
    return `${String(h).padStart(2, '0')}${hUnit} ${String(m).padStart(2, '0')}${mUnit} ${String(s).padStart(2, '0')}${sUnit}`;
  };

  // Reset states when active product changes
  useEffect(() => {
    if (product && product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0].name);
    }
    if (product && product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    } else {
      setSelectedSize('One Size');
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
      const hasSizes = product.sizes && product.sizes.length > 0;
      const variantParts = [selectedColor, hasSizes ? selectedSize : null].filter(Boolean);
      const variantName = variantParts.join(' / ') || 'Default';
      onAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        emoji: product.emoji || '🌸',
        variant: variantName,
        qty: qty,
        image: (product.gallery && product.gallery[activeImageIndex]) || product.image
      });
    }
  };

  const handleCrossSellAdd = (key, defaultName, price) => {
    if (onAddToCart) {
      onAddToCart({
        id: key === 'moisturizer' ? 101 : key === 'spray' ? 102 : 103,
        name: t(`product.crosssell.${key}_name`, defaultName),
        price: price,
        emoji: key === 'moisturizer' ? '🧴' : key === 'spray' ? '🧼' : '🕯️',
        variant: 'Default',
        qty: 1
      });
    }
  };

  const translateSpecValue = (value, specKey) => {
    if (!value) return '';
    const lang = i18n.language;
    if (lang === 'ru') return value;

    const lower = value.toLowerCase();

    if (specKey === 'material') {
      if (lower.includes('силикон') && lower.includes('abs')) {
        return lang === 'en' 
          ? 'Body-safe medical grade silicone, ABS plastic' 
          : 'Медициналық қауіпсіз силикон, ABS-пластик';
      }
    }
    
    if (specKey === 'runtime') {
      if (lower.includes('2 часа') || lower.includes('2 часов')) {
        return lang === 'en' ? 'Up to 2 hours' : '2 сағатқа дейін';
      }
      if (lower.includes('1.5 часа') || lower.includes('1.5 часов')) {
        return lang === 'en' ? 'Up to 1.5 hours' : '1.5 сағатқа дейін';
      }
    }

    if (specKey === 'modes') {
      if (lower.includes('10 режимов')) {
        return lang === 'en' ? '10 vibration modes' : '10 діріл режимі';
      }
      if (lower.includes('8 режимов вибрации')) {
        return lang === 'en' ? '8 vibration modes' : '8 діріл режимі';
      }
      if (lower.includes('8 режимов стимуляции')) {
        return lang === 'en' ? '8 stimulation modes' : '8 ынталандыру режимі';
      }
      if (lower.includes('6 режимов вибрации')) {
        return lang === 'en' ? '6 vibration modes' : '6 діріл режимі';
      }
      if (lower.includes('12 режимов стимуляции')) {
        return lang === 'en' ? '12 stimulation modes' : '12 ынталандыру режимі';
      }
      if (lower.includes('sensemotion')) {
        return lang === 'en' ? '6 modes with SenseMotion™ technology' : 'SenseMotion™ технологиясы бар 6 режим';
      }
      if (lower.includes('wavemotion')) {
        return lang === 'en' ? '12 modes (WaveMotion™)' : '12 режим (WaveMotion™)';
      }
      if (lower.includes('множество')) {
        return lang === 'en' ? 'Many customizable patterns' : 'Көптеген реттелетін үлгілер';
      }
    }

    if (specKey === 'dimensions') {
      if (lower.includes('эргономичный')) {
        return lang === 'en' ? 'Ergonomic design' : 'Эргономикалық дизайн';
      }
      return value.replace('мм', lang === 'en' ? 'mm' : 'мм');
    }

    return value;
  };

  const getExperienceTranslation = (exp) => {
    if (exp === 'Новичок') return t('home.quiz.exp_new');
    if (exp === 'Средний') return t('home.quiz.exp_mid');
    if (exp === 'Сексперт') return t('home.quiz.exp_pro');
    return exp;
  };

  const getSensitivityTranslation = (sens) => {
    const lang = i18n.language;
    if (sens === 'Низкая') return lang === 'en' ? 'Low' : lang === 'kk' ? 'Төмен' : 'Низкая';
    if (sens === 'Нормальная') return lang === 'en' ? 'Normal' : lang === 'kk' ? 'Қалыпты' : 'Нормальная';
    if (sens === 'Высокая') return lang === 'en' ? 'High' : lang === 'kk' ? 'Жоғары' : 'Высокая';
    return sens;
  };

  const getReviewTextTranslation = (id, defaultText) => {
    const lang = i18n.language;
    if (lang === 'ru') return defaultText;
    if (id === 1) {
      return lang === 'en'
        ? `The ${product.name} toy completely met expectations. Very soft silicone and quiet operation. The wave movements function feels completely different than normal vibration.`
        : `${product.name} ойыншығы күткендегідей болды. Силиконы өте жұмсақ және тыныш жұмыс істейді. Толқындық қозғалыстар функциясы кәдімгі дірілге қарағанда мүлдем басқаша сезіледі.`;
    }
    if (id === 2) {
      return lang === 'en'
        ? `Bought as a gift for my partner. We are both thrilled. The build quality is top-notch, packed absolutely anonymously. Delivery to Atyrau took only one day.`
        : `Серіктесіме сыйлық ретінде сатып алдым. Екеуміз де ризамыз. Жинау сапасы жоғары деңгейде, мүлдем анонимді түрде қапталған. Атырауға жеткізу бір күн гаңа уақытты алды.`;
    }
    return defaultText;
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formText.trim()) {
      alert(i18n.language === 'en' ? 'Please fill in your name and review text' : i18n.language === 'kk' ? 'Атыңызды және пікір мәтінін толтырыңыз' : 'Пожалуйста, заполните имя и текст отзыва');
      return;
    }
    const newRev = {
      id: reviewsList.length + 1,
      author: formName,
      age: formAge,
      experience: formExp,
      sensitivity: formSens,
      rating: formRating,
      date: new Date().toLocaleDateString(i18n.language === 'en' ? 'en-US' : i18n.language === 'kk' ? 'kk-KZ' : 'ru-RU'),
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
      return t('product.tech.cruise_control');
    }
    if (prod.features.includes('wave_motion')) {
      return t('product.tech.wave_motion');
    }
    if (prod.features.includes('sense_motion')) {
      return t('product.tech.sense_motion');
    }
    if (prod.features.includes('dual_stimulation')) {
      return t('product.tech.dual_stimulation');
    }
    return t('product.tech_defaults.' + prod.id, prod.description);
  };

  return (
    <div className="bg-background text-on-surface font-sans antialiased overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      <main className="pt-20">
        <Breadcrumbs theme="dark" />
        
        {/* Hero Section */}
        <ProductHero
          t={t}
          i18n={i18n}
          product={product}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          sizesList={product.sizes || []}
          qty={qty}
          setQty={setQty}
          handleAdd={handleAdd}
          timeLeft={timeLeft}
          formatTime={formatTime}
          activeImageIndex={activeImageIndex}
          setActiveImageIndex={setActiveImageIndex}
          handleTouchStart={handleTouchStart}
          handleTouchEnd={handleTouchEnd}
          displayMode={displayMode}
          setDisplayMode={setDisplayMode}
          deviceLength={deviceLength}
          favorites={favorites}
          setFavorites={setFavorites}
        />

        {/* The Ritual Section */}
        <ProductRitual
          t={t}
          product={product}
          getTechnologyDescription={getTechnologyDescription}
        />

        {/* Features Icons */}
        <ProductFeatures t={t} />

        {/* Technical Specs */}
        <ProductSpecs
          t={t}
          product={product}
          translateSpecValue={translateSpecValue}
        />

        {/* Lifestyle Section */}
        <ProductLifestyle t={t} />

        {/* Cross-Sell Grid */}
        <ProductCrossSell
          t={t}
          handleCrossSellAdd={handleCrossSellAdd}
        />

        {/* Review Section */}
        <ProductReviews
          t={t}
          i18n={i18n}
          reviewsList={reviewsList}
          handleSubmitReview={handleSubmitReview}
          formName={formName}
          setFormName={setFormName}
          formAge={formAge}
          setFormAge={setFormAge}
          formExp={formExp}
          setFormExp={setFormExp}
          formSens={formSens}
          setFormSens={setFormSens}
          formNoise={formNoise}
          setFormNoise={setFormNoise}
          formStrength={formStrength}
          setFormStrength={setFormStrength}
          formErgo={formErgo}
          setFormErgo={setFormErgo}
          formText={formText}
          setFormText={setFormText}
          getExperienceTranslation={getExperienceTranslation}
          getSensitivityTranslation={getSensitivityTranslation}
          getReviewTextTranslation={getReviewTextTranslation}
        />
      </main>

      {/* Mobile Sticky CTA Bar */}
      {showStickyCta && (
        <div 
          className="fixed bottom-[92px] left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] h-16 flex items-center justify-between px-4 z-40 md:hidden rounded-full"
          style={{
            background: 'rgba(9, 9, 11, 0.55)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-900 flex items-center justify-center text-xl rounded-full overflow-hidden">
              {product.emoji || '🌸'}
            </div>
            <div className="text-left">
              <p className="font-sans font-bold text-[10px] tracking-wider text-white uppercase truncate max-w-[120px]">{product.name}</p>
              <p className="font-sans text-[11px] text-primary font-bold">{product.price.toLocaleString('ru-KZ')} ₸</p>
            </div>
          </div>
          
          <button 
            onClick={handleAdd}
            className="bg-primary text-on-primary font-sans font-black text-[10px] tracking-[0.15em] uppercase py-2.5 px-5 hover:bg-[#ffe088] transition-colors rounded-full"
          >
            {t('product.add_to_cart')}
          </button>
        </div>
      )}
    </div>
  );
}
