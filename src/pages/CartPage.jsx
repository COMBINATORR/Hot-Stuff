import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../components/ResponsiveImage';
import { supabase } from '../lib/supabase';

/* ── Qty stepper ──────────────────────────── */
function QtyControl({ qty, onMinus, onPlus }) {
  const { t } = useTranslation();
  return (
    <div className="inline-flex items-center border border-white/10 bg-neutral-900 rounded-none h-8">
      <button 
        onClick={onMinus} 
        className="w-8 h-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 active:scale-90 transition-all focus:outline-none focus-visible:bg-white/10" 
        aria-label={t('common.decrease', 'Уменьшить')}
      >
        −
      </button>
      <span className="px-2 text-xs font-bold text-white font-sans min-w-[2rem] text-center">
        {qty}
      </span>
      <button 
        onClick={onPlus} 
        className="w-8 h-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 active:scale-90 transition-all focus:outline-none focus-visible:bg-white/10" 
        aria-label={t('common.increase', 'Увеличить')}
      >
        +
      </button>
    </div>
  );
}

/* ── Cart item row ───────────────────────── */
// ⚡ Bolt: Wrapped CartItemRow in React.memo to prevent unnecessary re-renders of all cart items
// when the quantity of a single item changes or when other cart state updates occur.
const CartItemRow = React.memo(function CartItemRow({ item, onQtyChange, onRemove }) {
  const { t } = useTranslation();
  return (
    <motion.div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 bg-neutral-900/40 border border-white/5 hover:border-white/10 transition-all duration-300 relative rounded-none"
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 16, height: 0, padding: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="flex gap-4 items-center w-full sm:w-auto">
        {/* Image - Rounded Card Corner brand rule applies here */}
        <div className="w-20 h-20 bg-neutral-950 border border-white/10 flex-shrink-0 flex items-center justify-center rounded-card overflow-hidden">
          {(item.image_url || item.image) ? (
            <ResponsiveImage 
              src={item.image_url || item.image} 
              alt={item.name} 
              className="w-full h-full object-cover" 
              loading="lazy" 
            />
          ) : (
            <div className="text-3xl">📦</div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1 text-left">
          <h3 className="font-sans font-bold text-xs text-white uppercase tracking-wider">
            {item.name}
          </h3>
          {item.variant && (
            <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
              {t('product.color_label', { color: item.variant })}
            </p>
          )}
          <p className="text-[9px] text-white/40 font-mono tracking-wider">
            {t('product.sku', 'АРТ.')} HS-{String(item.id).padStart(4, '0')}
          </p>
          <div className="pt-2">
            <QtyControl
              qty={item.qty}
              onMinus={() => onQtyChange(item.id, item.variant, item.qty - 1)}
              onPlus={() => onQtyChange(item.id, item.variant, item.qty + 1)}
            />
          </div>
        </div>
      </div>

      {/* Price + remove */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-4 self-stretch text-right mt-4 sm:mt-0">
        <span className="font-sans font-extrabold text-sm text-white tracking-tight">
          {(item.price * item.qty).toLocaleString('ru-KZ')} ₸
        </span>
        <button
          onClick={() => onRemove(item.id, item.variant)}
          aria-label={`${t('header.remove', 'Удалить')} ${item.name}`}
          className="text-[10px] font-bold text-white/40 hover:text-error uppercase tracking-wider transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-error focus-visible:ring-offset-1 focus-visible:ring-offset-black rounded-none"
        >
          {t('header.remove', 'Удалить')}
        </button>
      </div>
    </motion.div>
  );
});

export default function CartPage({ cartItems = [], onUpdateQty, onRemove, lang }) {
  const { t } = useTranslation();
  const location = useLocation();
  const items = cartItems;

  // Determine checkout path respecting locale prefix (/kz/checkout, /en/checkout, /checkout)
  const checkoutPath = (() => {
    const parts = location.pathname.split('/');
    if (parts.length > 1 && ['ru', 'kz', 'en'].includes(parts[1])) {
      return `/${parts[1]}/checkout`;
    }
    return '/checkout';
  })();

  const handleQty = React.useCallback((id, variant, newQty) => {
    if (newQty < 1) {
      if (onRemove) onRemove(id, variant);
    } else {
      if (onUpdateQty) onUpdateQty(id, variant, newQty);
    }
  }, [onRemove, onUpdateQty]);

  const handleRemove = React.useCallback((id, variant) => {
    if (onRemove) onRemove(id, variant);
  }, [onRemove]);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal >= 15000 ? 0 : 1490;
  const total = subtotal + delivery;

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const handleKaspiCheckout = async (e) => {
    // Prevent any parent form submission or event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsCheckingOut(true);
    setCheckoutError('');
    try {
      const orderId = `HS-${Date.now()}`;
      const amount = total;
      
      console.log(`[Kaspi Checkout] Requesting invoice for ${amount} ₸ (Order ID: ${orderId})`);
      
      const { data, error } = await supabase.functions.invoke('kaspi-checkout', {
        body: { amount, orderId }
      });

      if (error) throw error;
      
      if (data && data.paymentUrl) {
        console.log('[Kaspi Checkout] Redirecting to payment URL:', data.paymentUrl);
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(t('header.payment_url_error', 'Не удалось получить ссылку на оплату от сервера'));
      }
    } catch (err) {
      console.error('[Kaspi Checkout Error]', err);
      const errMsg = err.message || t('header.payment_init_error', 'Ошибка инициализации платежа');
      setCheckoutError(errMsg);
      alert(t('header.payment_failed', 'Ошибка оплаты: {{error}}', { error: errMsg }));
      setIsCheckingOut(false);
    }
  };

  return (
    // NOTE: Header and Footer are intentionally omitted here.
    // They are already rendered by App.jsx wrapping all routes.
    // Rendering them here again would cause double-mount conflicts.
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Helmet>
        <title>Hot Stuff — {t('cart.title')}</title>
        <meta name="description" content={t('cart.meta_desc')} />
      </Helmet>

      {/* Header is rendered by App.jsx — do NOT add it here */}

      <main className="flex-1 pt-32 pb-20" id="main-content">
        <Breadcrumbs theme="dark" />
        <div className="container-hs">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-sans text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-10 flex items-baseline gap-3 text-left"
          >
            {t('cart.title')}
            {items.length > 0 && (
              <span className="font-sans font-normal text-xs text-white/40 uppercase tracking-widest">
                {items.length === 1 ? t('cart.count_label', { count: items.length }) : t('cart.count_label_plural', { count: items.length })}
              </span>
            )}
          </motion.h1>

          {items.length === 0 ? (
            /* ─ Empty State ─────────────────── */
            <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-neutral-950 border border-white/5 space-y-6 rounded-none">
              <div className="w-16 h-16 flex items-center justify-center bg-neutral-900 border border-white/10 text-2xl text-primary rounded-none">
                🛒
              </div>
              <div>
                <p className="font-sans font-bold text-sm text-white uppercase tracking-wider">
                  {t('cart.empty')}
                </p>
                <p className="text-[11px] text-white/50 tracking-wide mt-1">
                  {t('cart.empty_hint')}
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link 
                  to="/catalog" 
                  className="inline-flex items-center justify-center bg-primary text-on-primary font-sans font-black text-[10px] tracking-[0.2em] px-8 py-4 uppercase hover:bg-primary/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 transition-all rounded-none" 
                  id="cart-cta-catalog"
                >
                  {t('cart.go_to_catalog')}
                </Link>
              </motion.div>
            </div>
          ) : (
            /* ─ Cart layout ─────────────────── */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start mt-10">
              {/* Left: items list */}
              <div className="lg:col-span-2 space-y-6">
                <AnimatePresence>
                  {items.map(item => (
                    <CartItemRow
                      key={item.id + (item.variant || '')}
                      item={item}
                      onQtyChange={handleQty}
                      onRemove={handleRemove}
                    />
                  ))}
                </AnimatePresence>

                {/* Continue shopping */}
                <div className="pt-4 text-left">
                  <Link
                    to="/catalog"
                    className="inline-flex items-center gap-2 text-[10px] font-bold text-white/50 hover:text-primary uppercase tracking-widest transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-none"
                  >
                    {t('cart.continue_shopping')}
                  </Link>
                </div>
              </div>

              {/* Right: order summary */}
              <aside className="lg:col-span-1 bg-neutral-950 border border-white/5 p-6 sm:p-8 space-y-6 sticky top-28 rounded-none">
                <p className="font-sans text-[10px] font-bold tracking-widest text-white/40 uppercase text-left">
                  {t('cart.order_summary')}
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs tracking-wide text-white/60">
                    <span>{t('cart.items_count', { count: items.reduce((s, i) => s + i.qty, 0) })}</span>
                    <span className="font-semibold text-white">{subtotal.toLocaleString('ru-KZ')} ₸</span>
                  </div>

                  <div className="flex justify-between text-xs tracking-wide text-white/60">
                    <span>{t('cart.delivery')}</span>
                    <span className={`font-semibold ${delivery === 0 ? 'text-green-400' : 'text-white'}`}>
                      {delivery === 0 ? t('cart.free') : `${delivery.toLocaleString('ru-KZ')} ₸`}
                    </span>
                  </div>

                  {delivery > 0 && (
                    <p className="text-[10px] text-white/40 text-left mt-1 leading-normal">
                      {t('cart.free_hint', { amount: (15000 - subtotal).toLocaleString('ru-KZ') })}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-baseline border-t border-white/10 pt-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">{t('cart.to_pay')}</span>
                  <span className="text-xl font-extrabold text-white">{total.toLocaleString('ru-KZ')} ₸</span>
                </div>

                 <motion.div
                  whileHover={{ scale: 1.01 }} 
                  whileTap={{ scale: 0.99 }}
                  className="pt-2"
                >
                  <Link 
                    to={checkoutPath} 
                    className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-sans font-black text-[10px] tracking-[0.2em] py-4 uppercase hover:bg-primary/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 transition-all rounded-none" 
                    id="cart-cta-checkout"
                  >
                    {t('cart.checkout')}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.01 }} 
                  whileTap={{ scale: 0.99 }}
                  className="pt-1"
                >
                  <button
                    type="button"
                    onClick={handleKaspiCheckout}
                    disabled={isCheckingOut}
                    className="w-full flex items-center justify-center gap-2 bg-[#E31E24] hover:bg-[#c9181e] disabled:bg-[#E31E24]/60 text-white font-sans font-black text-[10px] tracking-[0.2em] py-4 uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E31E24] active:scale-95 transition-all rounded-none cursor-pointer border-none"
                    id="cart-cta-kaspi"
                  >
                    {isCheckingOut ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3">
                          <circle cx="12" cy="12" r="9" />
                        </svg>
                        <span>{t('header.processing')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('cart.kaspi')}</span>
                        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                          <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm12 0h4v4h-4zm-6 6h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4z" />
                        </svg>
                      </>
                    )}
                  </button>
                </motion.div>

                {/* Trust micro-copy */}
                <div className="border-t border-white/5 pt-6 space-y-3">
                  {[
                    { text: t('cart.sec_ssl') },
                    { text: t('cart.sec_kaspi') },
                    { text: t('cart.sec_returns') }
                  ].map(item => (
                    <p 
                      key={item.text} 
                      className="text-[9px] font-bold text-white/40 flex items-center gap-2.5 uppercase tracking-wider text-left"
                    >
                      {item.text}
                    </p>
                  ))}
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      {/* Footer is rendered by App.jsx — do NOT add it here */}
    </div>
  );
}
