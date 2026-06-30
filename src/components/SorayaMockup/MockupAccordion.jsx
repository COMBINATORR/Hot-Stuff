import { useTranslation } from 'react-i18next';

export function MockupAccordion({ expandedAccordions, toggleAccordion }) {
  const { t } = useTranslation();
  return (
    <>
      {/* ACCORDION BLOCK (ОПИСАНИЕ И ГАРАНТИЯ) */}
        <section className="border-t border-gray-100">
          <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100">
            <span className="text-[10px] font-bold tracking-[0.15em] text-black uppercase block">
              {t('mockup.desc_tab', 'ОПИСАНИЕ И ГАРАНТИЯ')}
            </span>
          </div>

          {/* Expanded text */}
          <div className="border-b border-gray-100 py-4 px-6">
            <div className="flex justify-between items-start text-left">
              <p className="text-[11px] text-gray-600 leading-relaxed font-sans flex-1 pr-4">
                {t('mockup.desc_text', 'Нежный вибратор-кролик WaveMotion™ стимулирует не только клитор, но и точку G, позволяя уверенно дойти до самого удовлетворяющего оргазма в жизни.')}
              </p>
              <button
                onClick={() => toggleAccordion('desc')}
                className="text-gray-400 hover:text-black flex-none"
                aria-label={t('mockup.description_toggle', 'Переключатель описания')}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {expandedAccordions.desc ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            </div>
          </div>

          {/* Accordion 2: ГАРАНТИЯ */}
          <div className="border-b border-gray-100 py-4 px-6">
            <button
              onClick={() => toggleAccordion('warranty')}
              className="w-full flex justify-between items-center text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-gray-500 font-light">verified_user</span>
                <span className="text-[10px] font-bold tracking-wider text-black">{t('product.warranty_tab', 'ГАРАНТИЯ')}</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-gray-500">
                {expandedAccordions.warranty ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {expandedAccordions.warranty && (
              <p className="mt-2 pl-8 text-[10px] text-gray-500 font-sans">
                {t('mockup.warranty', 'Гарантия 2 года на все функциональные части.')}
              </p>
            )}
          </div>

          {/* Accordion 3: БЕЗОПАСНАЯ ПОКУПКА */}
          <div className="border-b border-gray-100 py-4 px-6">
            <button
              onClick={() => toggleAccordion('secure')}
              className="w-full flex justify-between items-center text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-gray-500 font-light">credit_card</span>
                <span className="text-[10px] font-bold tracking-wider text-black">{t('product.safe_tab', 'БЕЗОПАСНАЯ ПОКУПКА')}</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-gray-500">
                {expandedAccordions.secure ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {expandedAccordions.secure && (
              <p className="mt-2 pl-8 text-[10px] text-gray-500 font-sans">
                {t('mockup.safe', '100% безопасная оплата с шифрованием данных SSL.')}
              </p>
            )}
          </div>

          {/* Accordion 4: ИНФОРМАЦИЯ О ДОСТАВКЕ */}
          <div className="border-b border-gray-100 py-4 px-6">
            <button
              onClick={() => toggleAccordion('delivery')}
              className="w-full flex justify-between items-center text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-gray-500 font-light">local_shipping</span>
                <span className="text-[10px] font-bold tracking-wider text-black">{t('product.delivery_tab', 'ИНФОРМАЦИЯ О ДОСТАВКЕ')}</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-gray-500">
                {expandedAccordions.delivery ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {expandedAccordions.delivery && (
              <p className="mt-2 pl-8 text-[10px] text-gray-500 font-sans">
                {t('mockup.delivery', 'Быстрая и надежная доставка по всему миру.')}
              </p>
            )}
          </div>

          {/* Accordion 5: НЕПРИМЕТНАЯ УПАКОВКА */}
          <div className="border-b border-gray-100 py-4 px-6">
            <button
              onClick={() => toggleAccordion('package')}
              className="w-full flex justify-between items-center text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-gray-500 font-light">visibility_off</span>
                <span className="text-[10px] font-bold tracking-wider text-black">{t('product.discreet_tab', 'НЕПРИМЕТНАЯ УПАКОВКА')}</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-gray-500">
                {expandedAccordions.package ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {expandedAccordions.package && (
              <p className="mt-2 pl-8 text-[10px] text-gray-500 font-sans">
                {t('mockup.package', 'Сохраняйте инкогнито: коробка без логотипов и надписей.')}
              </p>
            )}
          </div>
        </section>

    </>
  );
}
