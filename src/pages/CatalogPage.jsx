import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ── Mock products ─────────────────────────────── */
const ALL_PRODUCTS = [
  { id: 1,  name: 'Lush Sensation',  price: 42900, category: 'vibrators',  emoji: '🌸', colors: ['#1a1a1a','#C4A661','#8B4557'] },
  { id: 2,  name: 'Velvet Noir',     price: 54900, category: 'vibrators',  emoji: '🖤', colors: ['#1a1a1a','#4A3C5C'] },
  { id: 3,  name: 'Bloom Essence',   price: 38900, category: 'massagers',  emoji: '🌺', colors: ['#C4A661','#8B4557','#E5E2E1'] },
  { id: 4,  name: 'Silk Wave',       price: 62900, category: 'couples',    emoji: '🌊', colors: ['#1a1a1a','#355E5C'] },
  { id: 5,  name: 'Golden Hour',     price: 47900, category: 'vibrators',  emoji: '☀️', colors: ['#C4A661'] },
  { id: 6,  name: 'Midnight Pulse',  price: 51900, category: 'massagers',  emoji: '🌙', colors: ['#1a1a1a','#2D2D6B'] },
  { id: 7,  name: 'Aura Bliss',      price: 35900, category: 'wellness',   emoji: '🌿', colors: ['#355E5C','#C4A661'] },
  { id: 8,  name: 'Ember Touch',     price: 59900, category: 'couples',    emoji: '🔥', colors: ['#1a1a1a','#8B4557'] },
  { id: 9,  name: 'Crystal Dew',     price: 44900, category: 'wellness',   emoji: '💎', colors: ['#E5E2E1','#C4A661'] },
  { id: 10, name: 'Obsidian Flow',   price: 69900, category: 'vibrators',  emoji: '⬛', colors: ['#1a1a1a'] },
  { id: 11, name: 'Pearl Mist',      price: 39900, category: 'massagers',  emoji: '🤍', colors: ['#E5E2E1','#C4A661'] },
  { id: 12, name: 'Nova Spark',      price: 55900, category: 'couples',    emoji: '✨', colors: ['#C4A661','#8B4557'] },
];

const FILTERS = [
  { key: 'all',       label: 'ВСЕ' },
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
  const [visibleCount, setVisibleCount] = useState(8);

  const filtered = useMemo(() => {
    if (activeCat === 'all') return ALL_PRODUCTS;
    return ALL_PRODUCTS.filter(p => p.category === activeCat);
  }, [activeCat]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="page-enter pt-[80px]">
      {/* ═══ HERO BANNER ═══════════════════════════ */}
      <section className="relative h-[50vh] min-h-[320px] flex items-center justify-center bg-surface-container-lowest overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ background: 'radial-gradient(ellipse at center, #f2ca50, transparent 60%)' }}
        />
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="label-caps text-primary mb-4">COLLECTION</p>
          <h1 className="text-display-lg md:text-display-lg text-headline-lg-mobile">
            {activeCat === 'all' ? 'Каталог' : FILTERS.find(f => f.key === activeCat)?.label || 'Каталог'}
          </h1>
        </motion.div>
      </section>

      {/* ═══ FILTERS ═══════════════════════════════ */}
      <div className="container-hs">
        <div className="filter-bar">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`filter-btn ${activeCat === f.key ? 'text-primary' : ''}`}
              onClick={() => { setActiveCat(f.key); setVisibleCount(8); }}
            >
              {f.label}
              <span className="material-symbols-outlined text-base">
                {activeCat === f.key ? 'check' : 'expand_more'}
              </span>
            </button>
          ))}

          {/* Sort (right) */}
          <div className="ml-auto hidden md:flex">
            <button className="filter-btn border-r-0 border-l border-white/[0.08]">
              СОРТИРОВКА
              <span className="material-symbols-outlined text-base">unfold_more</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ PRODUCT GRID ══════════════════════════ */}
      <section className="container-hs py-16">
        <motion.div
          className="product-grid-4"
          initial="hidden" animate="visible" variants={stagger}
          key={activeCat} // re-animate on filter change
        >
          {visible.map((p, i) => (
            <motion.div key={p.id} variants={fadeUp} transition={{ duration: 0.45 }}>
              <Link to={`/product/${p.id}`} className="product-card block">
                <div className="product-card-image">
                  <div className="product-card-placeholder">{p.emoji}</div>
                </div>
                <div className="product-card-info">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {p.colors.map(c => (
                      <span key={c} className="color-dot" style={{ background: c }} />
                    ))}
                  </div>
                  <p className="product-card-name">{p.name}</p>
                  <p className="product-card-price">{p.price.toLocaleString('ru-KZ')} ₸</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Load more */}
        {hasMore && (
          <div className="text-center mt-16">
            <button
              className="btn-outline"
              onClick={() => setVisibleCount(v => v + 4)}
            >
              ПОКАЗАТЬ ЕЩЁ
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
