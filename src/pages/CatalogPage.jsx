import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { supabase } from '../lib/supabaseClient.js';

/* ── Category pills data ─────────────────── */
const CATEGORIES = [
  { id: 'all',      label: 'Все товары' },
  { id: 'new',      label: 'Новинки' },
  { id: 'sale',     label: 'Скидки' },
  { id: 'popular',  label: 'Хиты продаж' },
  { id: 'gift',     label: 'Подарки' },
];

/* ── Sort options ────────────────────────── */
const SORTS = [
  { id: 'default',   label: 'По умолчанию' },
  { id: 'price_asc', label: 'Цена ↑' },
  { id: 'price_desc','label': 'Цена ↓' },
  { id: 'name',      label: 'По названию' },
];

/* ── Mock products (Supabase fallback) ───── */
const MOCK_PRODUCTS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Товар №${i + 1}`,
  category: CATEGORIES[1 + (i % (CATEGORIES.length - 1))].id,
  description: 'Премиальный товар из нашего каталога. Высокое качество, быстрая доставка.',
  price: [3200, 5500, 8900, 12500, 18000, 24990][i % 6],
  stock: (i % 3 === 0) ? 0 : 10,
  is_new: i % 4 === 0,
  is_sale: i % 5 === 0,
  sale_pct: i % 5 === 0 ? 20 : null,
  image_url: null,
}));

/* ── Product Card ────────────────────────── */
function ProductCard({ product, onAddToCart }) {
  const isSoldOut = product.stock === 0;

  return (
    <motion.article
      className="product-card"
      whileHover={!isSoldOut ? { y: -4 } : {}}
      transition={{ duration: 0.25 }}
      aria-label={product.name}
    >
      {/* Image area */}
      <div className="product-card-image">
        {product.image_url
          ? <img src={product.image_url} alt={product.name} className="interactive" />
          : (
            <div className="product-card-placeholder">
              <span>📦</span>
            </div>
          )
        }

        {/* Badges */}
        {product.is_new && !product.is_sale && (
          <span className="product-card-badge">Новинка</span>
        )}
        {product.is_sale && (
          <span className="product-card-badge" style={{ background: '#e53e3e' }}>
            −{product.sale_pct}%
          </span>
        )}
        {isSoldOut && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#fff', background: 'rgba(0,0,0,0.6)',
              padding: '0.4rem 0.9rem', borderRadius: 6,
            }}>Нет в наличии</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="product-card-body">
        <p className="product-card-category">
          {CATEGORIES.find(c => c.id === product.category)?.label || 'Товар'}
        </p>
        <h2 className="product-card-name">{product.name}</h2>
        <p className="product-card-desc">{product.description}</p>

        <div className="product-card-footer">
          <div>
            {product.is_sale && (
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.8rem', color: 'var(--text-muted)',
                textDecoration: 'line-through', marginBottom: '1px',
                display: 'block',
              }}>
                {Math.round(product.price / (1 - product.sale_pct / 100)).toLocaleString('ru-KZ')} ₸
              </span>
            )}
            <span className="product-card-price">
              {product.price.toLocaleString('ru-KZ')} ₸
            </span>
          </div>

          {!isSoldOut ? (
            <motion.button
              className="btn-cart"
              whileTap={{ scale: 0.92 }}
              onClick={() => onAddToCart(product)}
              aria-label={`Добавить ${product.name} в корзину`}
              title="В корзину"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </motion.button>
          ) : (
            <button
              className="btn btn-outline btn-sm"
              disabled
              style={{ opacity: 0.45, cursor: 'not-allowed' }}
            >
              Нет в наличии
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* ── Skeleton card ───────────────────────── */
function SkeletonCard() {
  return (
    <div className="product-card" style={{ pointerEvents: 'none' }}>
      <div className="product-card-image" style={{
        background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--border-subtle) 50%, var(--bg-secondary) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }} />
      <div className="product-card-body" style={{ gap: '0.75rem' }}>
        {[80, 60, 90, 50].map((w, i) => (
          <div key={i} style={{
            height: 12, width: `${w}%`, borderRadius: 6,
            background: 'var(--border-subtle)',
          }} />
        ))}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sort, setSort] = useState('default');
  const [cartNotice, setCartNotice] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (!error && data?.length > 0) {
          setProducts(data);
        } else {
          setProducts(MOCK_PRODUCTS);
        }
      } catch {
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  /* Filter + sort */
  const displayed = [...products]
    .filter(p => activeCategory === 'all' || p.category === activeCategory)
    .sort((a, b) => {
      if (sort === 'price_asc')  return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      if (sort === 'name')       return a.name.localeCompare(b.name, 'ru');
      return 0;
    });

  /* Add to cart (placeholder) */
  const handleAddToCart = (product) => {
    setCartNotice(product.name);
    setTimeout(() => setCartNotice(null), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Hot Stuff — Каталог товаров</title>
        <meta name="description" content="Весь ассортимент Hot Stuff. Быстрая доставка, оплата Kaspi Pay." />
      </Helmet>

      <Header />

      {/* Category navigation strip — sticky under header */}
      <div className="category-strip" aria-label="Фильтр по категориям">
        <div className="container-hs">
          <div className="category-pills" role="list">
            {CATEGORIES.map(({ id, label }) => (
              <button
                key={id}
                role="listitem"
                className={`cat-pill ${activeCategory === id ? 'active' : ''}`}
                onClick={() => setActiveCategory(id)}
                aria-pressed={activeCategory === id}
              >
                {label}
              </button>
            ))}

            {/* Sort */}
            <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1.5px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 100,
                  cursor: 'pointer',
                  outline: 'none',
                }}
                aria-label="Сортировка"
              >
                {SORTS.map(({ id, label }) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 page-enter" id="main-content">
        <div className="container-hs section-gap">
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 900, color: 'var(--text-primary)' }}
            >
              {t('catalog.title')}
            </motion.h1>
            {!loading && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                {displayed.length} товаров
              </span>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : displayed.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                В этой категории пока нет товаров
              </p>
              <button className="btn btn-ghost btn-md" onClick={() => setActiveCategory('all')}>
                Смотреть все
              </button>
            </div>
          ) : (
            <motion.div
              className="product-grid"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06 } },
              }}
            >
              <AnimatePresence>
                {displayed.map((p) => (
                  <motion.div
                    key={p.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <ProductCard product={p} onAddToCart={handleAddToCart} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>

      {/* Cart notice toast */}
      <AnimatePresence>
        {cartNotice && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            style={{
              position: 'fixed',
              bottom: '5rem', left: '50%', transform: 'translateX(-50%)',
              background: 'var(--brand-dark)',
              border: '1px solid var(--brand-gold)',
              color: '#fff',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.82rem',
              fontWeight: 600,
              padding: '0.75rem 1.5rem',
              borderRadius: 100,
              zIndex: 9999,
              whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            ✓ «{cartNotice}» добавлен в корзину
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
