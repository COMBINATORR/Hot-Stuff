import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCategories } from '../../contexts/CategoriesContext';
import ResponsiveImage from '../ResponsiveImage';

import logoNoirDress from '../../assets/images/products/noir_silhouette_dress.png';
import logoEtherealWrap from '../../assets/images/products/ethereal_silk_wrap.png';
import logoGoldBoots from '../../assets/images/products/gold_trimmed_boots.png';

export default function PopularCategories() {
  const { t } = useTranslation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const { categories: contextCategories } = useCategories();

  const defaultCategories = [
    { id: 1, name: 'Классическое нижнее белье', slug: 'lingerie-classic' },
    { id: 2, name: 'Эротическое белье и одежда', slug: 'lingerie-erotic' },
    { id: 3, name: 'Игрушки для женщин', slug: 'toys-women' },
    { id: 4, name: 'Игрушки для мужчин', slug: 'toys-men' }
  ];

  const categories = contextCategories && contextCategories.length > 0
    ? contextCategories.slice(0, 4)
    : defaultCategories;

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
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
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
  );
}
