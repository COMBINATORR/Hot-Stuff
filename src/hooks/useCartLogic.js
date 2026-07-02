import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

export function useCartLogic({ items = [], setItems, onClose, onUpdateQty, onRemove }) {
  const { t, i18n } = useTranslation();
  const [promo, setPromo] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const navigate = useNavigate();

  const handleUpdateQty = onUpdateQty || ((id, variant, qty) => {
    if (setItems) {
      setItems(prev => {
        const next = new Array(prev.length);
        for (let idx = 0; idx < prev.length; idx++) {
          const i = prev[idx];
          if (i.id === id && i.variant === variant) {
            next[idx] = { ...i, qty: Math.max(1, qty) };
          } else {
            next[idx] = i;
          }
        }
        return next;
      });
    }
  });

  const handleRemove = onRemove || ((id, variant) => {
    if (setItems) {
      setItems(prev => {
        const next = [];
        for (let idx = 0; idx < prev.length; idx++) {
          const i = prev[idx];
          if (!(i.id === id && i.variant === variant)) {
            next.push(i);
          }
        }
        return next;
      });
    }
  });

  const FREE_SHIPPING_THRESHOLD = 30000;

  const { subtotal, progressPercent, discountAmount, finalTotal } = useMemo(() => {
    const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
    const progress = Math.min((sub / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const discount = appliedPromo ? sub * 0.15 : 0;
    const total = sub - discount;
    return { subtotal: sub, progressPercent: progress, discountAmount: discount, finalTotal: total };
  }, [items, appliedPromo]);

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

  return {
    t,
    promo,
    setPromo,
    appliedPromo,
    isCheckingOut,
    checkoutError,
    handleUpdateQty,
    handleRemove,
    subtotal,
    progressPercent,
    discountAmount,
    finalTotal,
    handleCheckoutNavigate,
    handleApplyPromo,
    handleKaspiCheckout,
    FREE_SHIPPING_THRESHOLD
  };
}
