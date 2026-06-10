import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import logoNoirDress from '../assets/images/products/noir_silhouette_dress.png';
import logoEtherealWrap from '../assets/images/products/ethereal_silk_wrap.png';
import logoGoldBoots from '../assets/images/products/gold_trimmed_boots.png';

import heroBg from '../assets/images/hero-bg.png';
import ResponsiveImage from '../components/ResponsiveImage';
import ProductPreviewModal from '../components/ProductPreviewModal';

const HERO = {
  headline: 'ИСКУССТВО\nЧУВСТВЕННОСТИ',
  sub: 'Премиальные интимные аксессуары для тех, кто ценит эстетику, качество и новые ощущения.',
};

const POPULAR_CATEGORIES = [
  {
    id: 1,
    title: 'Популярные секс-игрушки',
    image: logoNoirDress,
    link: '/catalog?cat=vibrators'
  },
  {
    id: 2,
    title: 'Секс-игрушки для женщин',
    image: logoEtherealWrap,
    link: '/catalog?cat=vibrators'
  },
  {
    id: 3,
    title: 'Секс-игрушки для мужчин',
    image: logoGoldBoots,
    link: '/catalog?cat=massagers'
  },
  {
    id: 4,
    title: 'Секс-игрушки для пар',
    image: logoNoirDress,
    link: '/catalog?cat=couples'
  }
];

