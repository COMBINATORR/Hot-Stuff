import { useTranslation } from 'react-i18next';

export default function ProductPreviewActions({ handleNavigateToProduct, handleAdd, variant = 'mobile' }) {
  const { t } = useTranslation();

  const isDesktop = variant === 'desktop';
  // Note: the original logic was swapped in the review, fixing it by swapping true/false.
  const containerClass = isDesktop ? "mt-6 flex gap-2.5" : "mt-8 flex gap-3";
  const viewButtonClass = isDesktop
    ? "flex-1 bg-white text-black border border-black font-sans font-bold text-[10px] tracking-[0.15em] uppercase py-3 hover:bg-black hover:text-white transition-all text-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black active:scale-[0.98]"
    : "flex-1 bg-white text-black border border-black font-sans font-bold text-[10px] tracking-[0.15em] py-3.5 uppercase text-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black active:scale-[0.98] transition-all";

  const addButtonClass = isDesktop
    ? "flex-1 bg-black text-white border border-black font-sans font-bold text-[10px] tracking-[0.15em] uppercase py-3 hover:bg-gray-800 transition-all"
    : "flex-1 bg-black text-white border border-black font-sans font-bold text-[10px] tracking-[0.15em] py-3.5 uppercase focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black active:scale-[0.98] transition-all";

  return (
    <div className={containerClass}>
      <button
        onClick={handleNavigateToProduct}
        className={viewButtonClass}
      >
        {t('product.view')}
      </button>
      <button
        onClick={handleAdd}
        className={addButtonClass}
      >
        {t('product.add_to_cart')}
      </button>
    </div>
  );
}
