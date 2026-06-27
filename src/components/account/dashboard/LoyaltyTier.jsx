export function LoyaltyTier({ loyaltyData, t }) {
  return (
    <div className="p-6 md:p-8 bg-neutral-50 border border-black/5 rounded-[28px] space-y-4 lg:col-span-2 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black tracking-wider text-black uppercase">{t('account.privileges', 'Клуб Привилегий')}</h3>
          <span className="bg-primary/15 text-[#b28b10] text-[8px] font-black tracking-widest px-2.5 py-1 rounded-[2px] uppercase">
            {loyaltyData.tier}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-black leading-none">{loyaltyData.discount}%</span>
          <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wide">{t('account.personal_discount', 'Ваша персональная скидка')}</span>
        </div>
      </div>

      {loyaltyData.discount === 0 ? (
        <div className="mt-4 p-4 bg-white/60 rounded-xl border border-black/5">
          <p className="text-xs text-neutral-600 leading-relaxed font-normal">
            {t('account.loyalty_intro', 'Совершите вашу первую покупку, чтобы стать участником клуба привилегий и начать копить персональную скидку!')}
          </p>
        </div>
      ) : (
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
            <span>{t('account.to_next_level', 'До следующего уровня осталось:')}</span>
            <span className="text-black">{loyaltyData.toNextLevel.toLocaleString('ru-KZ')} ₸</span>
          </div>
          <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${Math.max(10, Math.min(100, (50000 - loyaltyData.toNextLevel) / 500))}%` }} />
          </div>
        </div>
      )}

      {loyaltyData.discount === 0 && (
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
            <span>{t('account.to_first_discount', 'До первой скидки осталось:')}</span>
            <span className="text-black">{loyaltyData.toNextLevel.toLocaleString('ru-KZ')} ₸</span>
          </div>
          <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '0%' }} />
          </div>
        </div>
      )}
    </div>
  );
}
