import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import ResponsiveImage from './ResponsiveImage';

export default function CartDrawer({ isOpen, onClose, items = [], onUpdateQty, onRemove, onAddToCart }) {
  const { t, i18n } = useTranslation();
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const [promo, setPromo] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const navigate = useNavigate();

  // Build locale-aware checkout path
  const checkoutPath = i18n.language === 'ru' ? '/checkout' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}/checkout`;

  // Safe checkout navigation: navigate FIRST, then close drawer.
  // If we close first, CartDrawer unmounts (returns null when !isOpen),
  // and navigate() from an unmounted component may silently fail in React 18.
  const handleCheckoutNavigate = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigate(checkoutPath);
    // Close drawer AFTER navigation is scheduled
    setTimeout(() => onClose(), 0);
  };

  // lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 30000;
  const progressPercent = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const discountAmount = appliedPromo ? subtotal * 0.15 : 0;
  const finalTotal = subtotal - discountAmount;

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
    // Prevent event bubbling to any parent form or navigation handler
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

  return (
    <>
      {/* Cart Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] transition-opacity duration-500 opacity-100"
        id="cart-overlay"
        onClick={onClose}
      ></div>
      {/* Cart Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md bg-surface-container-lowest z-[201] shadow-2xl transform transition-transform duration-500 translate-x-0 flex flex-col"
        id="cart-drawer"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/10 flex justify-between items-center">
          <h2 className="font-headline-lg text-title-md uppercase tracking-widest text-on-surface">{t('header.cart_title', 'ВАША КОРЗИНА')}</h2>
          <button className="w-11 h-11 -mr-3 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors focus:outline-none focus-visible:text-primary rounded-[2px]" onClick={onClose} aria-label={t('header.close_cart', 'Закрыть корзину')}>
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {items.length > 0 && (
          <div className="px-8 py-5 bg-surface-container-low border-b border-white/5 space-y-3">
            <div className="text-[10px] font-sans font-black tracking-[0.15em] text-on-surface-variant uppercase flex justify-between">
              {subtotal < FREE_SHIPPING_THRESHOLD ? (
                <>
                  <span>{t('header.free_shipping_hint', { amount: (FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString('ru-KZ') })}</span>
                  <span className="text-primary">{Math.round(progressPercent)}%</span>
                </>
              ) : (
                <span className="text-green-400">{t('header.free_shipping_success', '✨ Поздравляем! Доставка бесплатна!')}</span>
              )}
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <span className="material-symbols-outlined text-5xl text-outline">shopping_bag</span>
              <p className="font-label-caps text-on-surface-variant">{t('header.cart_empty', 'Корзина пуста')}</p>
            </div>
          ) : (
            <>
              <div className="space-y-8">
                {items.map(item => (
                  <div key={item.id + (item.variant || '')} className="flex gap-6">
                    <div className="w-24 h-24 bg-surface-container-low flex-none">
                      {item.image ? (
                        <ResponsiveImage alt={item.name} className="w-full h-full object-cover" src={item.image} loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-surface-container">{item.emoji || '🌸'}</div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-label-caps text-label-caps text-on-surface uppercase mb-1">{item.name}</h3>
                        {item.variant && <p className="text-xs text-on-surface-variant">{item.variant}</p>}
                        <p className="text-primary font-body-md">{item.price.toLocaleString('ru-KZ')} ₸</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-white/10">
                          <button
                            className="px-3 py-1 text-on-surface-variant hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-[2px]"
                            onClick={() => onUpdateQty(item.id, item.variant, Math.max(1, item.qty - 1))}
                            aria-label={t('common.decrease', 'Уменьшить')}
                          >-</button>
                          <span className="px-3 py-1 font-body-md">{item.qty}</span>
                          <button
                            className="px-3 py-1 text-on-surface-variant hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-[2px]"
                            onClick={() => onUpdateQty(item.id, item.variant, item.qty + 1)}
                            aria-label={t('common.increase', 'Увеличить')}
                          >+</button>
                        </div>
                        <button
                          className="text-xs text-on-surface-variant hover:text-error uppercase tracking-widest"
                          onClick={() => onRemove(item.id, item.variant)}
                        >{t('header.remove', 'Удалить')}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cross-selling Section inside scrollable list */}
              <div className="pt-8 border-t border-white/5 space-y-4">
                <h4 className="font-sans font-black text-[10px] tracking-[0.15em] text-white uppercase">{t('header.add_to_order', 'ДОБАВЬТЕ К ЗАКАЗУ:')}</h4>
                <div className="space-y-3">
                  {/* LELO Personal Moisturizer */}
                  {onAddToCart && !items.some(i => i.id === 101) && (
                    <div className="flex items-center justify-between bg-surface-container-low p-4 border border-white/5 rounded-[2px]">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🧴</span>
                        <div>
                          <p className="font-sans font-bold text-[10px] text-white uppercase tracking-wider">{t('product.crosssell.moisturizer_name', 'Personal Moisturizer')}</p>
                          <p className="font-sans text-[11px] text-primary">12 500 ₸</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onAddToCart({ id: 101, name: t('product.crosssell.moisturizer_name', 'Personal Moisturizer'), price: 12500, emoji: '🧴', variant: 'Default', qty: 1 })}
                        className="border border-primary text-primary font-sans font-bold text-[9px] tracking-widest px-3 py-1.5 uppercase hover:bg-primary hover:text-on-primary transition-all rounded-[2px]"
                      >
                        + {t('header.add_btn', 'ДОБАВИТЬ')}
                      </button>
                    </div>
                  )}
                  {/* LELO Cleaning Spray */}
                  {onAddToCart && !items.some(i => i.id === 102) && (
                    <div className="flex items-center justify-between bg-surface-container-low p-4 border border-white/5 rounded-[2px]">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🧼</span>
                        <div>
                          <p className="font-sans font-bold text-[10px] text-white uppercase tracking-wider">{t('product.crosssell.spray_name', 'Cleaning Spray')}</p>
                          <p className="font-sans text-[11px] text-primary">8 900 ₸</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onAddToCart({ id: 102, name: t('product.crosssell.spray_name', 'Cleaning Spray'), price: 8900, emoji: '🧼', variant: 'Default', qty: 1 })}
                        className="border border-primary text-primary font-sans font-bold text-[9px] tracking-widest px-3 py-1.5 uppercase hover:bg-primary hover:text-on-primary transition-all rounded-[2px]"
                      >
                        + {t('header.add_btn', 'ДОБАВИТЬ')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-8 bg-surface-container-low space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-[10px] text-on-surface-variant uppercase">{t('header.promo_label', 'ПРОМОКОД')}</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-background border border-white/10 px-4 py-2 text-[16px] text-on-surface focus:border-primary outline-none transition-colors"
                    placeholder={t('header.promo_placeholder', 'Введите код')}
                    type="text"
                    value={promo}
                    onChange={e => setPromo(e.target.value)}
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="px-4 py-2 border border-primary text-primary font-label-caps text-[10px] hover:bg-primary hover:text-on-primary transition-all"
                  >
                    {t('header.promo_btn', 'ПРИМЕНИТЬ')}
                  </button>
                </div>
                {appliedPromo && (
                  <p className="text-[10px] text-green-400 font-sans mt-1">{t('header.promo_applied', { code: appliedPromo })}</p>
                )}
              </div>
              <div className="h-px bg-white/10"></div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-end text-on-surface-variant">
                  <span className="font-label-caps uppercase">{t('header.subtotal', 'ПОДЫТОГ')}</span>
                  <span>{subtotal.toLocaleString('ru-KZ')} ₸</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between items-end text-red-400">
                    <span className="font-label-caps uppercase">{t('header.discount', 'СКИДКА 15%')}</span>
                    <span>- {discountAmount.toLocaleString('ru-KZ')} ₸</span>
                  </div>
                )}
                <div className="h-px bg-white/10 my-2"></div>
                <div className="flex justify-between items-end">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">{t('header.total', 'ИТОГО')}</span>
                  <span className="font-title-md text-title-md text-primary">{finalTotal.toLocaleString('ru-KZ')} ₸</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="w-full bg-primary text-on-primary font-label-caps text-label-caps uppercase py-5 hover:bg-[#ffe088] transition-colors tracking-widest"
              onClick={handleCheckoutNavigate}
            >
              {t('header.checkout_btn', 'ОФОРМИТЬ ЗАКАЗ')}
            </button>
            <button
              type="button"
              onClick={handleKaspiCheckout}
              disabled={isCheckingOut}
              className="w-full flex items-center justify-center gap-2 bg-[#E31E24] hover:bg-[#c9181e] disabled:bg-[#E31E24]/60 text-white font-sans font-black text-[10px] tracking-[0.2em] py-5 uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E31E24] active:scale-95 transition-all rounded-none cursor-pointer border-none mt-2"
              id="cart-drawer-kaspi"
            >
              {isCheckingOut ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3">
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  <span>{t('header.processing', 'Обработка...')}</span>
                </>
              ) : (
                <>
                  <span>{t('header.pay_kaspi', 'Оплатить через Kaspi Pay')}</span>
                  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm12 0h4v4h-4zm-6 6h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4z" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
