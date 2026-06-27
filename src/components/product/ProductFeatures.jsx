import React from 'react';

export default function ProductFeatures({ t }) {
  return (
    <>
    {/* Features Icons */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto border-b border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-4xl text-primary mb-6 font-light">water_drop</span>
              <h3 className="font-sans font-bold text-xs tracking-widest text-white uppercase mb-2">{t('product.waterproof')}</h3>
              <p className="font-sans text-xs text-on-surface-variant max-w-xs leading-relaxed">{t('product.waterproof_desc')}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-4xl text-primary mb-6 font-light">spa</span>
              <h3 className="font-sans font-bold text-xs tracking-widest text-white uppercase mb-2">{t('product.silicone')}</h3>
              <p className="font-sans text-xs text-on-surface-variant max-w-xs leading-relaxed">{t('product.silicone_desc')}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-4xl text-primary mb-6 font-light">battery_charging_full</span>
              <h3 className="font-sans font-bold text-xs tracking-widest text-white uppercase mb-2">{t('product.usb')}</h3>
              <p className="font-sans text-xs text-on-surface-variant max-w-xs leading-relaxed">{t('product.usb_desc')}</p>
            </div>
          </div>
        </section>


    </>
  );
}
