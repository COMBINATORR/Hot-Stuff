import React from 'react';

export default function ProductSpecs({ t, product, translateSpecValue }) {
  return (
    <>
    {/* Technical Specs */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto bg-black text-left">
          <h2 className="font-sans font-black text-[22px] md:text-[30px] tracking-[0.15em] text-center text-white mb-16 uppercase">{t('product.tech_specs')}</h2>
          <div className="max-w-3xl mx-auto border-t border-white/10 font-sans text-sm">
            <div className="flex flex-col sm:flex-row py-6 border-b border-white/10">
              <div className="w-full sm:w-1/3 font-bold text-outline uppercase tracking-wider mb-2 sm:mb-0">{t('product.spec_material')}</div>
              <div className="w-full sm:w-2/3 text-white">{translateSpecValue(product.specs?.material, 'material') || translateSpecValue('Безопасный медицинский силикон, ABS-пластик', 'material')}</div>
            </div>
            <div className="flex flex-col sm:flex-row py-6 border-b border-white/10">
              <div className="w-full sm:w-1/3 font-bold text-outline uppercase tracking-wider mb-2 sm:mb-0">{t('product.spec_runtime')}</div>
              <div className="w-full sm:w-2/3 text-white">{translateSpecValue(product.specs?.runtime, 'runtime') || translateSpecValue('До 2 часов непрерывного использования', 'runtime')}</div>
            </div>
            <div className="flex flex-col sm:flex-row py-6 border-b border-white/10">
              <div className="w-full sm:w-1/3 font-bold text-outline uppercase tracking-wider mb-2 sm:mb-0">{t('product.spec_modes')}</div>
              <div className="w-full sm:w-2/3 text-white">{translateSpecValue(product.specs?.modes, 'modes') || translateSpecValue('Множество настраиваемых паттернов', 'modes')}</div>
            </div>
            <div className="flex flex-col sm:flex-row py-6 border-b border-white/10">
              <div className="w-full sm:w-1/3 font-bold text-outline uppercase tracking-wider mb-2 sm:mb-0">{t('product.spec_dimensions')}</div>
              <div className="w-full sm:w-2/3 text-white">{translateSpecValue(product.specs?.dimensions, 'dimensions') || translateSpecValue('Эргономичный дизайн', 'dimensions')}</div>
            </div>
          </div>
        </section>


    </>
  );
}
