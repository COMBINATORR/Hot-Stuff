import React from 'react';

export default function ProductRitual({
  t,
  product,
  getTechnologyDescription
}) {
  return (
    <>
    {/* The Ritual Section */}
        <section className="min-h-[500px] md:min-h-[600px] flex flex-col md:flex-row max-w-container-max mx-auto mt-24">
          <div className="flex-1 flex flex-col justify-center px-margin-mobile md:px-margin-desktop py-16 order-2 md:order-1 bg-surface-container-low text-left">
            <h2 className="font-sans font-black text-[22px] md:text-[30px] tracking-[0.15em] text-white mb-6 uppercase">{t('product.magic_tech')}</h2>
            <p className="font-sans text-sm md:text-base text-on-surface-variant max-w-lg leading-relaxed mb-6">
              {getTechnologyDescription(product)}
            </p>
            <div className="w-16 h-[2px] bg-primary mt-4"></div>
          </div>
          <div className="flex-1 relative min-h-[350px] md:min-h-full order-1 md:order-2">
            <img
              alt="Macro texture of product"
              className="absolute inset-0 w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm0netM0VEG4-KSXkwu2BgS1iXKGqAVsXjR0pG2uuNzv_s9-dxVvFRmdA1NZntDyit89lBQFNQCUlNGVAWWj-0Qxc7dy2aocCcHbDpbREYDw3Torhhx-NJOfEXJxW-b8xrCK3j36ajbHAFrUFxNkXCNd1uqhjHEjczESxjJviya9XE4U93F40tQH0oCmZyWEdudNk-hveqGOQkwTNRKt8q0x--mZVu6nSs2RMz5EhoKcehP4s7CIoNulqiGKuSH8NQ8YNdmfRdJSA"
              loading="lazy"
            />
          </div>
        </section>


    </>
  );
}
