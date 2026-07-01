import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import category1Webm from '../../assets/category-1.webm';
import category1Mp4 from '../../assets/category-1.mp4';
import category1Poster from '../../assets/category-1-poster.webp';

const CATEGORIES = [
  {
    id: 'lingerie-classic',
    title: {
      ru: 'Классическое нижнее белье',
      en: 'Classic Lingerie',
      kk: 'Классикалық іш киім'
    },
    buttonText: {
      ru: 'Посмотреть коллекцию',
      en: 'View collection',
      kk: 'Коллекцияны көру'
    },
    image: 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?q=80&w=1200&auto=format&fit=crop',
    videoWebm: category1Webm,
    videoMp4: category1Mp4,
    videoPoster: category1Poster,
    link: '/catalog?cat=lingerie-classic'
  },
  {
    id: 'toys-women',
    title: {
      ru: 'Игрушки для женщин',
      en: 'Toys for Women',
      kk: 'Әйелдерге арналған ойыншықтар'
    },
    buttonText: {
      ru: 'Посмотреть коллекцию',
      en: 'View collection',
      kk: 'Коллекцияны көру'
    },
    image: '/images/toys_for_women.png',
    link: '/catalog?cat=toys-women'
  },
  {
    id: 'toys-men',
    title: {
      ru: 'Игрушки для мужчин',
      en: 'Toys for Men',
      kk: 'Ерлерге арналған ойыншықтар'
    },
    buttonText: {
      ru: 'Посмотреть коллекцию',
      en: 'View collection',
      kk: 'Коллекцияны көру'
    },
    image: '/images/toys_for_men.png',
    link: '/catalog?cat=toys-men'
  },
  {
    id: 'lingerie-erotic',
    title: {
      ru: 'Эротическое белье и одежда',
      en: 'Erotic Lingerie & Apparel',
      kk: 'Эротикалық іш киім және киім'
    },
    buttonText: {
      ru: 'Посмотреть коллекцию',
      en: 'View collection',
      kk: 'Коллекцияны көру'
    },
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    link: '/catalog?cat=lingerie-erotic'
  },
  {
    id: 'toys-couples',
    title: {
      ru: 'Игрушки для пар',
      en: 'Toys for Couples',
      kk: 'Жұптарға арналған ойыншықтар'
    },
    buttonText: {
      ru: 'Посмотреть коллекцию',
      en: 'View collection',
      kk: 'Коллекцияны көру'
    },
    image: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?q=80&w=1200&auto=format&fit=crop',
    link: '/catalog?cat=toys-couples'
  },
  {
    id: 'toys-anal',
    title: {
      ru: 'Анальные игрушки',
      en: 'Anal Toys',
      kk: 'Анальді ойыншықтар'
    },
    buttonText: {
      ru: 'Посмотреть коллекцию',
      en: 'View collection',
      kk: 'Коллекцияны көру'
    },
    image: 'https://images.unsplash.com/photo-1581022295087-35e593704911?q=80&w=1200&auto=format&fit=crop',
    link: '/catalog?cat=toys-anal'
  },
  {
    id: 'bdsm-fetish',
    title: {
      ru: 'БДСМ и фетиш',
      en: 'BDSM & Fetish',
      kk: 'БДСМ және фетиш'
    },
    buttonText: {
      ru: 'Посмотреть коллекцию',
      en: 'View collection',
      kk: 'Коллекцияны көру'
    },
    image: 'https://images.unsplash.com/photo-1598460655519-0639903b41d2?q=80&w=1200&auto=format&fit=crop',
    link: '/catalog?cat=bdsm-fetish'
  },
  {
    id: 'lubricants-cosmetics',
    title: {
      ru: 'Лубриканты и интимная косметика',
      en: 'Lubricants & Cosmetics',
      kk: 'Лубриканттар мен интимдік косметика'
    },
    buttonText: {
      ru: 'Посмотреть коллекцию',
      en: 'View collection',
      kk: 'Коллекцияны көру'
    },
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=1200&auto=format&fit=crop',
    link: '/catalog?cat=lubricants-cosmetics'
  },
  {
    id: 'hot-stuff-store',
    title: {
      ru: 'Магазин Hot Stuff',
      en: 'Hot Stuff Store',
      kk: 'Hot Stuff дүкені'
    },
    buttonText: {
      ru: 'Осмотреть наш магазин',
      en: 'Explore our store',
      kk: 'Дүкенді аралау'
    },
    image: 'https://images.unsplash.com/photo-1555529733-0e670560f7e1?q=80&w=1200&auto=format&fit=crop',
    link: '/catalog'
  }
];

