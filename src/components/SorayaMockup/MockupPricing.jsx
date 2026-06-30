
import { useTranslation } from 'react-i18next';

export function MockupPricing({ selectedColor, setSelectedColor, colorHexes }) {
  const { t } = useTranslation();
  return (
    <>
      {/* PRICING & COLOR BLOCK */}
        <section className="px-6 py-6">
          <div className="flex justify-between items-start">
            {/* Prices */}
            <div className="flex flex-col font-sans">
              <span className="text-gray-400 line-through text-[11px]">
                259 EUR
              </span>
              <span className="text-primary font-bold text-[18px] mt-0.5 leading-none">
                202,02 EUR
              </span>
              <span className="text-primary font-bold text-[10px] mt-1.5">
                {t('mockup.save_eur', { amount: '56,98' })}
              </span>
            </div>

            {/* Colors Selector */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                {Object.keys(colorHexes).map((name) => {
                  const isSelected = selectedColor === name;
                  return (
                    <button
                      key={name}
                      onClick={() => setSelectedColor(name)}
                      className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${
                        isSelected ? 'border-black ring-1 ring-black scale-105' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: colorHexes[name] }}
                      aria-label={name}
                    >
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference" />
                      )}
                    </button>
                  );
                })}
              </div>
              <span className="font-sans font-bold text-[9px] tracking-wider text-black uppercase mt-2">
                {selectedColor === 'Deep Rose' ? 'DEEP ROSE' : selectedColor.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Discount Tag */}
          <div className="mt-4 flex">
            <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-none leading-none">
              -22%
            </span>
          </div>

          {/* Actions Button Grid */}
          <div className="mt-6 flex gap-2.5">
            <button className="flex-1 bg-white text-black border border-black font-sans font-bold text-[10px] tracking-[0.15em] py-3.5 uppercase hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 transition-all">
              {t('product.view', 'ПОСМОТРЕТЬ')}
            </button>
            <button className="flex-1 bg-black text-white border border-black font-sans font-bold text-[10px] tracking-[0.15em] py-3.5 uppercase hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 transition-all">
              {t('product.add_to_cart', 'ADD TO CART')}
            </button>
          </div>
        </section>

    </>
  );
}
