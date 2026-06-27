import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import CartItem from './cart/CartItem';
import FreeShippingIndicator from './cart/FreeShippingIndicator';
import CartFooter from './cart/CartFooter';

export default function CartDrawer({ isOpen, onClose, items = [], setItems, onUpdateQty, onRemove }) {
  const { t, i18n } = useTranslation();
  const [promo, setPromo] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const navigate = useNavigate();

  const handleUpdateQty = onUpdateQty || ((id, variant, qty) => {
    if (setItems) {
      setItems(prev => prev.map(i => i.id === id && i.variant === variant ? { ...i, qty: Math.max(1, qty) } : i));
    }
  });

  const handleRemove = onRemove || ((id, variant) => {
    if (setItems) {
      setItems(prev => prev.filter(i => !(i.id === id && i.variant === variant)));
    }
  });

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const FREE_SHIPPING_THRESHOLD = 30000;
  const progressPercent = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const discountAmount = appliedPromo ? subtotal * 0.15 : 0;
  const finalTotal = subtotal - discountAmount;

  // Build locale-aware checkout path
  const checkoutPath = i18n.language === 'ru' ? '/checkout' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}/checkout`;

  const handleCheckoutNavigate = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigate(checkoutPath);
    setTimeout(() => onClose(), 0);
  };

  const handleApplyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (code === 'LELO15' || code === 'HOT15') {
      setAppliedPromo(code);
    } else {
      alert(t('account.err_invalid_promo', 'Неверный промокод. Попробуйте LELO15 или HOT15'));
      setAppliedPromo('');
    }
  };

  const handleKaspiCheckout = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsCheckingOut(true);
    setCheckoutError('');
    try {
      const orderId = `HS-${Date.now()}`;
      const amount = finalTotal;
      
      const { data, error } = await supabase.functions.invoke('kaspi-checkout', {
        body: { amount, orderId }
      });

      if (error) throw error;
      
      if (data && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(t('header.err_payment_init_fail', 'Не удалось получить ссылку на оплату от сервера'));
      }
    } catch (err) {
      console.error('[Kaspi Checkout Error]', err);
      const errMsg = err.message || t('account.auth_error_default', 'Ошибка инициализации платежа');
      setCheckoutError(errMsg);
      alert(`${t('common.error', 'Ошибка')}: ${errMsg}`);
      setIsCheckingOut(false);
    }
  };

  // lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />

          {/* Slider Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0F0F0F] border-l border-white/10 z-[201] shadow-2xl flex flex-col font-sans text-stone-100"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white">
                {t('header.cart_title', 'ваша корзина')}
              </h2>
              <button 
                onClick={onClose}
                className="text-stone-400 hover:text-white transition-colors focus:outline-none"
                aria-label={t('header.close_cart', 'Закрыть корзину')}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Free Shipping Indicator */}
            {items.length > 0 && (
              <FreeShippingIndicator
                subtotal={subtotal}
                freeShippingThreshold={FREE_SHIPPING_THRESHOLD}
                progressPercent={progressPercent}
              />
            )}

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <span className="material-symbols-outlined text-4xl text-stone-600">shopping_bag</span>
                  <p className="text-[10px] tracking-widest text-stone-400 uppercase font-bold">
                    {t('header.cart_empty', 'корзина пуста')}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item, idx) => (
                    <CartItem
                      key={`${item.id}-${item.variant}-${idx}`}
                      item={item}
                      handleUpdateQty={handleUpdateQty}
                      handleRemove={handleRemove}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <CartFooter
                promo={promo}
                setPromo={setPromo}
                appliedPromo={appliedPromo}
                handleApplyPromo={handleApplyPromo}
                discountAmount={discountAmount}
                finalTotal={finalTotal}
                isCheckingOut={isCheckingOut}
                handleKaspiCheckout={handleKaspiCheckout}
                handleCheckoutNavigate={handleCheckoutNavigate}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
