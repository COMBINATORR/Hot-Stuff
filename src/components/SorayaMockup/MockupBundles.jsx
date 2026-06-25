import React from 'react';
import { useTranslation } from 'react-i18next';
import { OperationAllgasmSvg, SorayaExperienceSvg } from './MockupAssets';

export function MockupBundles() {
  const { t } = useTranslation();
  return (
    <>
      {/* BUNDLES BLOCK (КУПИ НАБОР И СЭКОНОМЬ) */}
        <section className="py-8 px-6 bg-gray-50/20 border-t border-gray-100">
          <h3 className="font-sans font-black text-[13px] tracking-[0.2em] text-black text-center uppercase mb-8">
            {t('mockup.bundle_title', 'КУПИ НАБОР И СЭКОНОМЬ')}
          </h3>

          {/* Bundle 1 */}
          <div className="bg-white border border-gray-100 p-4 mb-6 relative shadow-sm rounded-card overflow-hidden">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-[#784B3E] flex-none overflow-hidden relative">
                <OperationAllgasmSvg />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-sans font-bold text-[11px] tracking-wider text-black uppercase underline decoration-1">
                  OPERATION ALLGASM
                </h4>
                <p className="text-[8px] text-gray-500 font-sans mt-1 leading-relaxed">
                  SORAYA Wave™, SONA™ 2 Cruise, Flickering Touch Massage Candle, Personal Moisturizer, Mouthwatering Spray
                </p>
                <div className="mt-2 flex flex-col font-sans">
                  <span className="text-primary font-bold text-[12px] leading-none">
                    319 EUR
                  </span>
                  <span className="text-primary font-bold text-[9px] mt-0.5">
                    {t('mockup.save_eur', { amount: '159,80' })}
                  </span>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 bg-white text-black border border-black font-sans font-bold text-[9px] tracking-widest py-2.5 uppercase hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 transition-all">
              {t('product.preview', 'ПРЕДПРОСМОТР')}
            </button>
          </div>

          {/* Bundle 2 */}
          <div className="bg-white border border-gray-100 p-4 relative shadow-sm rounded-card overflow-hidden">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-[#2A4B7C] flex-none overflow-hidden relative">
                <SorayaExperienceSvg />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-sans font-bold text-[11px] tracking-wider text-black uppercase underline decoration-1">
                  SORAYA EXPERIENCE
                </h4>
                <p className="text-[8px] text-gray-500 font-sans mt-1 leading-relaxed">
                  SORAYA Wave™, SORAYA Beads™, Personal Moisturizer, Bad Day Killer - Clitherapy Balm
                </p>
                <div className="mt-2 flex flex-col font-sans">
                  <span className="text-primary font-bold text-[12px] leading-none">
                    359 EUR
                  </span>
                  <span className="text-primary font-bold text-[9px] mt-0.5">
                    {t('mockup.save_eur', { amount: '159,90' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

    </>
  );
}
