import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ResponsiveImage from '../components/ResponsiveImage';

/* Mock cart state — later replace with Context/Zustand */
const MOCK_ITEMS = [
  { id: 1, name: 'Товар №1', price: 12500, qty: 1, image_url: null },
  { id: 2, name: 'Товар №2', price: 8900,  qty: 2, image_url: null },
];

/* ── Qty stepper ──────────────────────────── */
function QtyControl({ qty, onMinus, onPlus }) {
  return (
    <div className="cart-item-qty">
      <button onClick={onMinus} aria-label="Уменьшить">−</button>
      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', minWidth: '1.5ch', textAlign: 'center' }}>
        {qty}
      </span>
      <button onClick={onPlus} aria-label="Увеличить">+</button>
    </div>
  );
}

/* ── Cart item row ───────────────────────── */
function CartItemRow({ item, onQtyChange, onRemove }) {
  return (
    <motion.div
      className="cart-item"
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16, height: 0, padding: 0 }}
      transition={{ duration: 0.28 }}
    >
      {/* Image */}
      <div className="cart-item-image">
        {(item.image_url || item.image)
          ? <ResponsiveImage src={item.image_url || item.image} alt={item.name} loading="lazy" />
          : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', background: 'var(--bg-secondary)',
            }}>📦</div>
          )
        }
      </div>

      {/* Info */}
      <div>
        <p style={{
          fontFamily: 'var(--font-heading)', fontWeight: 700,
          fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.3rem',
        }}>
          {item.name}
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          арт. HS-{String(item.id).padStart(4, '0')}
        </p>
        <QtyControl
          qty={item.qty}
          onMinus={() => onQtyChange(item.id, item.qty - 1)}
          onPlus={() => onQtyChange(item.id, item.qty + 1)}
        />
      </div>

      {/* Price + remove */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
        <span style={{
          fontFamily: 'var(--font-heading)', fontWeight: 800,
          fontSize: '1rem', color: 'var(--text-primary)',
        }}>
          {(item.price * item.qty).toLocaleString('ru-KZ')} ₸
        </span>
        <button
          onClick={() => onRemove(item.id)}
          aria-label={`Удалить ${item.name}`}
          style={{
            fontSize: '0.72rem', color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
            transition: 'color 0.2s',
            background: 'none', border: 'none', cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#e53e3e'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          Удалить
        </button>
      </div>
    </motion.div>
  );
}

export default function CartPage({ cartItems = [], onUpdateQty, onRemove }) {
  const { t } = useTranslation();
  const items = cartItems;

  const handleQty = (id, newQty) => {
    if (newQty < 1) {
      if (onRemove) onRemove(id);
    } else {
      if (onUpdateQty) onUpdateQty(id, newQty);
    }
  };

  const handleRemove = (id) => {
    if (onRemove) onRemove(id);
  };

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal >= 15000 ? 0 : 1490;
  const total = subtotal + delivery;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Hot Stuff — Корзина</title>
        <meta name="description" content="Ваша корзина в Hot Stuff. Оформите заказ с доставкой по Казахстану." />
      </Helmet>

      <Header />

      <main className="flex-1 page-enter" id="main-content">
        <div className="container-hs section-gap">
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '2.5rem' }}
          >
            {t('cart.title')}
            {items.length > 0 && (
              <span style={{
                marginLeft: '0.75rem',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                fontWeight: 400,
                color: 'var(--text-muted)',
              }}>
                ({items.length} {items.length === 1 ? 'товар' : 'товара'})
              </span>
            )}
          </motion.h1>

          {items.length === 0 ? (
            /* ─ Empty State ─────────────────── */
            <div className="empty-state">
              <div className="empty-state-icon">🛒</div>
              <p style={{
                fontFamily: 'var(--font-heading)', fontWeight: 700,
                fontSize: '1.25rem', color: 'var(--text-primary)',
              }}>
                {t('cart.empty')}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Добавьте товары, чтобы оформить заказ
              </p>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/catalog" className="btn btn-primary btn-lg" id="cart-cta-catalog">
                  Перейти в каталог →
                </Link>
              </motion.div>
            </div>
          ) : (
            /* ─ Cart layout ─────────────────── */
            <div className="cart-layout">
              {/* Left: items list */}
              <div>
                <AnimatePresence>
                  {items.map(item => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onQtyChange={handleQty}
                      onRemove={handleRemove}
                    />
                  ))}
                </AnimatePresence>

                {/* Continue shopping */}
                <div style={{ marginTop: '1.5rem' }}>
                  <Link
                    to="/catalog"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      fontFamily: 'var(--font-heading)', fontSize: '0.78rem', fontWeight: 600,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-gold)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    ← Продолжить покупки
                  </Link>
                </div>
              </div>

              {/* Right: order summary */}
              <aside>
                <div className="cart-summary">
                  <p style={{
                    fontFamily: 'var(--font-heading)', fontSize: '0.72rem', fontWeight: 700,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: 'var(--text-muted)', marginBottom: '1rem',
                  }}>
                    Итого заказа
                  </p>

                  <div className="cart-summary-row">
                    <span>Товары ({items.reduce((s, i) => s + i.qty, 0)} шт.)</span>
                    <span>{subtotal.toLocaleString('ru-KZ')} ₸</span>
                  </div>

                  <div className="cart-summary-row">
                    <span>Доставка</span>
                    <span style={{ color: delivery === 0 ? '#38a169' : 'inherit' }}>
                      {delivery === 0 ? 'Бесплатно' : `${delivery.toLocaleString('ru-KZ')} ₸`}
                    </span>
                  </div>

                  {delivery > 0 && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                      Бесплатно при заказе от 15 000 ₸ (осталось {(15000 - subtotal).toLocaleString('ru-KZ')} ₸)
                    </p>
                  )}

                  <div className="cart-summary-total cart-summary-row">
                    <span>К оплате</span>
                    <span>{total.toLocaleString('ru-KZ')} ₸</span>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{ marginTop: '1.5rem' }}
                  >
                    <Link to="/checkout" className="btn btn-primary btn-lg" id="cart-cta-checkout"
                      style={{ width: '100%', justifyContent: 'center' }}>
                      Оформить заказ
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  </motion.div>

                  {/* Trust micro-copy */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.2rem' }}>
                    {[
                      '🔒 Безопасная оплата SSL',
                      '💳 Оплата Kaspi Pay / рассрочка',
                      '↩️ Возврат в течение 30 дней',
                    ].map(text => (
                      <p key={text} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {text}
                      </p>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
