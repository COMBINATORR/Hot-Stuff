import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import ResponsiveImage from './ResponsiveImage';

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
              <div className="px-6 py-4 bg-stone-900 border-b border-white/5 space-y-2">
                <div className="text-[9px] font-bold tracking-wider text-stone-400 uppercase flex justify-between">
                  {subtotal < FREE_SHIPPING_THRESHOLD ? (
                    <>
                      <span>{t('header.free_shipping_hint', { defaultValue: 'до бесплатной доставки осталось {{amount}} ₸', amount: (FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString('ru-KZ') })}</span>
                      <span className="text-primary">{Math.round(progressPercent)}%</span>
                    </>
                  ) : (
                    <span className="text-green-400 font-bold">{t('header.free_shipping_success', '✨ поздравляем! доставка бесплатна!')}</span>
                  )}
                </div>
                <div className="w-full h-1 bg-stone-800 rounded-none overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
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
                    <div key={`${item.id}-${item.variant}-${idx}`} className="flex gap-4 border-b border-white/5 pb-6">
                      <div className="w-20 h-24 bg-stone-900 flex-none border border-white/5">
                        {item.image ? (
                          <ResponsiveImage alt={item.name} className="w-full h-full object-cover" src={item.image} loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl bg-stone-850">🌸</div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <h3 className="text-[10px] tracking-widest text-white uppercase font-bold truncate">{item.name}</h3>
                          {item.variant && <p className="text-[9px] tracking-wider text-stone-400 uppercase mt-0.5">{item.variant}</p>}
                          <p className="text-primary text-[11px] font-bold mt-1">{item.price.toLocaleString('ru-KZ')} ₸</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-white/15">
                            <button 
                              className="px-2 py-0.5 text-stone-400 hover:text-white transition-colors"
                              onClick={() => handleUpdateQty(item.id, item.variant, item.qty - 1)}
                            >-</button>
                            <span className="px-3 text-[11px] font-bold">{item.qty}</span>
                            <button 
                              className="px-2 py-0.5 text-stone-400 hover:text-white transition-colors"
                              onClick={() => handleUpdateQty(item.id, item.variant, item.qty + 1)}
                            >+</button>
                          </div>

                          {/* Delete Button */}
                          <button 
                            onClick={() => handleRemove(item.id, item.variant)}
                            className="text-stone-500 hover:text-red-400 transition-colors"
                            aria-label={t('header.remove_item', 'Удалить товар')}
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-6 bg-stone-900 border-t border-white/10 space-y-4">
                {/* Promo Code */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder={t('header.promo_placeholder', 'ПРОМОКОД')}
                    className="flex-1 bg-stone-950 border border-white/10 px-3 py-2 text-[16px] tracking-widest uppercase text-white outline-none rounded-none focus:border-primary"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="border border-white hover:bg-white hover:text-black text-white px-4 text-[10px] tracking-widest uppercase font-bold rounded-none transition-all"
                  >
                    {t('header.promo_btn', 'ок')}
                  </button>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-[10px] tracking-wider text-green-400 uppercase">
                    <span>{t('header.promo_applied', { code: appliedPromo, defaultValue: 'скидка 15% примененa' })}:</span>
                    <span>-{discountAmount.toLocaleString('ru-KZ')} ₸</span>
                  </div>
                )}

                {/* Subtotal */}
                <div className="flex justify-between text-xs tracking-widest uppercase text-white font-bold">
                  <span>{t('header.subtotal', 'итого')}:</span>
                  <span>{finalTotal.toLocaleString('ru-KZ')} ₸</span>
                </div>

                {/* Checkout Actions */}
                <div className="flex flex-col gap-2 mt-2">
                  <button
                    onClick={handleKaspiCheckout}
                    disabled={isCheckingOut}
                    className="w-full bg-[#E31E24] hover:bg-[#c21419] text-white text-[10px] tracking-[0.2em] font-black py-3 uppercase rounded-none transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">credit_card</span>
                    {isCheckingOut ? t('header.processing', 'обработка...') : t('header.kaspi_invoice', 'счет на Kaspi.kz')}
                  </button>

                  <button
                    onClick={handleCheckoutNavigate}
                    className="w-full bg-white hover:bg-neutral-200 text-black text-[10px] tracking-[0.2em] font-black py-3 uppercase rounded-none transition-all"
                  >
                    {t('header.go_to_checkout', 'оформить заказ')}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
