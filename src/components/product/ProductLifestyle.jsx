export default function ProductLifestyle({ t }) {
  return (
    <>
    {/* Lifestyle Section */}
        <section className="relative h-[600px] md:h-[750px] w-full flex items-center justify-center my-16">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <img
            alt="Lifestyle shot on dark silk sheets"
            className="absolute inset-0 w-full h-full object-cover z-0"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEHeDiealyOW57R_zYXMkviBV4EUx0LiFb9N60NHhOB59AwTAMqQwQPDBj6sklNyCawZIK0GnB2JDJ_JUv9K4XL2yhlOP61fvYvj_nzBXEULPcng9i60iYDuVytTIVrNzwCmDJ0Oe1aLa-TCzE2kAv_ju7wK-hIq_rX8uGjTr8b6VIqSk86LEeDIQ1eRiDRgCyEPJx9KufEGPnHWPyoJPZz-D_lMxNcGiL6xHSiQ2b47ZxlcC3SNtc7YrWxEcJG7ly5cHwxhTR1QA"
            loading="lazy"
          />
          <div className="z-20 text-center px-6">
            <p className="font-sans font-black text-[32px] sm:text-[48px] md:text-[56px] text-white italic max-w-4xl mx-auto drop-shadow-2xl">
              {t('product.magic_quote', '"The closest you can get to magic."')}
            </p>
          </div>
        </section>
    </>
  );
}
