import { useTranslation } from 'react-i18next';

export default function ProductPreviewAccordions({ product, expandedSection, toggleSection, variant = 'mobile' }) {
  const { t } = useTranslation();

  const isDesktop = variant === 'desktop';
  // Note: the original logic was swapped in the review, fixing it by swapping true/false.
  const containerClass = isDesktop ? "mt-6 border-t border-gray-100" : "mt-8 border-t border-gray-100 pb-12";
  const iconClass = isDesktop ? "material-symbols-outlined text-[16px] text-gray-400" : "material-symbols-outlined text-[16px] text-gray-500";
  const labelIconClass = isDesktop ? "material-symbols-outlined text-[18px] text-gray-400 font-light" : "material-symbols-outlined text-[18px] text-gray-500 font-light";
  const pClass = isDesktop ? "mt-2 text-[11px] text-gray-600 leading-relaxed font-sans" : "mt-2.5 text-[11px] text-gray-600 leading-relaxed font-sans";
  const pIconClass = "mt-2 pl-7 text-[10px] text-gray-500 font-sans";

  return (
    <div className={containerClass}>
      {/* Description */}
      <div className="border-b border-gray-100 py-3.5">
        <button onClick={() => toggleSection('description')} className="w-full flex justify-between items-center text-left">
          <span className="text-[11px] font-bold tracking-wider text-black">{t('product.desc_tab')}</span>
          <span className={iconClass}>
            {expandedSection === 'description' ? 'expand_less' : 'expand_more'}
          </span>
        </button>
        {expandedSection === 'description' && (
          <p className={pClass}>
            {t('product.tech_defaults.' + product.id, product.description || `Вибромассажер премиального класса ${product.name}.`)}
          </p>
        )}
      </div>


      {/* Secure */}
      <div className="border-b border-gray-100 py-3.5">
        <button onClick={() => toggleSection('secure')} className="w-full flex justify-between items-center text-left">
          <div className="flex items-center gap-2">
            <span className={labelIconClass}>credit_card</span>
            {!isDesktop ? (
                <span className="text-[11px] font-bold tracking-wider text-black">{t('product.safe_tab')}</span>
            ) : (
              <div>
                <span className="text-[11px] font-bold tracking-wider text-black block">{t('product.safe_tab')}</span>
                <span className="text-[9px] text-gray-400 font-sans">{t('product.safe')}</span>
              </div>
            )}
          </div>
          <span className={iconClass}>
            {expandedSection === 'secure' ? 'expand_less' : 'expand_more'}
          </span>
        </button>
        {expandedSection === 'secure' && (
          <p className={pIconClass}>{t('product.safe_desc')}</p>
        )}
      </div>

      {/* Delivery */}
      <div className="border-b border-gray-100 py-3.5">
        <button onClick={() => toggleSection('delivery')} className="w-full flex justify-between items-center text-left">
          <div className="flex items-center gap-2">
            <span className={labelIconClass}>local_shipping</span>
            {!isDesktop ? (
               <span className="text-[11px] font-bold tracking-wider text-black">{t('product.delivery_tab')}</span>
            ) : (
              <div>
                <span className="text-[11px] font-bold tracking-wider text-black block">{t('product.delivery_tab')}</span>
                <span className="text-[9px] text-gray-400 font-sans">{t('product.delivery_tab')}</span>
              </div>
            )}
          </div>
          <span className={iconClass}>
            {expandedSection === 'delivery' ? 'expand_less' : 'expand_more'}
          </span>
        </button>
        {expandedSection === 'delivery' && (
          <p className={pIconClass}>{t('product.delivery_desc')}</p>
        )}
      </div>

      {/* Package */}
      <div className="border-b border-gray-100 py-3.5">
        <button onClick={() => toggleSection('package')} className="w-full flex justify-between items-center text-left">
          <div className="flex items-center gap-2">
            <span className={labelIconClass}>visibility_off</span>
            {!isDesktop ? (
              <span className="text-[11px] font-bold tracking-wider text-black">{t('product.discreet_tab')}</span>
            ) : (
              <div>
                <span className="text-[11px] font-bold tracking-wider text-black block">{t('product.discreet_tab')}</span>
                <span className="text-[9px] text-gray-400 font-sans">{t('product.discreet_tab')}</span>
              </div>
            )}
          </div>
          <span className={iconClass}>
            {expandedSection === 'package' ? 'expand_less' : 'expand_more'}
          </span>
        </button>
        {expandedSection === 'package' && (
          <p className={pIconClass}>{t('product.discreet_desc')}</p>
        )}
      </div>
    </div>
  );
}