const ALL_PRODUCTS = [
  { 
    id: 7, 
    name: 'HUGO™ 2 REMOTE', 
    price: 166440, 
    oldPrice: 219000,
    category: 'massagers', 
    categoryLabel: 'МАССАЖЕРЫ ПРОСТАТЫ',
    image: logoGoldBoots,
    gallery: [logoGoldBoots, logoNoirDress, logoEtherealWrap],
    colors: ['#111111', '#004d40'],
    description: 'Вибромассажер простаты HUGO™ 2 Remote с 6 мощными режимами наслаждения для тех, кто хочет разжечь в себе искру любви. Благодаря технологии SenseMotion™ беспроводной пульт обеспечивает непревзойденное удобство.'
  },
  { 
    id: 1, 
    name: 'NOIR SILHOUETTE DRESS', 
    price: 210000, 
    oldPrice: 280000,
    category: 'vibrators', 
    categoryLabel: 'ВЕЧЕРНИЕ ПЛАТЬЯ',
    image: logoNoirDress, 
    gallery: [logoNoirDress, logoGoldBoots],
    colors: ['#4A4A4A', '#2D5E87', '#B8860B'],
    description: 'Премиальное шелковое платье NOIR SILHOUETTE DRESS, создающее идеальный силуэт. Роскошная ткань, тонкая проработка швов и чувственный крой.'
  },
  { 
    id: 2, 
    name: 'ETHEREAL SILK WRAP', 
    price: 92500, 
    oldPrice: 135000,
    category: 'vibrators', 
    categoryLabel: 'ШЕЛКОВЫЕ НАКИДКИ',
    image: logoEtherealWrap, 
    gallery: [logoEtherealWrap, logoNoirDress],
    colors: ['#FFFFFF', '#FFD700'],
    description: 'Легкая шелковая накидка ETHEREAL SILK WRAP для создания чувственной атмосферы дома или на отдыхе. Натуральный шелк высочайшего класса.'
  },
  { 
    id: 3, 
    name: 'GOLD-TRIMMED BOOTS', 
    price: 280000, 
    oldPrice: 380000,
    category: 'vibrators', 
    categoryLabel: 'ОБУВЬ И АКСЕССУАРЫ',
    image: logoGoldBoots, 
    gallery: [logoGoldBoots, logoEtherealWrap],
    colors: ['#FFD700', '#4A4A4A'],
    description: 'Ботильоны ручной работы GOLD-TRIMMED BOOTS с золотыми деталями. Элегантность, дерзость и превосходный комфорт.'
  },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

export default function HomePage({ onAddToCart }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedPreviewProduct, setSelectedPreviewProduct] = useState(null);
  
  // Mouse drag-to-scroll ref and states
  const sliderRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const handleScroll = (e) => {
    const element = e.target;
    const totalWidth = element.scrollWidth - element.clientWidth;
    if (totalWidth > 0) {
      setScrollProgress((element.scrollLeft / totalWidth) * 100);
    }
  };

  const handleMouseDown = (e) => {
    setIsDown(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeftState(sliderRef.current.scrollLeft);
    sliderRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    setIsDown(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseUp = () => {
    setIsDown(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    sliderRef.current.scrollLeft = scrollLeftState - walk;
  };

  return (
    <div className="page-enter">
      {/* ═══ HERO ══════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image using ResponsiveImage for WebP/AVIF support */}
        <ResponsiveImage 
          src={heroBg} 
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover opacity-60" 
          loading="eager"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        {/* Subtle gold glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #f2ca50, transparent 70%)' }}
        />

        <motion.div
          className="relative z-10 text-center max-w-3xl mx-auto px-6"
          initial="hidden" animate="visible" variants={stagger}
        >
          {/* Category label */}
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="label-caps text-primary mb-8">
            PREMIUM INTIMATE COLLECTION
          </motion.p>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-display-lg md:text-display-lg text-headline-lg-mobile whitespace-pre-line mb-8"
          >
            {HERO.headline}
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-body-lg text-on-surface-variant max-w-lg mx-auto mb-12"
          >
            {HERO.sub}
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp} transition={{ duration: 0.5, delay: 0.3 }} className="flex items-center justify-center gap-5 flex-wrap">
            <Link to="/catalog" className="btn-primary">КАТАЛОГ</Link>
            <Link to="/catalog?cat=wellness" className="btn-outline">WELLNESS</Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-20 flex flex-col items-center gap-2 text-outline"
          >
            <span className="label-caps text-[10px]">scroll</span>
            <span className="material-symbols-outlined text-xl animate-bounce" style={{ animationDuration: '2s' }}>
              expand_more
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ BRAND INTRODUCTION SECTION ═══ */}
      <section className="bg-background py-20 px-6 border-b border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm md:text-base text-on-surface-variant font-medium leading-relaxed max-w-2xl mx-auto font-sans tracking-wide">
            За годы работы HOT STUFF стал признанным лидером на рынке товаров для взрослых и эксклюзивного нижнего белья. 
            Сочетая премиальное качество, утонченную эстетику и абсолютную конфиденциальность, мы помогаем открыть новые грани удовольствия. 
            HOT STUFF — это не просто интернет-магазин товаров для взрослых. Это философия осознанного ухода за собой, 
            где удовольствие не имеет рамок и стереотипов. Мы дарим свободу наслаждения без стыда, открывая истинный потенциал 
            вашего тела и уверенность, которая делает личную жизнь по-настоящему желанной.
          </p>
        </div>
      </section>

      {/* ═══ POPULAR CATEGORIES / TOYS (Horizontal Scroll) ═══ */}
      <section className="bg-background py-16 border-b border-white/5">
        <div className="container-hs">
          <h2 className="font-label-caps text-xs tracking-[0.2em] text-white uppercase mb-8">
            ПОПУЛЯРНЫЕ ТОВАРЫ
          </h2>
        </div>
        
        {/* Horizontal scrollable wrapper */}
        <div 
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex overflow-x-auto gap-4 px-6 md:px-20 scrollbar-none snap-x snap-mandatory md:snap-none pb-6 cursor-grab select-none"
          onScroll={handleScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {POPULAR_CATEGORIES.map((cat) => (
            <div 
              key={cat.id} 
              className="min-w-[85vw] sm:min-w-[45vw] md:min-w-[35vw] lg:min-w-[32vw] snap-start relative aspect-[4/3] group overflow-hidden border border-white/5"
            >
              {/* Product Background Image */}
              <ResponsiveImage 
                src={cat.image} 
                alt={cat.title} 
                className="w-full h-full object-cover brightness-[0.8] group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              {/* Overlay with title & CTA button */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end items-start">
                <h3 className="text-white font-bold text-lg md:text-xl mb-4">
                  {cat.title}
                </h3>
                <Link 
                  to={cat.link} 
                  className="bg-white text-black font-label-caps text-[10px] font-black tracking-widest py-3 px-8 transition-transform hover:scale-105"
                >
                  СМОТРЕТЬ
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Scroll Indicator Line */}
        <div className="container-hs mt-4">
          <div className="w-full bg-white/10 h-[2px] relative rounded-full overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-100" 
              style={{ width: '25%', transform: `translateX(${scrollProgress * 3}%)` }}
            ></div>
          </div>
        </div>
      </section>

      {/* ═══ BESTSELLERS ═══════════════════════════ */}
      <section className="bg-background py-16 border-b border-white/5">
        <div className="container-hs">
          <h2 className="font-label-caps text-xs tracking-[0.2em] text-white uppercase mb-8">
            БЕСТСЕЛЛЕРЫ
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {ALL_PRODUCTS.map((p) => (
              <div key={p.id} className="relative group">
                {/* Background and border that expands on hover */}
                <div className="absolute inset-0 bg-surface-container-low border border-white/5 transition-all duration-300 md:group-hover:-bottom-[68px] z-0 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <Link to={`/product/${p.id}`} className="block relative overflow-hidden aspect-[3/4]">
                    <ResponsiveImage src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  </Link>
                  
                  <div className="p-4 flex flex-col">
                    <Link to={`/product/${p.id}`}>
                      <h3 className="font-bold text-[10px] md:text-xs tracking-widest text-on-surface uppercase mb-1 line-clamp-1">{p.name}</h3>
                    </Link>
                    <p className="text-[10px] md:text-xs text-on-surface-variant mb-3 md:mb-0">{p.price.toLocaleString('ru-KZ')} ₸</p>
                    
                    {/* Action Button - Visible on mobile, absolute and fade in on hover on desktop */}
                    <div className="md:absolute md:left-0 md:right-0 md:top-full md:px-4 md:opacity-0 md:pointer-events-none md:group-hover:pointer-events-auto md:group-hover:opacity-100 md:transition-all md:duration-300">
                      <button 
                        onClick={() => setSelectedPreviewProduct(p)} 
                        className="block w-full bg-white text-black text-center font-label-caps text-[10px] md:text-xs tracking-widest py-3 hover:bg-white/90 transition-colors"
                      >
                        ПРЕДПРОСМОТР
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BRAND QUOTE ═══════════════════════════ */}
      <section className="relative py-section-gap overflow-hidden">
        <div className="absolute inset-0 bg-surface-container-lowest" />
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #f2ca50, transparent 70%)' }}
        />
        <motion.div
          className="container-hs relative z-10 max-w-3xl mx-auto text-center"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
        >
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="label-caps text-primary mb-8">
            PHILOSOPHY
          </motion.p>
          <motion.blockquote
            variants={fadeUp} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-headline-lg md:text-headline-lg text-headline-lg-mobile text-on-surface italic"
          >
            "Удовольствие — это язык тела. Мы помогаем его расслышать."
          </motion.blockquote>
          <motion.div variants={fadeUp} transition={{ duration: 0.4, delay: 0.2 }}>
            <div className="underline-gold mx-auto mt-6" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ NEWSLETTER ════════════════════════════ */}
      <section className="container-hs py-section-gap">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
        >
          <motion.p variants={fadeUp} className="label-caps text-primary mb-4">ОСТАВАЙТЕСЬ С НАМИ</motion.p>
          <motion.h2 variants={fadeUp} transition={{ delay: 0.1 }} className="text-headline-lg mb-4">
            Подпишитесь на новинки
          </motion.h2>
          <motion.p variants={fadeUp} transition={{ delay: 0.15 }} className="text-body-md text-on-surface-variant mb-10">
            Получайте эксклюзивные предложения и будьте первыми, кто узнает о новых коллекциях.
          </motion.p>
          <motion.form variants={fadeUp} transition={{ delay: 0.2 }} className="flex gap-0 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="Ваш email"
              className="flex-1 bg-surface-container-low border border-white/10 border-r-0 px-5 py-4 text-body-md text-on-surface outline-none focus:border-primary transition-colors"
            />
            <button className="btn-primary px-8">→</button>
          </motion.form>
        </motion.div>
      </section>

      {/* Product Preview Modal */}
      <ProductPreviewModal 
        product={selectedPreviewProduct}
        isOpen={!!selectedPreviewProduct}
        onClose={() => setSelectedPreviewProduct(null)}
        onAddToCart={onAddToCart}
      />
    </div>
  );
}
