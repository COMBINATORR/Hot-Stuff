import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { signInWithGoogle, signInWithApple, signInWithYandex } from '../lib/supabaseClient.js';

/* ── Step indicator ──────────────────────── */
const STEPS = ['Контакты', 'Доставка', 'Оплата'];

function StepBar({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '2.5rem' }}>
      {STEPS.map((label, i) => {
        const done    = i < current;
        const active  = i === current;
        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done || active ? 'var(--brand-gold)' : 'var(--bg-secondary)',
                border: done || active ? 'none' : '2px solid var(--border-color)',
                fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 700,
                color: done || active ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.3s ease',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{
                fontFamily: 'var(--font-heading)', fontSize: '0.68rem', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: active ? 'var(--brand-gold)' : done ? 'var(--text-secondary)' : 'var(--text-muted)',
              }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2,
                background: i < current ? 'var(--brand-gold)' : 'var(--border-color)',
                marginBottom: '1.5rem',
                transition: 'background 0.3s ease',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── OAuth sign-in card ──────────────────── */
function OAuthCard() {
  return (
    <div className="checkout-section" style={{ marginBottom: '1.25rem' }}>
      <p className="checkout-section-title">Быстрый вход для автозаполнения</p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Google', fn: signInWithGoogle,
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> },
          { label: 'Яндекс',  fn: signInWithYandex,
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="#FC3F1D"><path d="M15.6 2H12c-3.9 0-7 2.9-7 6.5C5 11.2 6.7 13.5 9 14.7L5 22h3.5l3.7-6.8H13V22h3.5V2H15.6zm-2.1 10.2h-1.3C10.4 12.2 9 10.7 9 8.5 9 6.3 10.4 5 12.2 5H13.5v7.2z"/></svg> },
          { label: 'Apple',   fn: signInWithApple,
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.39.07 2.34.77 3.15.8 1.2-.24 2.34-1.06 3.6-.9 1.54.18 2.7.95 3.45 2.32-3.16 1.9-2.39 6.08.8 7.23-.56 1.5-1.3 2.97-3 3.43zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg> },
        ].map(({ label, fn, icon }) => (
          <motion.button
            key={label}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={fn}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              background: 'var(--bg-secondary)',
              border: '1.5px solid var(--border-color)',
              borderRadius: 100,
              fontFamily: 'var(--font-heading)',
              fontSize: '0.78rem', fontWeight: 600,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.22s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-gold)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            {icon} {label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ── Form field ──────────────────────────── */
function FormField({ label, type = 'text', name, placeholder, required = true }) {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="form-input"
      />
    </div>
  );
}

/* ── Payment method selector ─────────────── */
function PaymentMethods({ selected, onSelect }) {
  const methods = [
    { id: 'kaspi',  label: 'Kaspi Pay',  sub: 'Мгновенная оплата', emoji: '💳' },
    { id: 'kaspi_red', label: 'Kaspi RED', sub: '0–24 месяца', emoji: '🏦' },
    { id: 'card',   label: 'Карта',       sub: 'Visa / Mastercard', emoji: '💰' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {methods.map(({ id, label, sub, emoji }) => (
        <label
          key={id}
          htmlFor={`pay-${id}`}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.9rem',
            padding: '1rem 1.25rem',
            border: `2px solid ${selected === id ? 'var(--brand-gold)' : 'var(--border-color)'}`,
            borderRadius: 12,
            cursor: 'pointer',
            background: selected === id ? 'rgba(200,150,40,0.04)' : 'var(--bg-primary)',
            transition: 'all 0.2s ease',
          }}
        >
          <input
            type="radio" id={`pay-${id}`} name="payment" value={id}
            checked={selected === id}
            onChange={() => onSelect(id)}
            style={{ accentColor: 'var(--brand-gold)' }}
          />
          <span style={{ fontSize: '1.3rem' }}>{emoji}</span>
          <div>
            <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
              {label}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{sub}</p>
          </div>
        </label>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [payMethod, setPayMethod] = useState('kaspi');
  const [submitted, setSubmitted] = useState(false);

  const subtotal = 21400;
  const delivery = subtotal >= 15000 ? 0 : 1490;
  const total = subtotal + delivery;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 2) {
      setStep(s => s + 1);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Helmet><title>Hot Stuff — Заказ принят</title></Helmet>
        <Header />
        <main className="flex-1 page-enter" id="main-content">
          <div className="container-hs" style={{ maxWidth: 600, paddingBlock: '6rem', textAlign: 'center' }}>
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--brand-gold), var(--brand-mustard))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', margin: '0 auto 2rem',
              }}>✓</div>
            </motion.div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Заказ оформлен!
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Мы свяжемся с вами в ближайшее время. Детали доставки придут на указанный номер.
            </p>
            <Link to="/" className="btn btn-primary btn-lg">На главную</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Hot Stuff — Оформление заказа</title>
        <meta name="description" content="Оформление заказа Hot Stuff. Оплата Kaspi Pay, доставка по Казахстану." />
      </Helmet>

      <Header />

      <main className="flex-1 page-enter" id="main-content">
        <div className="container-hs section-gap">
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '2rem' }}
          >
            {t('checkout.title')}
          </motion.h1>

          <div className="checkout-layout">
            {/* ── Left: form ───────────────── */}
            <div>
              <StepBar current={step} />

              <OAuthCard />

              <form onSubmit={handleSubmit}>
                {/* Step 0: Contacts */}
                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div
                      key="step0"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="checkout-section">
                        <p className="checkout-section-title">Контактные данные</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <FormField label="Имя" name="first_name" placeholder="Анжела" />
                          <FormField label="Фамилия" name="last_name" placeholder="Иванова" />
                        </div>
                        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <FormField label="Телефон" type="tel" name="phone" placeholder="+7 (___) ___-__-__" />
                          <FormField label="Email" type="email" name="email" placeholder="angela@hotstuff.kz" />
                        </div>
                      </div>

                      <motion.button type="submit" className="btn btn-primary btn-lg" id="checkout-next-1"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                        Далее — Доставка →
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Step 1: Delivery */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="checkout-section">
                        <p className="checkout-section-title">Адрес доставки</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <FormField label="Город" name="city" placeholder="Алматы" />
                          <FormField label="Улица и дом" name="street" placeholder="ул. Абая, 123" />
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <FormField label="Квартира / офис" name="apt" placeholder="45" required={false} />
                            <FormField label="Индекс" name="zip" placeholder="050000" required={false} />
                          </div>
                          <FormField label="Комментарий к доставке" name="comment" placeholder="Домофон 23, этаж 5" required={false} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" className="btn btn-outline btn-lg" onClick={() => setStep(0)} style={{ flex: 1, justifyContent: 'center' }}>
                          ← Назад
                        </button>
                        <motion.button type="submit" className="btn btn-primary btn-lg" id="checkout-next-2"
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          style={{ flex: 2, justifyContent: 'center' }}>
                          Далее — Оплата →
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Payment */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="checkout-section">
                        <p className="checkout-section-title">Способ оплаты</p>
                        <PaymentMethods selected={payMethod} onSelect={setPayMethod} />
                      </div>

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" className="btn btn-outline btn-lg" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center' }}>
                          ← Назад
                        </button>
                        <motion.button type="submit" className="btn btn-primary btn-xl" id="checkout-submit"
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          style={{ flex: 2, justifyContent: 'center' }}>
                          Оплатить {total.toLocaleString('ru-KZ')} ₸ →
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            {/* ── Right: order summary ──────── */}
            <aside>
              <div className="cart-summary" style={{ position: 'sticky', top: 100 }}>
                <p style={{
                  fontFamily: 'var(--font-heading)', fontSize: '0.72rem', fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'var(--text-muted)', marginBottom: '1rem',
                }}>
                  Ваш заказ
                </p>

                {/* Mini cart items */}
                {[
                  { name: 'Товар №1', price: 12500, qty: 1 },
                  { name: 'Товар №2', price: 8900,  qty: 2 },
                ].map(({ name, price, qty }) => (
                  <div key={name} className="cart-summary-row" style={{ alignItems: 'flex-start' }}>
                    <span style={{ flex: 1 }}>{name} ×{qty}</span>
                    <span>{(price * qty).toLocaleString('ru-KZ')} ₸</span>
                  </div>
                ))}

                <div className="cart-summary-row">
                  <span>Доставка</span>
                  <span style={{ color: delivery === 0 ? '#38a169' : 'inherit' }}>
                    {delivery === 0 ? 'Бесплатно' : `${delivery.toLocaleString('ru-KZ')} ₸`}
                  </span>
                </div>

                <div className="cart-summary-total cart-summary-row">
                  <span>Итого</span>
                  <span>{total.toLocaleString('ru-KZ')} ₸</span>
                </div>

                {/* Trust micro-copy */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                  {['🔒 Защищённая оплата', '↩️ Возврат 30 дней', '🚚 Яндекс Доставка'].map(t => (
                    <p key={t} style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t}</p>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
