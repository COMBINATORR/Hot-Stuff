import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import logoNoirDress from '../assets/images/products/noir_silhouette_dress.png';
import logoEtherealWrap from '../assets/images/products/ethereal_silk_wrap.png';
import logoGoldBoots from '../assets/images/products/gold_trimmed_boots.png';

import heroBg from '../assets/images/hero-bg.png?as=url&format=png';
import heroVideo from '../assets/hero-bg.webm';
import heroPoster from '../assets/hero-poster.webp?as=url&format=webp';
import logoInaThrustPromo from '../assets/images/ina_thrust_promo.png';
import logoQuizBg from '../assets/images/sex_toy_quiz_bg.png';
import logoNewsletterBg from '../assets/images/newsletter_bg.png';
import ResponsiveImage from '../components/ResponsiveImage';
import ProductPreviewModal from '../components/ProductPreviewModal';
import ProductGrid from '../components/ProductGrid';
import HotspotsLookbook from '../components/HotspotsLookbook';
import { supabase } from '../lib/supabase';
import { ALL_PRODUCTS } from '../data/products';

const HERO = {
  headline: 'в погоне за наслаждением',
  sub: 'Скидки в месяц самонаслаждения',
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


const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

export default function HomePage({ onAddToCart }) {
  const { t } = useTranslation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedPreviewProduct, setSelectedPreviewProduct] = useState(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const getSocialProofTranslation = (text) => {
    if (!text) return '';
    if (text.includes('куплено сегодня')) {
      return t('product.social_proof.bought_today', text);
    }
    if (text.includes('Топ-выбор')) {
      return t('product.social_proof.top_choice', text);
    }
    if (text.includes('добавили в корзину')) {
      return t('product.social_proof.added_to_cart', text);
    }
    if (text.includes('рекомендаций')) {
      return t('product.social_proof.recommendations', text);
    }
    return text;
  };

  // Supabase states
  const [categories, setCategories] = useState(() => {
    return [
      { id: 1, name: 'Классическое нижнее белье', slug: 'lingerie-classic' },
      { id: 2, name: 'Эротическое белье и одежда', slug: 'lingerie-erotic' },
      { id: 3, name: 'Игрушки для женщин', slug: 'toys-women' },
      { id: 4, name: 'Игрушки для мужчин', slug: 'toys-men' }
    ];
  });
  const [dbProducts, setDbProducts] = useState([]);

  // Helper to map DB category slug to local image
  const getCategoryImage = (slug) => {
    switch (slug) {
      case 'lingerie-classic': return logoNoirDress;
      case 'lingerie-erotic': return logoEtherealWrap;
      case 'toys-women': return logoNoirDress;
      case 'toys-men': return logoGoldBoots;
      case 'toys-couples': return logoNoirDress;
      default: return logoNoirDress;
    }
  };

  // Helper to map DB category slug to catalog route
  const getCategoryLink = (slug) => {
    return `/catalog?cat=${slug}`;
  };

  // Load 4 priority categories from Supabase categories table
  useEffect(() => {
    async function loadCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('id', { ascending: true })
          .limit(4);
        
        if (error) throw error;
        if (data && data.length > 0) {
          setCategories(data);
        }
      } catch (err) {
        console.warn('[HomePage] Error loading categories from Supabase, using defaults:', err);
      }
    }
    loadCategories();
  }, []);

  // Load bestsellers from Supabase products table
  useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(8);
        
        if (error) throw error;
        if (data && data.length > 0) {
          const mutated = data.map(p => {
            const localProduct = ALL_PRODUCTS.find(lp => lp.id === p.id);
            return {
              ...p,
              price: localProduct ? localProduct.price : (Math.floor(Math.random() * 101) + 100),
              oldPrice: null
            };
          });
          setDbProducts(mutated);
        }
      } catch (err) {
        console.warn('[HomePage] Error loading products from Supabase, using local fallback:', err);
      }
    }
    loadProducts();
  }, []);

  const displayedProducts = dbProducts.length > 0 ? dbProducts : ALL_PRODUCTS;

  // Quiz State
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [selectedStimulation, setSelectedStimulation] = useState({ clitoris: false, penis: false });

  // Lock scroll when quiz modal is active
  useEffect(() => {
    if (quizOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [quizOpen]);

  const handleQuizAnswer = (key, value) => {
    setQuizAnswers(prev => ({ ...prev, [key]: value }));
    setQuizStep(prev => prev + 1);
  };

  const submitQuiz = () => {
    setQuizStep(10);
  };

  const getRecommendation = () => {
    const isPen = selectedStimulation.penis;
    const isClit = selectedStimulation.clitoris;

    // 1. Both selected (Clitoris + Penis Contact) or Couples Mode
    if ((isClit && isPen) || quizAnswers.mode === 'couple' || quizAnswers.mode === 'В паре') {
      return {
        id: 2,
        name: 'LELO BOOMERANG™',
        price: 114500,
        image: logoEtherealWrap,
        desc: t('home.quiz.recommendations.boomerang')
      };
    }

    // 2. Penis stimulation or Male Orgasm
    if (isPen || quizAnswers.orgasm === 'male' || quizAnswers.orgasm === 'Мужской') {
      return {
        id: 7,
        name: 'HUGO™ 2 REMOTE',
        price: 166440,
        image: logoGoldBoots,
        desc: t('home.quiz.recommendations.hugo')
      };
    }

    // 3. Clitoral / Female Orgasm
    if (isClit || quizAnswers.orgasm === 'female' || quizAnswers.orgasm === 'Женский') {
      // Premium budget / expert experience
      if (quizAnswers.budget === 'high' || quizAnswers.budget === 'Деньги — не проблема' || quizAnswers.experience === 'pro' || quizAnswers.experience === 'Сексперт') {
        return {
          id: 8,
          name: 'SORAYA WAVE™',
          price: 124500,
          image: logoNoirDress,
          desc: t('home.quiz.recommendations.soraya')
        };
      }
      
      // Middle budget
      if (quizAnswers.budget === 'mid' || quizAnswers.budget === 'Средний') {
        return {
          id: 4,
          name: 'SONA™ 3 CRUISE',
          price: 71800,
          image: logoNoirDress,
          desc: t('home.quiz.recommendations.sona')
        };
      }

      // Default G-spot choice
      return {
        id: 9,
        name: 'LELO GIGI™ 2',
        price: 89500,
        image: logoGoldBoots,
        desc: t('home.quiz.recommendations.gigi')
      };
    }

    // Fallback: INA™ THRUST
    return {
      id: 1,
      name: 'INA™ THRUST',
      price: 119500,
      image: logoGoldBoots,
      desc: t('home.quiz.recommendations.ina')
    };
  };

  const renderQuizContent = () => {
    // Helper to render "Назад" button
    const renderBackButton = () => {
      if (quizStep > 1 && quizStep < 10) {
        return (
          <button 
            onClick={() => setQuizStep(prev => prev - 1)}
            className="mt-6 text-white/50 hover:text-white text-xs tracking-wider uppercase flex items-center gap-1 self-start font-sans"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            {t('home.quiz.back')}
          </button>
        );
      }
      return null;
    };

    // Calculate progress percentage
    const progress = (quizStep / 9) * 100;

    const progressHeader = (title) => (
      <div className="mb-6">
        <div className="w-full bg-white/10 h-1 mb-6 rounded-full overflow-hidden">
          <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <h3 className="text-white text-lg font-bold font-sans text-left uppercase tracking-wider">{title}</h3>
      </div>
    );

    if (quizStep === 1) {
      return (
        <div className="flex flex-col">
          {progressHeader(t('home.quiz.q1'))}
          <div className="grid grid-cols-2 gap-4">
            {['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map(opt => (
              <button 
                key={opt}
                onClick={() => handleQuizAnswer('age', opt)}
                className="bg-surface-container-low hover:bg-surface-container-high border border-white/5 py-4 px-6 text-center text-white text-sm font-sans tracking-wide transition-colors font-bold"
              >
                {opt}
              </button>
            ))}
          </div>
          {renderBackButton()}
        </div>
      );
    }

    if (quizStep === 2) {
      return (
        <div className="flex flex-col">
          {progressHeader(t('home.quiz.q2'))}
          <div className="grid grid-cols-2 gap-4">
            {['hetero', 'gay', 'lesbian', 'bi', 'queer', 'other'].map(opt => (
              <button 
                key={opt}
                onClick={() => handleQuizAnswer('identity', opt)}
                className="bg-surface-container-low hover:bg-surface-container-high border border-white/5 py-4 px-6 text-center text-white text-sm font-sans tracking-wide transition-colors font-bold"
              >
                {t('home.quiz.identity.' + opt)}
              </button>
            ))}
          </div>
          {renderBackButton()}
        </div>
      );
    }

    if (quizStep === 3) {
      const expOptions = [
        { key: 'new', label: t('home.quiz.exp_new'), desc: t('home.quiz.exp_new_desc') },
        { key: 'mid', label: t('home.quiz.exp_mid'), desc: t('home.quiz.exp_mid_desc') },
        { key: 'pro', label: t('home.quiz.exp_pro'), desc: t('home.quiz.exp_pro_desc') }
      ];
      return (
        <div className="flex flex-col">
          {progressHeader(t('home.quiz.q3'))}
          <div className="flex flex-col gap-4">
            {expOptions.map(opt => (
              <button 
                key={opt.key}
                onClick={() => handleQuizAnswer('experience', opt.key)}
                className="bg-surface-container-low hover:bg-surface-container-high border border-white/5 py-4 px-6 text-left text-white transition-colors"
              >
                <div className="font-bold text-sm font-sans mb-1 text-left">{opt.label}</div>
                <div className="text-white/60 text-xs font-sans leading-relaxed text-left">{opt.desc}</div>
              </button>
            ))}
          </div>
          {renderBackButton()}
        </div>
      );
    }

    if (quizStep === 4) {
      return (
        <div className="flex flex-col">
          {progressHeader(t('home.quiz.q4'))}
          <div className="flex flex-col gap-4">
            {['no', 'once', 'fan', 'others'].map(opt => (
              <button 
                key={opt}
                onClick={() => handleQuizAnswer('triedBrand', opt)}
                className="bg-surface-container-low hover:bg-surface-container-high border border-white/5 py-4 px-6 text-left text-white text-sm font-sans tracking-wide transition-colors font-bold"
              >
                {t('home.quiz.triedBrand.' + opt)}
              </button>
            ))}
          </div>
          {renderBackButton()}
        </div>
      );
    }

    if (quizStep === 5) {
      return (
        <div className="flex flex-col">
          {progressHeader(t('home.quiz.q5'))}
          <div className="grid grid-cols-2 gap-4">
            {['self', 'gift'].map(opt => (
              <button 
                key={opt}
                onClick={() => handleQuizAnswer('purpose', opt)}
                className="bg-surface-container-low hover:bg-surface-container-high border border-white/5 py-4 px-6 text-center text-white text-sm font-sans tracking-wide transition-colors font-bold"
              >
                {t('home.quiz.purpose.' + opt)}
              </button>
            ))}
          </div>
          {renderBackButton()}
        </div>
      );
    }

    if (quizStep === 6) {
      return (
        <div className="flex flex-col">
          {progressHeader(t('home.quiz.q6'))}
          <div className="flex flex-col gap-4">
            {['later', 'mid', 'high'].map(opt => (
              <button 
                key={opt}
                onClick={() => handleQuizAnswer('budget', opt)}
                className="bg-surface-container-low hover:bg-surface-container-high border border-white/5 py-4 px-6 text-left text-white text-sm font-sans tracking-wide transition-colors font-bold"
              >
                {t('home.quiz.budget.' + opt)}
              </button>
            ))}
          </div>
          {renderBackButton()}
        </div>
      );
    }

    if (quizStep === 7) {
      return (
        <div className="flex flex-col">
          {progressHeader(t('home.quiz.q7'))}
          <div className="grid grid-cols-2 gap-4">
            {['female', 'male'].map(opt => (
              <button 
                key={opt}
                onClick={() => handleQuizAnswer('orgasm', opt)}
                className="bg-surface-container-low hover:bg-surface-container-high border border-white/5 py-4 px-6 text-center text-white text-sm font-sans tracking-wide transition-colors font-bold"
              >
                {t('home.quiz.orgasm.' + opt)}
              </button>
            ))}
          </div>
          {renderBackButton()}
        </div>
      );
    }

    if (quizStep === 8) {
      return (
        <div className="flex flex-col">
          {progressHeader(t('home.quiz.q8'))}
          <div className="grid grid-cols-2 gap-4">
            {['solo', 'couple'].map(opt => (
              <button 
                key={opt}
                onClick={() => handleQuizAnswer('mode', opt)}
                className="bg-surface-container-low hover:bg-surface-container-high border border-white/5 py-4 px-6 text-center text-white text-sm font-sans tracking-wide transition-colors font-bold"
              >
                {t('home.quiz.mode.' + opt)}
              </button>
            ))}
          </div>
          {renderBackButton()}
        </div>
      );
    }

    if (quizStep === 9) {
      const isAnySelected = selectedStimulation.clitoris || selectedStimulation.penis;
      return (
        <div className="flex flex-col">
          {progressHeader(t('home.quiz.q9'))}
          <div className="flex flex-col gap-4 mb-6">
            <button 
              onClick={() => setSelectedStimulation(prev => ({ ...prev, clitoris: !prev.clitoris }))}
              className={`py-4 px-6 text-left text-white text-sm font-sans tracking-wide transition-colors flex items-center justify-between border ${selectedStimulation.clitoris ? 'bg-surface-container border-primary' : 'bg-surface-container-low hover:bg-surface-container-high border-white/5'}`}
            >
              <span className="font-bold">{t('home.quiz.clitoris')}</span>
              <span className="material-symbols-outlined text-primary">
                {selectedStimulation.clitoris ? 'check_box' : 'check_box_outline_blank'}
              </span>
            </button>
            <button 
              onClick={() => setSelectedStimulation(prev => ({ ...prev, penis: !prev.penis }))}
              className={`py-4 px-6 text-left text-white text-sm font-sans tracking-wide transition-colors flex items-center justify-between border ${selectedStimulation.penis ? 'bg-surface-container border-primary' : 'bg-surface-container-low hover:bg-surface-container-high border-white/5'}`}
            >
              <span className="font-bold">{t('home.quiz.penis')}</span>
              <span className="material-symbols-outlined text-primary">
                {selectedStimulation.penis ? 'check_box' : 'check_box_outline_blank'}
              </span>
            </button>
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <button 
              onClick={() => setQuizStep(8)}
              className="text-white/50 hover:text-white text-xs tracking-wider uppercase flex items-center gap-1 font-sans"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              {t('home.quiz.back')}
            </button>
            <button
              disabled={!isAnySelected}
              onClick={submitQuiz}
              className={`font-sans font-bold text-xs tracking-wider py-3 px-8 rounded-full transition-all uppercase ${isAnySelected ? 'bg-white hover:bg-gray-200 text-black cursor-pointer' : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
            >
              {t('home.quiz.submit')}
            </button>
          </div>
        </div>
      );
    }

    if (quizStep === 10) {
      const rec = getRecommendation();
      return (
        <div className="flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-4xl text-primary mb-3">celebration</span>
          <h3 className="text-white text-xl font-bold mb-2 font-sans">{t('home.quiz.success_title')}</h3>
          <p className="text-white/60 text-xs sm:text-sm mb-6">{t('home.quiz.success_subtitle')}</p>
          
          <div className="w-full bg-surface-container-low border border-white/5 p-6 rounded-card mb-6 flex flex-col items-center">
            <div className="w-32 h-32 mb-4 overflow-hidden rounded-card bg-black/20">
              <ResponsiveImage src={rec.image} alt={rec.name} className="w-full h-full object-cover" />
            </div>
            <h4 className="text-white font-bold text-base mb-1 tracking-wider uppercase font-sans">{rec.name}</h4>
            <p className="text-primary text-sm font-bold mb-3">{rec.price.toLocaleString('ru-KZ')} ₸</p>
            <p className="text-white/70 text-xs leading-relaxed max-w-sm">{rec.desc}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link 
              to={`/product/${rec.id}`}
              onClick={() => setQuizOpen(false)}
              className="flex-1 bg-white hover:bg-gray-200 text-black font-sans font-bold text-xs tracking-wider py-3.5 px-6 rounded-full text-center transition-colors uppercase"
            >
              {t('home.quiz.details')}
            </Link>
            <button 
              onClick={() => { setQuizStep(1); setSelectedStimulation({ clitoris: false, penis: false }); setQuizAnswers({}); }}
              className="flex-1 border border-white/20 hover:bg-white/5 text-white font-sans font-bold text-xs tracking-wider py-3.5 px-6 rounded-full text-center transition-colors uppercase"
            >
              {t('home.quiz.reset')}
            </button>
          </div>
        </div>
      );
    }
  };
  
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
      <section className="relative z-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Poster image shown behind the video for seamless transition */}
        <img 
          src={heroPoster} 
          alt="Hero Background Poster" 
          className="w-full h-screen object-cover absolute inset-0 -z-20"
        />

        {/* HTML5 Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={heroPoster}
          onPlay={() => setIsVideoLoaded(true)}
          className={`w-full h-screen object-cover absolute inset-0 -z-10 transition-opacity duration-1000 ${
            isVideoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src={heroVideo} type="video/webm" />
          {/* Fallback to responsive image if video is not supported */}
          <img src={heroBg} alt="Hero Fallback" className="w-full h-full object-cover" />
        </video>

        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/40 -z-10" />

        {/* Bottom gradient fade for transition to black content */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent z-[1]" />

        <motion.div
          className="relative z-10 text-center flex flex-col items-center px-4"
          initial="hidden" animate="visible" variants={stagger}
        >
          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[44px] sm:text-[68px] md:text-[86px] lg:text-[100px] font-extralight tracking-[0.3em] text-white uppercase leading-none select-none font-sans mr-[-0.3em]"
          >
            HOT STUFF
          </motion.h1>

          {/* Slogan */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="text-[12px] sm:text-[14px] md:text-[16px] tracking-[0.4em] uppercase text-white/80 mt-6 mb-12 select-none mr-[-0.4em]"
          >
            {t('home.magic_sensuality')}
          </motion.p>
 
           {/* CTA */}
           <motion.div
             variants={fadeUp}
             transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
           >
             <Link 
               to="/catalog" 
               className="border border-white hover:bg-white hover:text-black font-sans font-bold text-[11px] tracking-[0.25em] py-4.5 px-12 uppercase transition-all duration-300 active:scale-95 inline-block text-white"
             >
               {t('checkout.back_to_catalog')}
             </Link>
           </motion.div>
         </motion.div>
       </section>
 
       {/* Removed redundant/pulsing Product Skeletons Grid */}
       
       {/* ═══ TRUST GRID SECTION ═══ */}
       <section className="bg-black py-12 px-6">
         <div className="container-hs">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
             {[
               {
                 icon: 'inventory_2',
                 title: t('home.features.anon_title'),
                 desc: t('home.features.anon_desc')
               },
               {
                 icon: 'local_shipping',
                 title: t('home.features.free_title'),
                 desc: t('home.features.free_desc')
               },
               {
                 icon: 'health_and_safety',
                 title: t('home.features.safe_title'),
                 desc: t('home.features.safe_desc')
               },
               {
                 icon: 'verified',
                 title: t('home.features.warranty_title'),
                 desc: t('home.features.warranty_desc')
               }
             ].map((item, idx) => (
               <div key={idx} className="flex gap-4 items-start text-left">
                 <span className="material-symbols-outlined text-[24px] text-[#f2ca50] flex-none mt-0.5">
                   {item.icon}
                 </span>
                 <div className="flex flex-col">
                   <h3 className="font-sans font-bold text-[11px] tracking-wider text-white uppercase mb-1">
                     {item.title}
                   </h3>
                   <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                     {item.desc}
                   </p>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </section>
 
       {/* ═══ BRAND INTRODUCTION SECTION ═══ */}
       <section className="bg-background py-20 px-6">
         <div className="max-w-3xl mx-auto text-center">
           <p className="text-base md:text-lg text-white font-medium leading-relaxed max-w-2xl mx-auto font-sans tracking-wide">
             {t('home.magic_desc')}
           </p>
         </div>
       </section>

      {/* ═══ POPULAR CATEGORIES / TOYS (Horizontal Scroll) ═══ */}
      <section className="bg-background py-16">
        <div className="container-hs">
          <h2 className="font-sans font-black text-[16px] md:text-[30px] tracking-[0.15em] text-white uppercase mb-8">
            {t('home.popular_cats')}
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
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="min-w-[85vw] sm:min-w-[45vw] md:min-w-[35vw] lg:min-w-[32vw] snap-start relative aspect-[4/3] group overflow-hidden border border-white/5"
            >
              {/* Product Background Image */}
              <ResponsiveImage 
                src={getCategoryImage(cat.slug)} 
                alt={cat.name} 
                className="w-full h-full object-cover brightness-[0.8] group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              {/* Overlay with title & CTA button */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end items-start">
                <h3 className="text-white font-bold text-lg md:text-xl mb-4">
                  {t('menu.' + cat.name.toLowerCase(), cat.name)}
                </h3>
                <Link 
                  to={getCategoryLink(cat.slug)} 
                  className="bg-white text-black font-label-caps text-[10px] font-black tracking-widest py-3 px-8 transition-transform hover:scale-105"
                >
                  {t('product.view')}
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
       <section className="bg-background py-16">
         <div className="container-hs">
           <h2 className="font-sans font-black text-[16px] md:text-[30px] tracking-[0.15em] text-white uppercase mb-8">
             {t('home.bestsellers')}
           </h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
             {displayedProducts.map((p) => (
               <div key={p.id} className="relative group rounded-card">
                 {/* Background and border that expands on hover */}
                 <div className="absolute inset-0 bg-surface-container-low border border-white/5 transition-all duration-300 md:group-hover:-bottom-[68px] z-0 pointer-events-none rounded-card"></div>
                 
                 <div className="relative z-10 flex flex-col h-full rounded-card overflow-hidden">
                   <Link to={`/product/${p.id}`} className="block relative overflow-hidden aspect-[3/4] rounded-t-card">
                     <ResponsiveImage src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                   </Link>
                   
                   <div className="p-4 flex flex-col">
                     {p.socialProof && (
                       <span className="text-[8px] sm:text-[9px] text-[#f2ca50] font-sans font-bold tracking-wider uppercase mb-1.5 block">
                         {getSocialProofTranslation(p.socialProof)}
                       </span>
                     )}
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
                         {t('product.preview')}
                       </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
         </div>
       </section>
 
       {/* ═══ HOTSPOTS LOOKBOOK ═══ */}
       <HotspotsLookbook onAddToCart={onAddToCart} onSelectQuickView={setSelectedPreviewProduct} />

       {/* ═══ INA THRUST PROMO BANNER ═══════════════ */}
       <section className="relative w-full aspect-[21/9] min-h-[350px] md:min-h-[500px] flex items-center overflow-hidden">
         <ResponsiveImage 
           src={logoInaThrustPromo} 
           alt="INA™ Thrust" 
           className="absolute inset-0 w-full h-full object-cover opacity-80" 
           loading="lazy" 
         />
         {/* Gradients to match screenshot */}
         <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
         
         <div className="relative z-10 w-full container-hs flex flex-col items-start px-6 md:px-12 lg:px-16 text-left">
           <h2 className="text-white text-[28px] sm:text-[40px] md:text-[48px] lg:text-[56px] font-black leading-tight mb-2 max-w-lg font-sans">
             {t('home.promo_title')}
           </h2>
           <p className="text-white text-[11px] sm:text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-8">
             INA™ Thrust
           </p>
           <Link 
             to="/product/1" 
             className="bg-white text-black font-sans font-bold text-[11px] sm:text-[12px] tracking-[0.2em] py-4 px-10 uppercase transition-all hover:bg-gray-200 inline-block"
           >
             {t('home.promo_btn')}
           </Link>
         </div>
       </section>
 
       {/* ═══ QUIZ SECTION ══════════════════════════ */}
       <section className="bg-black py-16 md:py-24">
         <div className="container-hs grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
           {/* Left Column: Image with sharp corners (brand rule) */}
           <div className="w-full aspect-[4/3] md:aspect-square overflow-hidden rounded-none border border-white/10">
             <ResponsiveImage 
               src={logoQuizBg} 
               alt={t('home.quiz.title')} 
               className="w-full h-full object-cover brightness-95"
               loading="lazy"
             />
           </div>
 
           {/* Right Column: Text & CTA */}
           <div className="flex flex-col items-start text-left max-w-xl">
             <h2 className="text-white text-[32px] sm:text-[40px] md:text-[48px] font-black leading-tight mb-6 uppercase tracking-wider font-sans">
               {t('home.quiz.title')}
             </h2>
             <h3 className="text-white text-base sm:text-lg md:text-xl font-bold mb-4 font-sans">
               {t('home.quiz.subtitle')}
             </h3>
             <p className="text-white/60 text-xs sm:text-sm md:text-base leading-relaxed mb-8">
               {t('home.quiz.desc')}
             </p>
             <button 
               onClick={() => { setQuizAnswers({}); setSelectedStimulation({ clitoris: false, penis: false }); setQuizStep(1); setQuizOpen(true); }}
               className="border border-white hover:bg-white hover:text-black text-white font-sans font-bold text-xs sm:text-sm tracking-[0.2em] py-3 px-10 rounded-full transition-all bg-transparent cursor-pointer"
             >
               {t('home.quiz.start')}
             </button>
           </div>
         </div>
       </section>
 
       {/* ═══ BRAND QUOTE ═══════════════════════════ */}
       <section className="relative py-section-gap overflow-hidden">
         <div className="absolute inset-0 bg-black" />
         <div
           className="absolute top-0 right-0 w-[400px] h-[400px] opacity-[0.03]"
           style={{ background: 'radial-gradient(circle, #f2ca50, transparent 70%)' }}
         />
         <motion.div
           className="container-hs relative z-10 max-w-3xl mx-auto text-center"
           initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
         >
           <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="label-caps text-primary mb-8">
             {t('home.quote_title', 'PHILOSOPHY')}
           </motion.p>
           <motion.blockquote
             variants={fadeUp} transition={{ duration: 0.6, delay: 0.1 }}
             className="text-headline-lg md:text-headline-lg text-headline-lg-mobile text-on-surface italic"
           >
             {t('home.quote')}
           </motion.blockquote>
           <motion.div variants={fadeUp} transition={{ duration: 0.4, delay: 0.2 }}>
             <div className="underline-gold mx-auto mt-6" />
           </motion.div>
         </motion.div>
       </section>
 
       {/* ═══ NEWSLETTER ════════════════════════════ */}
       <section className="relative w-full aspect-[21/9] min-h-[400px] md:min-h-[500px] flex items-center justify-center overflow-hidden">
         <ResponsiveImage 
           src={logoNewsletterBg} 
           alt="Newsletter Discount" 
           className="absolute inset-0 w-full h-full object-cover opacity-80" 
           loading="lazy" 
         />
         {/* Dark mask overlay to replicate LELO style */}
         <div className="absolute inset-0 bg-black/40" />
         <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
 
         <div className="relative z-10 max-w-3xl mx-auto px-6 text-center flex flex-col items-center">
           <h2 className="text-white text-[28px] sm:text-[36px] md:text-[48px] lg:text-[56px] font-black leading-tight mb-4 lowercase font-sans">
             {t('home.newsletter.title')}
           </h2>
           <p className="text-white text-xs sm:text-sm md:text-base leading-relaxed mb-8 max-w-2xl">
             {t('home.newsletter.desc')}
           </p>
 
           <form className="w-full max-w-xl flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
             <div className="flex flex-row w-full h-12 sm:h-14">
               <input
                 type="email"
                 placeholder={t('home.newsletter.placeholder')}
                 required
                 className="flex-1 bg-white px-5 text-black placeholder-gray-500 text-xs sm:text-sm outline-none font-sans"
               />
               <button 
                 type="submit" 
                 className="bg-black hover:bg-neutral-900 text-white font-sans font-bold text-xs sm:text-sm tracking-widest px-6 sm:px-10 uppercase transition-colors flex-none"
               >
                 {t('home.newsletter.subscribe_btn')}
               </button>
             </div>
             
             <label className="flex items-center justify-center gap-2 text-[10px] sm:text-xs text-white/90 select-none cursor-pointer">
               <input 
                 type="checkbox" 
                 required 
                 className="accent-primary w-4 h-4 rounded border-white/20 bg-transparent text-primary focus:ring-0 focus:ring-offset-0" 
               />
               <span>
                 {t('home.newsletter.accept')}
                 <a href="/privacy" className="underline hover:text-white transition-colors">
                   {t('home.newsletter.policy_link')}
                 </a>
                 .
               </span>
             </label>
           </form>
         </div>
       </section>

      {/* Product Preview Modal */}
      <ProductPreviewModal 
        product={selectedPreviewProduct}
        isOpen={!!selectedPreviewProduct}
        onClose={() => setSelectedPreviewProduct(null)}
        onAddToCart={onAddToCart}
      />

      {/* Quiz Modal Portal */}
      {quizOpen && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[250] flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-[#121212] border border-white/10 w-full max-w-xl p-8 rounded-none relative flex flex-col">
            <button 
              onClick={() => setQuizOpen(false)} 
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
            {renderQuizContent()}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
