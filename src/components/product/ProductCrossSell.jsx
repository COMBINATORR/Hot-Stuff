export default function ProductCrossSell({ t, handleCrossSellAdd }) {
  return (
    <>
    {/* Cross-Sell Grid */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-left">
          <div className="flex items-center justify-between mb-16">
            <h2 className="font-sans font-black text-[22px] md:text-[30px] tracking-[0.15em] text-white uppercase">{t('product.complete_ritual')}</h2>
            <div className="hidden md:block h-px bg-white/10 flex-1 ml-12"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Card 1 */}
            <div className="group cursor-pointer bg-neutral-900 text-white transition-all duration-500 hover:-translate-y-2 border border-white/5">
              <div className="aspect-square bg-neutral-950 relative overflow-hidden">
                <img
                  alt="Personal Moisturizer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqziSFCyLTp7ZLVXgrCSd1GePgC3HAKS0mYEaBM-cogjUvU_IbGOr54AhzAV7l17BSBJ8NToWG7P-Q90rpYo5VJ1jqo8fCDomA-W_8En_-faig-jbzpJ5AJIodEagawEFD8vfZML54fFo-Sn9JRKUbC5QzPZmS4zXpS3zcgjUbqGrP0C5ph9rNp6L5u9VBJjPoRmOBmKAOPQQBKi_EQvllMByBqf0tUmIufN2l5MnAyRhIebm3WCk-pYy9CmcRBs-_mXpPt5Gsjtg"
                  loading="lazy"
                />
              </div>
              <div className="p-8 text-center flex flex-col items-center">
                <h3 className="font-sans font-bold text-xs tracking-widest uppercase mb-4 text-white">{t('product.crosssell.moisturizer_name', 'Personal Moisturizer')}</h3>
                <p className="font-sans text-xs text-outline mb-6 line-clamp-2">{t('product.crosssell.moisturizer_desc')}</p>
                <div className="font-sans font-bold text-lg mb-6 text-primary">12 500 ₸</div>
                <button
                  onClick={() => handleCrossSellAdd('moisturizer', 'Personal Moisturizer', 12500)}
                  className="font-sans font-bold text-[10px] tracking-widest border border-white text-white px-8 py-3 uppercase hover:bg-white hover:text-black transition-colors duration-300"
                >
                  {t('product.add_to_cart')}
                </button>
              </div>
            </div>
            {/* Card 2 */}
            <div className="group cursor-pointer bg-neutral-900 text-white transition-all duration-500 hover:-translate-y-2 border border-white/5">
              <div className="aspect-square bg-neutral-950 relative overflow-hidden">
                <img
                  alt="Cleaning Spray"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmig59xczUoR-n2aVFxU9txL_56FEhxwyEgECdo2yXniir4QXBo1bxBWPcJctm2VSIeih2xnJmMlChC4VNROdjPoFBbxjpL7zErkfbsK7D3f7bFeaD6wOZckEKNOs9ePZNaP7TOJZ6L8vS2N6g90pjVD1ATcpbCRjle14oV7cgW7WxoDuWmc7ctiae-gTKrWMNuCsiGLgado_cEuxAO4H-cBYUKUyIjQmG0AFQJ7FHOpcY99mtq_Ak6Bw88XX9VFP91aEB2aqVauw"
                  loading="lazy"
                />
              </div>
              <div className="p-8 text-center flex flex-col items-center">
                <h3 className="font-sans font-bold text-xs tracking-widest uppercase mb-4 text-white">{t('product.crosssell.spray_name', 'Cleaning Spray')}</h3>
                <p className="font-sans text-xs text-outline mb-6 line-clamp-2">{t('product.crosssell.spray_desc')}</p>
                <div className="font-sans font-bold text-lg mb-6 text-primary">8 900 ₸</div>
                <button
                  onClick={() => handleCrossSellAdd('spray', 'Cleaning Spray', 8900)}
                  className="font-sans font-bold text-[10px] tracking-widest border border-white text-white px-8 py-3 uppercase hover:bg-white hover:text-black transition-colors duration-300"
                >
                  {t('product.add_to_cart')}
                </button>
              </div>
            </div>
            {/* Card 3 */}
            <div className="group cursor-pointer bg-neutral-900 text-white transition-all duration-500 hover:-translate-y-2 border border-white/5">
              <div className="aspect-square bg-neutral-950 relative overflow-hidden">
                <img
                  alt="Scented Candle"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmCMa-6UB3n17ENxC8klc0m-CCMwCLMksjHuQVb8I4mF-4GxB6NyhN0aFjfQFyPdTmmo4Ll3b-dtMUYbvPo7HN1cpkBWLq-gqa-1vxhWsS97tPE_YxriZOsQ7QcRwhGX6P8_XklTHxbIp6_xmqZWyNdsF3xwk1JRMeifaMH5SlRqvU0TTQ2R8Ro4og8Xvz3Vx7AfYIa6kzgxCJV9FKk9ojiZGkxh0kR-WbCQ60Bqu3y3l878T_M4FsrPDqtWZpAiBGJtAq55z7-pQ"
                  loading="lazy"
                />
              </div>
              <div className="p-8 text-center flex flex-col items-center">
                <h3 className="font-sans font-bold text-xs tracking-widest uppercase mb-4 text-white">{t('product.crosssell.candle_name', 'Scented Candle')}</h3>
                <p className="font-sans text-xs text-outline mb-6 line-clamp-2">{t('product.crosssell.candle_desc')}</p>
                <div className="font-sans font-bold text-lg mb-6 text-primary">15 200 ₸</div>
                <button
                  onClick={() => handleCrossSellAdd('candle', 'Scented Candle', 15200)}
                  className="font-sans font-bold text-[10px] tracking-widest border border-white text-white px-8 py-3 uppercase hover:bg-white hover:text-black transition-colors duration-300"
                >
                  {t('product.add_to_cart')}
                </button>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
