import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

const LogoIcon = () => (
  <div className="w-8 h-8 bg-[#31A8FF] rounded-[8px] flex items-center justify-center shadow-[0_0_15px_rgba(49,168,255,0.3)]">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 20C4 20 4 14 10 10C16 6 20 4 20 4C20 4 18 8 14 14C10 20 4 20 4 20Z" fill="white" />
      <path d="M4 20L10 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

const handlePanic = () => {
  window.location.replace('https://www.google.com');
};

const FooterCard = () => {
  const { t, i18n } = useTranslation();

  const getLocalizedPath = (path: string) => {
    const currentLang = i18n.language;
    if (currentLang && currentLang !== 'ru' && ['kz', 'en'].includes(currentLang)) {
      return `/${currentLang}${path}`;
    }
    return path;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handlePanic();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto bg-[#141414] rounded-[48px] border border-zinc-800 shadow-xl overflow-hidden m-2 font-sans-inter">
      {/* Inner Black Box */}
      <div className="bg-black rounded-[40px] m-2 shadow-sm p-8 md:p-10 lg:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        
        {/* Brand Info */}
        <div className="lg:col-span-2 space-y-8 flex flex-col justify-start">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <span className="text-[26px] font-black tracking-widest text-white uppercase">
              HOT STUFF
            </span>
          </div>
          <p className="text-[#64748B] leading-relaxed text-[15px] font-normal max-w-[320px]">
            {t('footer.anon_desc')}
          </p>
          
          {/* Socials Group */}
          <div className="flex gap-3">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-[44px] h-[44px] flex items-center justify-center rounded-xl border border-zinc-800 bg-black shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-zinc-900 transition-all active:scale-95 group">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="w-[44px] h-[44px] flex items-center justify-center rounded-xl border border-zinc-800 bg-black shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-zinc-900 transition-all active:scale-95 group">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </a>
            <a href="https://wa.me" target="_blank" rel="noopener noreferrer" className="w-[44px] h-[44px] flex items-center justify-center rounded-xl border border-zinc-800 bg-black shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-zinc-900 transition-all active:scale-95 group">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </a>
          </div>
        </div>

        {/* Product Column */}
        <div className="space-y-6 text-left">
          <h4 className="text-[14px] font-medium text-[#94A3B8] uppercase tracking-wider">{t('footer.buyers')}</h4>
          <ul className="space-y-4">
            <li><Link to={getLocalizedPath('/catalog')} className="text-[15px] font-medium text-neutral-300 hover:text-[#31A8FF] transition-colors block">{t('footer.size_guide')}</Link></li>
            <li><Link to={getLocalizedPath('/catalog')} className="text-[15px] font-medium text-neutral-300 hover:text-[#31A8FF] transition-colors block">{t('footer.faq', 'FAQ')}</Link></li>
            <li><Link to={getLocalizedPath('/legal?tab=return')} className="text-[15px] font-medium text-neutral-300 hover:text-[#31A8FF] transition-colors block">{t('footer.returns')}</Link></li>
            <li><Link to={getLocalizedPath('/catalog')} className="text-[15px] font-medium text-neutral-300 hover:text-[#31A8FF] transition-colors block">{t('footer.support')}</Link></li>
          </ul>
        </div>

        {/* Science Column */}
        <div className="space-y-6 text-left">
          <h4 className="text-[14px] font-medium text-[#94A3B8] uppercase tracking-wider">{t('footer.delivery_title')}</h4>
          <p className="text-neutral-400 text-[13px] leading-relaxed max-w-[200px]">
            {t('footer.delivery_desc')}
          </p>
          <div className="flex flex-wrap gap-2 pt-2 max-w-[200px]">
            <span className="bg-yellow-400 text-black text-[10px] font-extrabold px-2.5 py-1 rounded-[6px] tracking-wider uppercase">KASPI PAY</span>
            <span className="border border-zinc-800 text-neutral-300 text-[10px] font-bold px-2 py-1 rounded-[6px] tracking-widest uppercase bg-zinc-900/50">VISA</span>
            <span className="border border-zinc-800 text-neutral-300 text-[10px] font-bold px-2 py-1 rounded-[6px] tracking-widest uppercase bg-zinc-900/50">MC</span>
          </div>
        </div>

        {/* Company Column */}
        <div className="space-y-6 text-left">
          <h4 className="text-[14px] font-medium text-[#94A3B8] uppercase tracking-wider">{t('footer.legal_title')}</h4>
          <ul className="space-y-4">
            <li><Link to={getLocalizedPath('/legal?tab=privacy')} className="text-[15px] font-medium text-neutral-300 hover:text-[#31A8FF] transition-colors block">{t('footer.privacy')}</Link></li>
            <li><Link to={getLocalizedPath('/legal?tab=terms')} className="text-[15px] font-medium text-neutral-300 hover:text-[#31A8FF] transition-colors block">{t('footer.offer')}</Link></li>
          </ul>
          <div className="flex gap-3 items-start mt-6 pt-6 border-t border-zinc-900">
            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-yellow-400 text-black text-xs font-black rounded-[6px]">18+</div>
            <p className="text-neutral-500 text-[11px] leading-snug">{t('footer.warning')}</p>
          </div>
        </div>

      </div>

      {/* Bottom Legal Bar */}
      <div className="px-6 sm:px-12 md:px-16 lg:px-20 py-6 flex flex-col md:flex-row justify-between items-center gap-6 text-[15px] border-t border-zinc-900 bg-[#141414]">
        <div className="flex items-center gap-4">
          <p className="text-[#64748B] font-medium text-[14px]">{t('footer.copyright')}</p>
        </div>
        
        <div className="flex row gap-6 sm:gap-8 text-[#64748B] font-medium items-center">
          <button onClick={handlePanic} className="flex items-center gap-2 hover:text-white transition-colors text-[12px] sm:text-[13px] uppercase tracking-wider bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800 hover:border-zinc-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            {t('panic.btn')}
          </button>
          <div className="hidden sm:block w-[1px] h-4 bg-zinc-800" />
          <span className="hidden sm:inline text-[12px] uppercase tracking-[0.2em] text-[#94A3B8]">{t('footer.anon_guaranteed').toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

const GlassText = () => {
  return (
    <div className="relative w-full flex items-center justify-center select-none pt-0 bg-transparent overflow-hidden my-4">
      {/* Invisible SVG for Filter */}
      <svg className="absolute w-0 h-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.25" result="outer-shadow"/>
            <feComponentTransfer in="SourceAlpha" result="alpha"><feFuncA type="linear" slope="1" /></feComponentTransfer>
            <feOffset in="alpha" dx="0" dy="4" result="offset-white" />
            <feGaussianBlur in="offset-white" stdDeviation="4" result="blur-white" />
            <feComposite in="alpha" in2="blur-white" operator="out" result="inner-white-mask" />
            <feFlood floodColor="#ffffff" floodOpacity="0.25" result="white-fill" />
            <feComposite in="white-fill" in2="inner-white-mask" operator="in" result="inner-white-final" />
            <feGaussianBlur in="alpha" stdDeviation="6" result="blur-black" />
            <feComposite in="alpha" in2="blur-black" operator="out" result="inner-black-mask" />
            <feFlood floodColor="#000000" floodOpacity="0.25" result="black-fill" />
            <feComposite in="black-fill" in2="inner-black-mask" operator="in" result="inner-black-final" />
            <feMerge>
              <feMergeNode in="outer-shadow" />
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="inner-white-final" />
              <feMergeNode in="inner-black-final" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      
      {/* Motion Element with Filter applied */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} 
        whileInView={{ opacity: 1, scale: 1 }} 
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }} 
        className="relative z-10 w-full flex justify-center py-8"
      >
        <h1 
          className="text-[min(18vw,300px)] font-black tracking-widest leading-none select-none text-white px-4 font-sans-inter text-center uppercase" 
          style={{ filter: 'url(#glass-effect)' }}
        >
          hot stuff
        </h1>
      </motion.div>
    </div>
  );
};

export default function Footer() {
  return (
    <footer className="w-full flex flex-col items-center gap-0 relative z-10 pb-8 mt-12">
      <FooterCard />
      <GlassText />
    </footer>
  );
}
