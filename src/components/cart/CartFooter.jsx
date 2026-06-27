import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CartFooter({
  promo,
  setPromo,
  appliedPromo,
  handleApplyPromo,
  discountAmount,
  finalTotal,
  isCheckingOut,
  handleKaspiCheckout,
  handleCheckoutNavigate,
}) {
  const { t } = useTranslation();

  return (
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
  );
}
