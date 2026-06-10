import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ── Mock product data ─────────────────────────── */
const PRODUCT = {
  id: 1,
  name: 'Lush Sensation',
  subtitle: 'Персональный массажёр',
  price: 42900,
  emoji: '🌸',
  description: 'Lush Sensation — это воплощение инженерной мысли, заключённой в безупречную форму. Каждый изгиб продуман для максимального комфорта и удовольствия.',
  colors: [
    { name: 'Midnight Black', hex: '#1a1a1a' },
    { name: 'Muted Gold',    hex: '#C4A661' },
    { name: 'Rose Dust',     hex: '#8B4557' },
  ],
  features: [
    { icon: 'water_drop',  label: 'ВОДОНЕПРОНИЦАЕМЫЙ', desc: 'IPX7 защита' },
    { icon: 'touch_app',   label: 'СИЛИКОН',           desc: 'Медицинский' },
    { icon: 'battery_charging_full', label: 'АККУМУЛЯТОР', desc: '2 часа работы' },
  ],
  specs: [
    { label: 'МАТЕРИАЛ',    value: 'Медицинский силикон' },
    { label: 'РАЗМЕР',      value: '185 × 34 мм' },
    { label: 'ВЕС',         value: '86 г' },
    { label: 'ЗАРЯДКА',     value: 'USB Type-C, 90 мин' },
    { label: 'ЗАЩИТА',      value: 'IPX7' },
    { label: 'РЕЖИМЫ',      value: '10 режимов вибрации' },
  ],
};