function CategoryBlock({ cat, lang, isSplit = false }) {
  const currentLang = lang || 'ru';
  const title = cat.title[currentLang] || cat.title['ru'];
  const buttonText = cat.buttonText[currentLang] || cat.buttonText['ru'];
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  return (
    <div className={`relative w-full overflow-hidden ${isSplit ? 'aspect-[3/4] md:h-[80vh]' : 'aspect-[3/4] md:h-[90vh]'}`}>
      {/* Background Image/Video */}
      <div className="absolute inset-0 w-full h-full z-0">
        {cat.videoWebm || cat.videoMp4 ? (
          <>
            <img 
              src={cat.videoPoster || cat.image} 
              alt={title} 
              className="w-full h-full object-cover absolute inset-0 -z-20"
            />
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={cat.videoPoster || cat.image}
              onPlay={() => setIsVideoLoaded(true)}
              className={`w-full h-full object-cover absolute inset-0 -z-10 transition-opacity duration-1000 ${
                isVideoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {cat.videoWebm && <source src={cat.videoWebm} type="video/webm" />}
              {cat.videoMp4 && <source src={cat.videoMp4} type="video/mp4" />}
              <img src={cat.videoPoster || cat.image} alt={title} className="w-full h-full object-cover" />
            </video>
          </>
        ) : (
          <img 
            src={cat.image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>
      
      {/* Native Sticky Container */}
      <div className="relative w-full h-full pointer-events-none z-10 flex flex-col justify-start pb-12 pt-[30vh]">
        <div className="sticky top-[20vh] w-full px-6 md:px-12 flex flex-col items-start text-left pointer-events-auto h-fit">
          <div className="overflow-hidden mb-4 sm:mb-6 pb-2">
            <motion.h2 
              initial={{ y: "100%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={`font-sans font-bold uppercase tracking-tight text-white max-w-2xl lg:max-w-4xl leading-[1.05] ${isSplit ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl'}`}
            >
              {title}
            </motion.h2>
          </div>
          
          <div className="overflow-hidden pb-4">
            <motion.div
              initial={{ y: "100%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to={cat.link} className="inline-block bg-black/80 backdrop-blur-md hover:bg-white text-white hover:text-black transition-colors duration-300 px-6 sm:px-8 py-3 sm:py-4 rounded-full uppercase tracking-widest text-[9px] sm:text-[10px] font-bold border border-white/20 hover:border-white">
                {buttonText}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoryBlocks({ part = 1 }) {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'ru';

  const part1Items = useMemo(() => [CATEGORIES[0]], []);
  const splitItems = useMemo(() => [CATEGORIES[1], CATEGORIES[2]], []); // Women, Men
  const part2Items = useMemo(() => [CATEGORIES[3]], []); // Erotic Lingerie
  const part3Items = useMemo(() => CATEGORIES.slice(4), []); // Couples, Anal, BDSM, Lubricants, Store

  if (part === 1) {
    return (
      <div className="w-full flex flex-col">
        {/* Block 1: Classic Lingerie */}
        {part1Items.map((cat) => (
          <CategoryBlock key={cat.id} cat={cat} lang={lang} />
        ))}
        {/* Block 2: Split 50/50 Toys Women & Men */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-0">
          <CategoryBlock cat={splitItems[0]} lang={lang} isSplit={true} />
          <CategoryBlock cat={splitItems[1]} lang={lang} isSplit={true} />
        </div>
      </div>
    );
  }

  if (part === 2) {
    return (
      <div className="w-full flex flex-col">
        {/* Block 3: Erotic Lingerie */}
        {part2Items.map((cat) => (
          <CategoryBlock key={cat.id} cat={cat} lang={lang} />
        ))}
      </div>
    );
  }

  // Part 3: Couples, Anal, BDSM, etc.
  return (
    <div className="w-full flex flex-col">
      {part3Items.map((cat) => (
        <CategoryBlock key={cat.id} cat={cat} lang={lang} />
      ))}
    </div>
  );
}
