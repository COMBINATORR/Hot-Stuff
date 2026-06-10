import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ── Mock data ─────────────────────────────────── */
const HERO = {
  headline: 'ИСКУССТВО\nЧУВСТВЕННОСТИ',
  sub: 'Премиальные интимные аксессуары для тех, кто ценит эстетику, качество и новые ощущения.',
};

const CATEGORIES = [
  { slug: 'vibrators', name: 'Вибраторы', emoji: '✨' },
  { slug: 'massagers', name: 'Массажёры', emoji: '🌙' },
  { slug: 'couples',   name: 'Для пар',   emoji: '💫' },
  { slug: 'wellness',  name: 'Wellness',  emoji: '🌿' },
];

const BESTSELLERS = [
  { id: 1, name: 'Lush Sensation', price: 42900, emoji: '🌸', colors: ['#1a1a1a','#C4A661','#8B4557'] },
  { id: 2, name: 'Velvet Noir',    price: 54900, emoji: '🖤', colors: ['#1a1a1a','#4A3C5C'] },
  { id: 3, name: 'Bloom Essence',  price: 38900, emoji: '🌺', colors: ['#C4A661','#8B4557','#E5E2E1'] },
  { id: 4, name: 'Silk Wave',      price: 62900, emoji: '🌊', colors: ['#1a1a1a','#355E5C'] },
];

/* ── Animations ────────────────────────────────── */
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

export default function HomePage({ onAddToCart }) {
  return (
    <div className="page-enter">
      {/* ═══ HERO ══════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
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

      {/* ═══ BRAND INTRODUCTION SECTION (After Hero) ═══ */}
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

      {/* ═══ CATEGORIES ════════════════════════════ */}
      <section className="container-hs py-section-gap">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="flex items-center mb-16">
            <h2 className="label-caps text-on-surface-variant">КАТЕГОРИИ</h2>
            <div className="section-rule" />
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.slug} variants={fadeUp} transition={{ duration: 0.45, delay: i * 0.08 }}>
                <Link
                  to={`/catalog?cat=${cat.slug}`}
                  className="group block bg-surface-container-low hover:bg-surface-container transition-colors p-10 text-center"
                >
                  <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-500">
                    {cat.emoji}
                  </div>
                  <p className="label-caps text-on-surface group-hover:text-primary transition-colors">
                    {cat.name}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ BESTSELLERS ═══════════════════════════ */}
      <section className="container-hs pb-section-gap">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="flex items-center mb-16">
            <h2 className="label-caps text-on-surface-variant">БЕСТСЕЛЛЕРЫ</h2>
            <div className="section-rule" />
          </motion.div>

          <div className="product-grid-4">
            {BESTSELLERS.map((p, i) => (
              <motion.div key={p.id} variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <Link to={`/product/${p.id}`} className="product-card block">
                  <div className="product-card-image">
                    <div className="product-card-placeholder">{p.emoji}</div>
                  </div>
                  <div className="product-card-info">
                    {/* Color dots */}
                    <div className="flex items-center justify-center gap-2 mb-3">
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
          </div>

          {/* CTA */}
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mt-16">
            <Link to="/catalog" className="btn-outline">СМОТРЕТЬ ВСЁ</Link>
          </motion.div>
        </motion.div>
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
    </div>
  );
}