const CROSS_SELL = [
  { id: 2, name: 'Velvet Noir',   price: 54900, emoji: '🖤' },
  { id: 3, name: 'Bloom Essence', price: 38900, emoji: '🌺' },
  { id: 7, name: 'Aura Bliss',    price: 35900, emoji: '🌿' },
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export default function ProductPage({ onAddToCart }) {
  const { id } = useParams();
  const [selectedColor, setSelectedColor] = useState(0);
  const [qty, setQty] = useState(1);

  const product = PRODUCT; // In production, fetch by id

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        emoji: product.emoji,
        variant: product.colors[selectedColor].name,
        qty,
      });
    }
  };

  return (
    <div className="page-enter pt-[80px]">
      {/* ═══ HERO — Split Layout ═══════════════════ */}
      <section className="container-hs py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-gutter items-start">
          {/* LEFT — Info */}
          <motion.div
            className="flex flex-col justify-center order-2 md:order-1"
            initial="hidden" animate="visible" variants={stagger}
          >
            {/* Breadcrumb */}
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-8">
              <Link to="/catalog" className="label-caps text-outline hover:text-primary transition-colors">Каталог</Link>
              <span className="text-outline">/</span>
              <span className="label-caps text-on-surface-variant">{product.name}</span>
            </motion.div>

            {/* Category */}
            <motion.p variants={fadeUp} className="label-caps text-primary mb-3">{product.subtitle}</motion.p>

            {/* Name */}
            <motion.h1 variants={fadeUp} className="text-headline-lg mb-4">{product.name}</motion.h1>

            {/* Price */}
            <motion.p variants={fadeUp} className="text-2xl text-on-surface-variant font-light tracking-wide mb-8">
              {product.price.toLocaleString('ru-KZ')} ₸
            </motion.p>

            {/* Description */}
            <motion.p variants={fadeUp} className="text-body-md text-on-surface-variant leading-relaxed mb-10 max-w-md">
              {product.description}
            </motion.p>

            {/* Color swatches */}
            <motion.div variants={fadeUp} className="mb-8">
              <p className="field-label mb-3">ЦВЕТ — {product.colors[selectedColor].name}</p>
              <div className="flex items-center gap-3">
                {product.colors.map((c, i) => (
                  <button
                    key={c.hex}
                    onClick={() => setSelectedColor(i)}
                    className="w-8 h-8 rounded-full transition-all duration-200"
                    style={{
                      background: c.hex,
                      boxShadow: i === selectedColor ? `0 0 0 2px #131313, 0 0 0 3.5px #f2ca50` : '0 0 0 1px rgba(255,255,255,0.15)',
                    }}
                    aria-label={c.name}
                  />
                ))}
              </div>
            </motion.div>

            {/* Quantity + Add to Cart */}
            <motion.div variants={fadeUp} className="flex items-center gap-4 mb-6">
              {/* Qty stepper */}
              <div className="flex items-center border border-white/10">
                <button
                  className="px-4 py-3 text-on-surface-variant hover:text-primary transition-colors label-caps"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                >−</button>
                <span className="px-5 py-3 text-body-md text-center min-w-[3rem]">{qty}</span>
                <button
                  className="px-4 py-3 text-on-surface-variant hover:text-primary transition-colors label-caps"
                  onClick={() => setQty(q => q + 1)}
                >+</button>
              </div>

              <button className="btn-primary flex-1" onClick={handleAdd}>
                В КОРЗИНУ
              </button>
            </motion.div>

            {/* Delivery hint */}
            <motion.p variants={fadeUp} className="text-xs text-outline tracking-wider">
              <span className="material-symbols-outlined text-sm align-middle mr-1">local_shipping</span>
              Бесплатная доставка по Атырау от 30 000 ₸
            </motion.p>
          </motion.div>

          {/* RIGHT — Image */}
          <motion.div
            className="order-1 md:order-2"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.25,0.46,0.45,0.94] }}
          >
            <div className="aspect-[3/4] bg-surface-container-low flex items-center justify-center">
              <span className="text-[8rem]">{product.emoji}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FEATURE ICONS ═════════════════════════ */}
      <section className="bg-surface-container-lowest">
        <div className="container-hs py-20">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}
          >
            {product.features.map((f, i) => (
              <motion.div
                key={f.label}
                variants={fadeUp}
                className="flex flex-col items-center text-center gap-3 py-6"
              >
                <span className="material-symbols-outlined text-3xl text-primary">{f.icon}</span>
                <p className="label-caps text-on-surface">{f.label}</p>
                <p className="text-body-md text-on-surface-variant">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ MAGIC OF TECHNOLOGY ═══════════════════ */}
      <section className="container-hs py-section-gap">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}
        >
          <motion.div variants={fadeUp}>
            <div className="aspect-[4/5] bg-surface-container-low flex items-center justify-center">
              <span className="text-[6rem] opacity-30">🔬</span>
            </div>
          </motion.div>
          <motion.div variants={fadeUp} transition={{ delay: 0.15 }}>
            <p className="label-caps text-primary mb-4">МАГИЯ ТЕХНОЛОГИЙ</p>
            <h2 className="text-headline-lg mb-6">Инновации, скрытые в форме</h2>
            <p className="text-body-lg text-on-surface-variant leading-relaxed mb-6">
              Каждый продукт HOT STUFF — это результат месяцев исследований. Мы используем медицинский силикон высшей пробы, бесшумные моторы нового поколения и интуитивное управление.
            </p>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Результат? Устройство, которое чувствует ваше тело и адаптируется к нему.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ SPECIFICATIONS ════════════════════════ */}
      <section className="container-hs pb-section-gap">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}
        >
          <motion.div variants={fadeUp} className="flex items-center mb-12">
            <h2 className="label-caps text-on-surface-variant">ХАРАКТЕРИСТИКИ</h2>
            <div className="section-rule" />
          </motion.div>

          <div className="max-w-2xl">
            {product.specs.map(s => (
              <motion.div key={s.label} variants={fadeUp} className="specs-row">
                <span className="specs-label">{s.label}</span>
                <span className="specs-value">{s.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ LIFESTYLE QUOTE ═══════════════════════ */}
      <section className="relative py-section-gap bg-surface-container-lowest overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ background: 'radial-gradient(ellipse at 70% 50%, #f2ca50, transparent 60%)' }}
        />
        <motion.div
          className="container-hs relative z-10 max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <blockquote className="text-headline-lg md:text-headline-lg text-headline-lg-mobile italic text-on-surface">
            "Истинная роскошь — это когда технологии исчезают, и остаются только ощущения."
          </blockquote>
          <div className="underline-gold mx-auto mt-8" />
        </motion.div>
      </section>

      {/* ═══ CROSS-SELL ════════════════════════════ */}
      <section className="container-hs py-section-gap">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}
        >
          <motion.div variants={fadeUp} className="flex items-center mb-16">
            <h2 className="label-caps text-on-surface-variant">ДОПОЛНИТЕ СВОЙ РИТУАЛ</h2>
            <div className="section-rule" />
          </motion.div>

          <div className="product-grid-3">
            {CROSS_SELL.map((p, i) => (
              <motion.div key={p.id} variants={fadeUp} transition={{ delay: i * 0.1 }}>
                <Link to={`/product/${p.id}`} className="group block">
                  {/* White card — inverted palette for contrast */}
                  <div className="bg-pure-white aspect-square flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                    <span className="text-[5rem] group-hover:scale-110 transition-transform duration-500">{p.emoji}</span>
                  </div>
                  <div className="py-4 text-center">
                    <p className="product-card-name">{p.name}</p>
                    <p className="product-card-price">{p.price.toLocaleString('ru-KZ')} ₸</p>
                    <button className="btn-outline-dark mt-3 text-on-surface border-white/20 hover:bg-white/5 hover:text-primary">
                      ПОДРОБНЕЕ
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
