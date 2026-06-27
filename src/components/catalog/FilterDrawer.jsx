import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function FilterDrawer({
  isFilterOpen,
  setIsFilterOpen,
  selectedStimulations,
  selectedPriceRanges,
  selectedFeatures,
  onlyDiscounted,
  setOnlyDiscounted,
  handleStimulationToggle,
  handlePriceRangeToggle,
  handleFeatureToggle,
  handleResetFilters,
}) {
  const { t } = useTranslation();

  return createPortal(
    <AnimatePresence>
      {isFilterOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFilterOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998]"
          />
          {/* Filter Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full max-w-full md:max-w-sm bg-white text-black z-[999] shadow-2xl flex flex-col font-sans"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-100 flex justify-between items-center relative z-[1000]">
              <h2 className="font-sans font-black text-[14px] tracking-[0.2em] text-black uppercase">{t('catalog.filters_upper')}</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-black hover:text-gray-600 transition-colors flex items-center justify-center border-none bg-transparent focus:outline-none"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {/* Scrollable Filters list */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* 1. Stimulation Area */}
              <div>
                <h3 className="font-sans font-bold text-[10px] tracking-widest text-gray-400 uppercase mb-4">{t('catalog.stim_zone')}</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { val: 'clitoris', label: t('catalog.stim_clit') },
                    { val: 'g-spot', label: t('catalog.stim_gspot') },
                    { val: 'anal', label: t('catalog.stim_anal') },
                    { val: 'prostate', label: t('catalog.stim_prostate') },
                    { val: 'couples', label: t('catalog.stim_couples') }
                  ].map(opt => {
                    const selected = selectedStimulations.includes(opt.val);
                    return (
                      <button
                        type="button"
                        key={opt.val}
                        onClick={() => handleStimulationToggle(opt.val)}
                        className={`py-3.5 px-2 text-center border font-sans font-bold text-[10px] tracking-wider uppercase rounded-[2px] transition-all duration-200 ${
                          selected
                            ? 'bg-black text-white border-black shadow-sm'
                            : 'bg-white text-black border-gray-200 hover:border-black'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Price Range */}
              <div>
                <h3 className="font-sans font-bold text-[10px] tracking-widest text-gray-400 uppercase mb-4">{t('catalog.price_filter')}</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { val: 'low', label: t('catalog.price_up_to_80') },
                    { val: 'mid', label: t('catalog.price_80_120', '80 000 ₸ – 120 000 ₸') },
                    { val: 'high', label: t('catalog.price_over_120') }
                  ].map(opt => {
                    const selected = selectedPriceRanges.includes(opt.val);
                    return (
                      <button
                        type="button"
                        key={opt.val}
                        onClick={() => handlePriceRangeToggle(opt.val)}
                        className={`py-3.5 px-2 text-center border font-sans font-bold text-[10px] tracking-wider uppercase rounded-[2px] transition-all duration-200 ${
                          selected
                            ? 'bg-black text-white border-black shadow-sm'
                            : 'bg-white text-black border-gray-200 hover:border-black'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Special Offers */}
              <div>
                <h3 className="font-sans font-bold text-[10px] tracking-widest text-gray-400 uppercase mb-4">{t('catalog.specials')}</h3>
                <button
                  type="button"
                  onClick={() => setOnlyDiscounted(!onlyDiscounted)}
                  className={`w-full py-4 px-4 text-center border font-sans font-bold text-[10px] tracking-wider uppercase rounded-[2px] transition-all duration-200 ${
                    onlyDiscounted
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-white text-black border-gray-200 hover:border-black'
                  }`}
                >
                  {t('catalog.only_discount')}
                </button>
              </div>

              {/* 4. Technologies & Features */}
              <div>
                <h3 className="font-sans font-bold text-[10px] tracking-widest text-gray-400 uppercase mb-4">{t('catalog.features_filter')}</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { val: 'cruise_control', label: 'Cruise Control™' },
                    { val: 'wave_motion', label: 'WaveMotion™' },
                    { val: 'sense_motion', label: 'SenseMotion™' },
                    { val: 'dual_stimulation', label: t('catalog.feat_dual') }
                  ].map(opt => {
                    const selected = selectedFeatures.includes(opt.val);
                    return (
                      <button
                        type="button"
                        key={opt.val}
                        onClick={() => handleFeatureToggle(opt.val)}
                        className={`py-3.5 px-2 text-center border font-sans font-bold text-[10px] tracking-wider uppercase rounded-[2px] transition-all duration-200 ${
                          selected
                            ? 'bg-black text-white border-black shadow-sm'
                            : 'bg-white text-black border-gray-200 hover:border-black'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-8 border-t border-gray-100 flex gap-4 bg-gray-50/50">
              <button
                onClick={handleResetFilters}
                className="flex-1 border border-black text-black font-sans font-bold text-xs tracking-wider py-3.5 hover:bg-black hover:text-white transition-all uppercase"
              >
                {t('catalog.reset')}
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 bg-black text-white font-sans font-bold text-xs tracking-wider py-3.5 hover:bg-gray-800 transition-colors uppercase"
              >
                {t('catalog.apply')}
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
