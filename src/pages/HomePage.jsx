import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

/* Анимация fade-up для контентных блоков */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

/* Hero section */
function HeroSection({ t }) {
  return (
    <section
      style={{
        background: `linear-gradient(150deg,
          hsl(220,22%,6%) 0%,
          hsl(220,18%,10%) 55%,
          hsl(30,30%,13%) 100%)`,
        minHeight: 'max(80vh, 560px)',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-label="Главный баннер"
    >
      {/* Subtle radial glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(200,150,40,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container-hs" style={{ height: '100%', display: 'flex', alignItems: 'center', paddingBlock: '5rem' }}>
        <div style={{ maxWidth: 640 }}>
          {/* Eyebrow */}
          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={0}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--brand-gold)',
              marginBottom: '1.25rem',
            }}
          >
            Новая коллекция 2026
          </motion.p>

          {/* H1 */}
          <motion.h1
            variants={fadeUp} initial="hidden" animate="show" custom={1}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.6rem, 6vw, 5rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: '#fff',
              lineHeight: 1.08,
              marginBottom: '1.5rem',
            }}
          >
            {t('home.hero')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'rgba(255,255,255,0.62)',
              lineHeight: 1.7,
              marginBottom: '2.5rem',
              maxWidth: 480,
            }}
          >
            {t('home.sub')}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={3}
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/catalog" className="btn btn-primary btn-xl" id="hero-cta-primary">
                {t('home.cta')}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/catalog" className="btn btn-outline btn-xl" id="hero-cta-secondary"
                style={{ color: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.25)' }}>
                Смотреть новинки
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* Category cards */
const CATEGORIES = [
  { label: 'Новинки',     emoji: '✨', to: '/catalog' },
  { label: 'Хиты',        emoji: '🔥', to: '/catalog' },
  { label: 'Акции',       emoji: '🏷️', to: '/catalog' },
  { label: 'Наборы',      emoji: '🎁', to: '/catalog' },
];

function CategoriesSection() {
  return (
    <section style={{ background: 'var(--bg-secondary)' }} className="section-gap">
      <div className="container-hs">
        <motion.h2
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}
          style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2.5rem' }}
        >
          Категории
        </motion.h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {CATEGORIES.map(({ label, emoji, to }, i) => (
            <motion.div
              key={label}
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
            >
              <Link
                to={to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1.25rem 1.5rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  transition: 'all 0.25s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--brand-gold)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.color = 'var(--brand-gold)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
                {label}
                <svg style={{ marginLeft: 'auto', opacity: 0.4 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Trust / UTP strip */
function TrustStrip() {
  return (
    <section aria-label="Наши преимущества">
      <div className="trust-bar">
        {[
          { icon: '🚚', title: 'Яндекс Доставка', sub: 'По всему Казахстану' },
          { icon: '💳', title: 'Kaspi Pay', sub: 'Оплата и рассрочка' },
          { icon: '↩️', title: 'Возврат 30 дней', sub: 'Без вопросов' },
          { icon: '🔒', title: 'Безопасно', sub: 'SSL-шифрование' },
        ].map(({ icon, title, sub }) => (
          <div key={title} className="trust-bar-item">
            <div className="trust-bar-icon">{icon}</div>
            <div className="trust-bar-text">
              <strong>{title}</strong>
              <span>{sub}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* Info tabs: Доставка / Оплата / Возврат */
function InfoTabs() {
  const [active, setActive] = React.useState('delivery');

  const tabs = [
    { id: 'delivery', label: '🚚 Доставка', content: `Доставка осуществляется через Яндекс Доставку по всей территории Казахстана. Срок доставки: 1–3 рабочих дня в Алматы и Астане, 2–5 дней по регионам. Стоимость доставки рассчитывается автоматически при оформлении заказа. Бесплатная доставка при заказе от 15 000 ₸.` },
    { id: 'payment',  label: '💳 Оплата',   content: `Принимаем оплату через Kaspi Pay — удобно, быстро и безопасно. Доступна оплата в рассрочку через Kaspi RED от 0%. Также принимаем банковские карты Visa / Mastercard. Все транзакции защищены SSL-шифрованием.` },
    { id: 'returns',  label: '↩️ Возврат',  content: `Если товар не подошёл — мы принимаем возврат в течение 30 дней с момента покупки. Товар должен быть в оригинальной упаковке и не иметь следов использования. Для оформления возврата свяжитесь с нашей поддержкой. Деньги возвращаются в течение 3–5 рабочих дней.` },
  ];

  return (
    <section className="section-gap" style={{ background: 'var(--bg-primary)' }}>
      <div className="container-hs" style={{ maxWidth: 800 }}>
        <motion.h2
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}
          style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2rem' }}
        >
          Доставка, оплата и возврат
        </motion.h2>

        <div className="info-tabs">
          <div className="info-tab-header">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                className={`info-tab-btn ${active === id ? 'active' : ''}`}
                onClick={() => setActive(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="info-tab-content"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {tabs.find(t => t.id === active)?.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

import { AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Hot Stuff — Главная | Интернет-магазин в Казахстане</title>
        <meta name="description" content="Hot Stuff — премиальные товары с доставкой по Казахстану. Оплата Kaspi Pay, возврат 30 дней." />
      </Helmet>

      <Header />

      <main className="flex-1 page-enter" id="main-content">
        <HeroSection t={t} />
        <TrustStrip />
        <CategoriesSection />
        <InfoTabs />
      </main>

      <Footer />
    </div>
  );
}
