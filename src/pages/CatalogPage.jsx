import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

// Import local product images generated according to Stitch design screenshot
import noirSilhouetteDress from '../assets/images/products/noir_silhouette_dress.png';
import etherealSilkWrap from '../assets/images/products/ethereal_silk_wrap.png';
import goldTrimmedBoots from '../assets/images/products/gold_trimmed_boots.png';

/* ── Real products from the Stitch design screenshot ── */
const ALL_PRODUCTS = [
  { 
    id: 1, 
    name: 'NOIR SILHOUETTE DRESS', 
    price: 210000, 
    category: 'vibrators', 
    image: noirSilhouetteDress, 
    colors: ['#4A4A4A', '#2D5E87', '#B8860B'] 
  },
  { 
    id: 2, 
    name: 'ETHEREAL SILK WRAP', 
    price: 92500, 
    category: 'vibrators', 
    image: etherealSilkWrap, 
    colors: ['#FFFFFF', '#FFD700'] 
  },
  { 
    id: 3, 
    name: 'GOLD-TRIMMED BOOTS', 
    price: 280000, 
    category: 'vibrators', 
    image: goldTrimmedBoots, 
    colors: ['#FFD700', '#4A4A4A'] 
  },
  { 
    id: 4, 
    name: 'VELVET MIDNIGHT CLOAK', 
    price: 445000, 
    category: 'massagers', 
    image: noirSilhouetteDress, 
    colors: ['#4A4A4A', '#2D5E87', '#B8860B'] 
  },
  { 
    id: 5, 
    name: 'AURA GOLD NECKLACE', 
    price: 64500, 
    category: 'wellness', 
    image: etherealSilkWrap, 
    colors: ['#FFFFFF', '#FFD700'] 
  },
  { 
    id: 6, 
    name: 'SATIN EVENING HEELS', 
    price: 170000, 
    category: 'couples', 
    image: goldTrimmedBoots, 
    colors: ['#FFD700', '#4A4A4A'] 
  },
];

const FILTERS = [
  { key: 'all',       label: 'КАТЕГОРИЯ' },
  { key: 'vibrators', label: 'ВИБРАТОРЫ' },
  { key: 'massagers', label: 'МАССАЖЁРЫ' },
  { key: 'couples',   label: 'ДЛЯ ПАР' },
  { key: 'wellness',  label: 'WELLNESS' },
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

export default function CatalogPage({ onAddToCart }) {
  const [params] = useSearchParams();
  const initialCat = params.get('cat') || 'all';
  const [activeCat, setActiveCat] = useState(initialCat);
  const [visibleCount, setVisibleCount] = useState(6);

  const filtered = useMemo(() => {
    if (activeCat === 'all') return ALL_PRODUCTS;
    return ALL_PRODUCTS.filter(p => p.category === activeCat);
  }, [activeCat]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="page-enter pt-[80px]">
      {/* ═══ HERO TITLE ═══════════════════════════ */}
      <section className="text-center pt-16 pb-8 bg-background">
        <h1 className="text-[54px] md:text-[72px] font-black tracking-[0.2em] text-on-surface uppercase leading-none font-headline-lg">
          BESTSELLERS
        </h1>
        <p className="text-xs tracking-[0.1em] text-on-surface-variant font-medium mt-4">
          Наши самые популярные модели для вашего удовольствия
        </p>
      </section>

      {/* ═══ FILTER BAR (Matching Stitch Screen) ═══════════════════ */}
      <div className="container-hs">
        <div className="filter-bar flex justify-between items-center py-2 border-t border-b border-white/10">
          <div className="flex gap-6">
            <div className="relative group">
              <button className="flex items-center gap-2 font-label-caps text-xs tracking-widest text-on-surface py-3">
                КАТЕГОРИЯ
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
            </div>
            <div className="relative group">
              <button className="flex items-center gap-2 font-label-caps text-xs tracking-widest text-on-surface py-3">
                МАТЕРИАЛ
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
            </div>
            <div className="relative group">
              <button className="flex items-center gap-2 font-label-caps text-xs tracking-widest text-on-surface py-3">
                ОСОБЕННОСТИ
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
            </div>
          </div>

          <div>
            <button className="flex items-center gap-2 font-label-caps text-xs tracking-widest text-on-surface py-3">
              СОРТИРОВКА
              <span className="material-symbols-outlined text-[16px]">swap_vert</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ PRODUCT GRID ══════════════════════════ */}
      <section className="container-hs py-12">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-8"
          initial="hidden" animate="visible" variants={stagger}
          key={activeCat}
        >
          {visible.map((p, i) => (
            <motion.div key={p.id} variants={fadeUp} transition={{ duration: 0.45 }}>
              <div className="product-card block relative">
                {/* Heart / Favorite Button */}
                <button className="absolute top-4 right-4 z-20 text-on-surface/60 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined font-light text-[22px]">favorite_border</span>
                </button>
                
                <Link to={`/product/${p.id}`} className="block">
                  <div className="product-card-image aspect-[3/4] relative overflow-hidden bg-surface-container-low border border-white/5">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                </Link>
                
                <div className="product-card-info text-center pt-4">
                  <Link to={`/product/${p.id}`} className="block">
                    <h3 className="product-card-name font-bold text-sm tracking-widest text-on-surface uppercase mb-1">
                      {p.name}
                    </h3>
                  </Link>
                  <p className="product-card-price text-xs text-on-surface-variant mb-3">
                    {p.price.toLocaleString('ru-KZ')} ₸
                  </p>
                  {/* Color dots */}
                  <div className="flex items-center justify-center gap-2">
                    {p.colors.map(c => (
                      <span key={c} className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ background: c }} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Load more */}
        {hasMore && (
          <div className="text-center mt-16">
            <button
              className="bg-white text-black font-label-caps text-xs tracking-widest py-4 px-12 border border-white hover:bg-transparent hover:text-white transition-all"
              onClick={() => setVisibleCount(v => v + 3)}
            >
              ПОКАЗАТЬ ЕЩЁ
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
