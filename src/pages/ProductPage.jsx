import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ProductPage({ onAddToCart }) {
  const { id } = useParams();
  const [selectedColor, setSelectedColor] = useState('Gold');
  const [qty, setQty] = useState(1);

  const colors = [
    { name: 'Gold', hex: '#d4af37' },
    { name: 'Midnight', hex: '#111111' },
    { name: 'Deep Rose', hex: '#b5585d' }
  ];

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart({
        id: 1,
        name: 'SONA™ 2 CRUISE',
        price: 72800,
        emoji: '🌸',
        variant: selectedColor,
        qty: qty
      });
    }
  };

  const handleCrossSellAdd = (name, price) => {
    if (onAddToCart) {
      onAddToCart({
        id: name === 'Personal Moisturizer' ? 2 : name === 'Cleaning Spray' ? 3 : 4,
        name: name,
        price: price,
        emoji: name === 'Personal Moisturizer' ? '🧴' : name === 'Cleaning Spray' ? '🧼' : '🕯️',
        variant: 'Default',
        qty: 1
      });
    }
  };

  return (
    <div className="bg-background text-on-surface font-sans antialiased overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      <main className="pt-20">
        {/* Hero Section */}
        <section className="min-h-[921px] flex flex-col md:flex-row max-w-container-max mx-auto relative">
          <div className="flex-1 flex flex-col justify-center px-margin-mobile md:px-margin-desktop py-20 z-10">
            <h1 className="font-display-lg text-display-lg text-on-surface mb-6 uppercase tracking-tight">
              SONA™ 2 CRUISE
            </h1>
            <p className="font-title-md text-title-md text-primary mb-12">72 800 ₸</p>
            <div className="mb-12">
              <span className="font-label-caps text-label-caps text-on-surface-variant block mb-4 uppercase">Color</span>
              <div className="flex gap-4">
                {colors.map(color => (
                  <button
                    key={color.name}
                    aria-label={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ring-2 ring-offset-2 ring-offset-background focus:ring-primary ${
                      selectedColor === color.name 
                        ? 'border-white ring-primary' 
                        : 'border-transparent ring-transparent'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  ></button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-white/10">
                <button
                  className="px-4 py-3 text-on-surface-variant hover:text-primary transition-colors label-caps"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                >−</button>
                <span className="px-5 py-3 text-body-md text-center min-w-[3rem]">{qty}</span>
                <button
                  className="px-4 py-3 text-on-surface-variant hover:text-primary transition-colors label-caps"
                  onClick={() => setQty(q => q + 1)}
                >+</button>
              </div>
              
              <button 
                onClick={handleAdd}
                className="bg-primary text-on-primary font-label-caps text-label-caps uppercase py-5 px-10 hover:bg-primary-container transition-colors duration-300 tracking-widest"
              >
                ADD TO CART
              </button>
            </div>
          </div>
          <div className="flex-1 relative min-h-[512px] md:min-h-full flex items-center justify-center bg-surface-container-lowest">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background z-10 hidden md:block"></div>
            <img 
              alt="SONA 2 Cruise product shot" 
              className="w-full h-full object-cover md:object-contain p-0 md:p-20" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGRFhBzwoZyzWcPrW7m_8Kcg6UbKtffebK_uAHa8h_6I2v7DBGq43YDc4Gq3mO_yPlT2gv7C75Bkkv9HwMmadZ1pJxultaBUtF3fJQLud8UveSZcvvl4WvShQ_vRsA60TJqG0Q0H_IqnidZKZXEBfu5mfCU_MEP37Yrpbwkyoy7s4M38qEEORWJSI65eKLLGxnQLx-0b8g_4acqBunmq8t0sw4lvxslLOHG0p9VO6cDQUBy5A9yuN0U5WnpuWN6XsXj32BQoVko2I"
            />
          </div>
        </section>

        {/* The Ritual Section */}
        <section className="min-h-screen flex flex-col md:flex-row max-w-container-max mx-auto mt-section-gap">
          <div className="flex-1 flex flex-col justify-center px-margin-mobile md:px-margin-desktop py-20 order-2 md:order-1 bg-surface-container-low">
            <h2 class="font-headline-lg text-headline-lg text-on-surface mb-8 uppercase">МАГИЯ ТЕХНОЛОГИЙ</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mb-8 leading-relaxed">
              Experience the pinnacle of sonic wave technology. The ultra-quiet motor delivers deep, resonant vibrations, while our patented Cruise Control™ ensures continuous, uninterrupted pleasure, automatically adjusting power when pressed firmly against the body.
            </p>
            <div className="w-16 h-px bg-primary-container mt-4"></div>
          </div>
          <div className="flex-1 relative min-h-[512px] md:min-h-full order-1 md:order-2">
            <img 
              alt="Macro texture of product" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm0netM0VEG4-KSXkwu2BgS1iXKGqAVsXjR0pG2uuNzv_s9-dxVvFRmdA1NZntDyit89lBQFNQCUlNGVAWWj-0Qxc7dy2aocCcHbDpbREYDw3Torhhx-NJOfEXJxW-b8xrCK3j36ajbHAFrUFxNkXCNd1uqhjHEjczESxjJviya9XE4U93F40tQH0oCmZyWEdudNk-hveqGOQkwTNRKt8q0x--mZVu6nSs2RMz5EhoKcehP4s7CIoNulqiGKuSH8NQ8YNdmfRdJSA"
            />
          </div>
        </section>

        {/* Features Icons */}
        <section className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface mb-6 font-light">water_drop</span>
              <h3 className="font-label-caps text-label-caps text-on-surface uppercase mb-2">100% Waterproof</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Fully submersible for bath and shower use.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface mb-6 font-light">spa</span>
              <h3 className="font-label-caps text-label-caps text-on-surface uppercase mb-2">Medical Silicone</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Ultra-smooth, body-safe, and hypoallergenic.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface mb-6 font-light">battery_charging_full</span>
              <h3 className="font-label-caps text-label-caps text-on-surface uppercase mb-2">USB Rechargeable</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Long-lasting power for extended sessions.</p>
            </div>
          </div>
        </section>

        {/* Technical Specs */}
        <section className="py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto bg-surface-container-lowest">
          <h2 className="font-headline-lg text-headline-lg text-center text-on-surface mb-16 uppercase">Specifications</h2>
          <div className="max-w-3xl mx-auto border-t border-white/10">
            <div className="flex flex-col sm:flex-row py-6 border-b border-white/10">
              <div className="w-full sm:w-1/3 font-label-caps text-label-caps text-on-surface-variant uppercase mb-2 sm:mb-0">Material</div>
              <div className="w-full sm:w-2/3 font-body-lg text-body-lg text-on-surface">Body-safe silicone, ABS</div>
            </div>
            <div className="flex flex-col sm:flex-row py-6 border-b border-white/10">
              <div className="w-full sm:w-1/3 font-label-caps text-label-caps text-on-surface-variant uppercase mb-2 sm:mb-0">Runtime</div>
              <div className="w-full sm:w-2/3 font-body-lg text-body-lg text-on-surface">Up to 2 hours</div>
            </div>
            <div className="flex flex-col sm:flex-row py-6 border-b border-white/10">
              <div className="w-full sm:w-1/3 font-label-caps text-label-caps text-on-surface-variant uppercase mb-2 sm:mb-0">Modes</div>
              <div className="w-full sm:w-2/3 font-body-lg text-body-lg text-on-surface">12 patterns</div>
            </div>
            <div className="flex flex-col sm:flex-row py-6 border-b border-white/10">
              <div className="w-full sm:w-1/3 font-label-caps text-label-caps text-on-surface-variant uppercase mb-2 sm:mb-0">Dimensions</div>
              <div className="w-full sm:w-2/3 font-body-lg text-body-lg text-on-surface">99 x 87 x 56 mm</div>
            </div>
          </div>
        </section>

        {/* Lifestyle Section */}
        <section className="relative h-[819px] w-full flex items-center justify-center my-section-gap">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <img 
            alt="Lifestyle shot on dark silk sheets" 
            className="absolute inset-0 w-full h-full object-cover z-0" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEHeDiealyOW57R_zYXMkviBV4EUx0LiFb9N60NHhOB59AwTAMqQwQPDBj6sklNyCawZIK0GnB2JDJ_JUv9K4XL2yhlOP61fvYvj_nzBXEULPcng9i60iYDuVytTIVrNzwCmDJ0Oe1aLa-TCzE2kAv_ju7wK-hIq_rX8uGjTr8b6VIqSk86LEeDIQ1eRiDRgCyEPJx9KufEGPnHWPyoJPZz-D_lMxNcGiL6xHSiQ2b47ZxlcC3SNtc7YrWxEcJG7ly5cHwxhTR1QA"
          />
          <div className="z-20 text-center px-6">
            <p className="font-display-lg text-display-lg text-pure-white italic max-w-4xl mx-auto drop-shadow-2xl">
              "The closest you can get to magic."
            </p>
          </div>
        </section>

        {/* Cross-Sell Grid */}
        <section className="py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="flex items-center justify-between mb-16">
            <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase">ДОПОЛНИТЕ СВОЙ РИТУАЛ</h2>
            <div className="hidden md:block h-px bg-white/10 flex-1 ml-12"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Card 1 */}
            <div className="group cursor-pointer bg-pure-white text-background transition-transform duration-500 hover:-translate-y-2">
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <img 
                  alt="Personal Moisturizer" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqziSFCyLTp7ZLVXgrCSd1GePgC3HAKS0mYEaBM-cogjUvU_IbGOr54AhzAV7l17BSBJ8NToWG7P-Q90rpYo5VJ1jqo8fCDomA-W_8En_-faig-jbzpJ5AJIodEagawEFD8vfZML54fFo-Sn9JRKUbC5QzPZmS4zXpS3zcgjUbqGrP0C5ph9rNp6L5u9VBJjPoRmOBmKAOPQQBKi_EQvllMByBqf0tUmIufN2l5MnAyRhIebm3WCk-pYy9CmcRBs-_mXpPt5Gsjtg"
                />
              </div>
              <div className="p-8 text-center flex flex-col items-center">
                <h3 className="font-label-caps text-label-caps uppercase mb-4 text-background">Personal Moisturizer</h3>
                <p className="font-body-md text-body-md text-gray-600 mb-6 line-clamp-2">Premium water-based formula for enhanced glide and comfort.</p>
                <div className="font-title-md text-title-md mb-6">12 500 ₸</div>
                <button 
                  onClick={() => handleCrossSellAdd('Personal Moisturizer', 12500)}
                  className="font-label-caps text-label-caps border border-background text-background px-6 py-3 uppercase hover:bg-background hover:text-pure-white transition-colors duration-300"
                >
                  Add to Cart
                </button>
              </div>
            </div>
            {/* Card 2 */}
            <div className="group cursor-pointer bg-pure-white text-background transition-transform duration-500 hover:-translate-y-2">
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <img 
                  alt="Cleaning Spray" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmig59xczUoR-n2aVFxU9txL_56FEhxwyEgECdo2yXniir4QXBo1bxBWPcJctm2VSIeih2xnJmMlChC4VNROdjPoFBbxjpL7zErkfbsK7D3f7bFeaD6wOZckEKNOs9ePZNaP7TOJZ6L8vS2N6g90pjVD1ATcpbCRjle14oV7cgW7WxoDuWmc7ctiae-gTKrWMNuCsiGLgado_cEuxAO4H-cBYUKUyIjQmG0AFQJ7FHOpcY99mtq_Ak6Bw88XX9VFP91aEB2aqVauw"
                />
              </div>
              <div className="p-8 text-center flex flex-col items-center">
                <h3 className="font-label-caps text-label-caps uppercase mb-4 text-background">Cleaning Spray</h3>
                <p className="font-body-md text-body-md text-gray-600 mb-6 line-clamp-2">Alcohol-free antibacterial spray for safe and easy maintenance.</p>
                <div className="font-title-md text-title-md mb-6">8 900 ₸</div>
                <button 
                  onClick={() => handleCrossSellAdd('Cleaning Spray', 8900)}
                  className="font-label-caps text-label-caps border border-background text-background px-6 py-3 uppercase hover:bg-background hover:text-pure-white transition-colors duration-300"
                >
                  Add to Cart
                </button>
              </div>
            </div>
            {/* Card 3 */}
            <div className="group cursor-pointer bg-pure-white text-background transition-transform duration-500 hover:-translate-y-2">
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <img 
                  alt="Scented Candle" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmCMa-6UB3n17ENxC8klc0m-CCMwCLMksjHuQVb8I4mF-4GxB6NyhN0aFjfQFyPdTmmo4Ll3b-dtMUYbvPo7HN1cpkBWLq-gqa-1vxhWsS97tPE_YxriZOsQ7QcRwhGX6P8_XklTHxbIp6_xmqZWyNdsF3xwk1JRMeifaMH5SlRqvU0TTQ2R8Ro4og8Xvz3Vx7AfYIa6kzgxCJV9FKk9ojiZGkxh0kR-WbCQ60Bqu3y3l878T_M4FsrPDqtWZpAiBGJtAq55z7-pQ"
                />
              </div>
              <div className="p-8 text-center flex flex-col items-center">
                <h3 className="font-label-caps text-label-caps uppercase mb-4 text-background">Scented Candle</h3>
                <p className="font-body-md text-body-md text-gray-600 mb-6 line-clamp-2">Set the mood with rich notes of amber, vanilla, and dark wood.</p>
                <div className="font-title-md text-title-md mb-6">15 200 ₸</div>
                <button 
                  onClick={() => handleCrossSellAdd('Scented Candle', 15200)}
                  className="font-label-caps text-label-caps border border-background text-background px-6 py-3 uppercase hover:bg-background hover:text-pure-white transition-colors duration-300"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Review Section */}
        <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low flex items-center justify-center text-center">
          <div className="max-w-4xl mx-auto">
            <span className="material-symbols-outlined text-4xl text-primary-container mb-8 block opacity-50">format_quote</span>
            <p className="font-headline-lg text-headline-lg text-on-surface italic leading-snug">
              "A masterpiece of engineering and pleasure."
            </p>
            <div className="w-12 h-px bg-primary-container mx-auto mt-8"></div>
          </div>
        </section>
      </main>
    </div>
  );
}
