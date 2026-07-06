import { useTranslation } from 'react-i18next';

export default function FreeShippingIndicator({ subtotal, freeShippingThreshold, progressPercent }) {
  const { t } = useTranslation();

  return (
    <div className="px-6 py-4 bg-stone-900 border-b border-white/5 space-y-2">
      <div className="text-[9px] font-bold tracking-wider text-stone-400 uppercase flex justify-between">
        {subtotal < freeShippingThreshold ? (
          <>
            <span>{t('header.free_shipping_hint', { defaultValue: 'до бесплатной доставки осталось {{amount}} ₸', amount: (freeShippingThreshold - subtotal).toLocaleString('ru-KZ') })}</span>
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
  );
}
