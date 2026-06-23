import React from 'react';
import { useTranslation } from 'react-i18next';
import Footer from './Footer';
import ResponsiveImage from './ResponsiveImage';
import newsletterBg from '../assets/images/newsletter_bg.png';

export default function FooterAndNewsletter() {
  const { t } = useTranslation();

  return (
    <>
      {/* ═══ NEWSLETTER ════════════════════════════ */}
      <section className="relative w-full aspect-[21/9] min-h-[400px] md:min-h-[500px] flex items-center justify-center overflow-hidden">
        <ResponsiveImage 
          src={newsletterBg} 
          alt="Newsletter Discount" 
          className="absolute inset-0 w-full h-full object-cover opacity-80" 
          loading="lazy" 
        />
        {/* Dark mask overlay to replicate LELO style */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center flex flex-col items-center">
          <h2 className="text-white text-[28px] sm:text-[36px] md:text-[48px] lg:text-[56px] font-black leading-tight mb-4 lowercase font-sans">
            {t('home.newsletter.title', 'скидка 15% на первый заказ')}
          </h2>
          <p className="text-white text-xs sm:text-sm md:text-base leading-relaxed mb-8 max-w-2xl">
            {t('home.newsletter.desc', 'Подпишитесь на нашу рассылку, чтобы первыми получать эксклюзивные предложения, обзоры новинок и секреты наслаждения.')}
          </p>

          <form className="w-full max-w-xl flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
            <div className="flex flex-row w-full h-12 sm:h-14">
              <input
                type="email"
                placeholder={t('home.newsletter.placeholder', 'ВАШ EMAIL')}
                required
                className="flex-1 bg-white px-5 text-black placeholder-gray-500 text-[16px] outline-none font-sans rounded-none"
              />
              <button 
                type="submit" 
                className="bg-black hover:bg-neutral-900 text-white font-sans font-bold text-xs sm:text-sm tracking-widest px-6 sm:px-10 uppercase transition-colors flex-none rounded-none"
              >
                {t('home.newsletter.subscribe_btn', 'подписаться')}
              </button>
            </div>
            
            <label className="flex items-center justify-center gap-2 text-[10px] sm:text-xs text-white/90 select-none cursor-pointer">
              <input 
                type="checkbox" 
                required 
                className="accent-primary w-4 h-4 rounded border-white/20 bg-transparent text-primary focus:ring-0 focus:ring-offset-0" 
              />
              <span>
                {t('home.newsletter.accept', 'Я согласен с ')}
                <a href="/legal?tab=privacy" className="underline hover:text-white transition-colors">
                  {t('home.newsletter.policy_link', 'политикой конфиденциальности')}
                </a>
                .
              </span>
            </label>
          </form>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </>
  );
}
