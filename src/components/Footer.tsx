import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LogoIcon = () => (
  <div className="w-8 h-8 bg-[#31A8FF] rounded-[8px] flex items-center justify-center">
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
      <div className="bg-black rounded-[40px] m-2 shadow-inner p-8 md:p-10 lg:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        
        {/* Column 1: Brand Info */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col text-left">
              <span className="text-2xl md:text-3xl font-black tracking-[0.2em] text-white">HOT STUFF</span>
              <span className="text-[10px] tracking-[0.3em] text-neutral-500 font-bold uppercase mt-1">АТЫРАУ</span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-md text-left">
              Мы гарантируем 100% анонимность доставки. Все заказы отправляются в плотных непрозрачных сейф-пакетах без каких-либо логотипов или названия магазина. Курьер не знает о содержимом посылки.
            </p>
          </div>
          
          {/* Social icons (Inline SVGs) */}
          <div className="flex gap-3 pt-4">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-[44px] h-[44px] flex items-center justify-center rounded-xl border border-zinc-800 bg-transparent text-neutral-400 hover:text-white hover:border-neutral-500 transition-all active:scale-95 group"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a 
              href="https://t.me" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-[44px] h-[44px] flex items-center justify-center rounded-xl border border-zinc-800 bg-transparent text-neutral-400 hover:text-white hover:border-neutral-500 transition-all active:scale-95 group"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </a>
            <a 
              href="https://wa.me" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-[44px] h-[44px] flex items-center justify-center rounded-xl border border-zinc-800 bg-transparent text-neutral-400 hover:text-white hover:border-neutral-500 transition-all active:scale-95 group"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </a>
          </div>
        </div>

        {/* Column 2: ПОКУПАТЕЛЯМ */}
        <div className="space-y-4 text-left">
          <h4 className="text-[14px] font-bold text-[#94A3B8] tracking-wider uppercase">ПОКУПАТЕЛЯМ</h4>
          <ul className="space-y-4">
            <li>
              <Link to="/catalog" className="text-[15px] font-medium text-neutral-300 hover:text-[#31A8FF] transition-colors block">
                ТАБЛИЦА РАЗМЕРОВ
              </Link>
            </li>
            <li>
              <Link to="/catalog" className="text-[15px] font-medium text-neutral-300 hover:text-[#31A8FF] transition-colors block">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/catalog" className="text-[15px] font-medium text-neutral-300 hover:text-[#31A8FF] transition-colors block">
                ПРАВИЛА ВОЗВРАТА НИЖНЕГО БЕЛЬЯ
              </Link>
            </li>
            <li>
              <Link to="/catalog" className="text-[15px] font-medium text-neutral-300 hover:text-[#31A8FF] transition-colors block">
                СЛУЖБА ПОДДЕРЖКИ
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: ОПЛАТА И ЛОГИСТИКА */}
        <div className="space-y-4 text-left">
          <h4 className="text-[14px] font-bold text-[#94A3B8] tracking-wider uppercase">ОПЛАТА И ЛОГИСТИКА</h4>
          <p className="text-neutral-400 text-xs leading-relaxed">
            Бережная и оперативная доставка осуществляется по всей территории Казахстана. Выберите любой удобный способ оплаты при оформлении заказа.
          </p>
          {/* Payment Badges Grid */}
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="bg-yellow-400 text-black text-[9px] font-extrabold px-2.5 py-1 rounded-[4px] tracking-wider uppercase flex-none">
              KASPI PAY
            </span>
            <span className="border border-zinc-800 text-neutral-400 text-[9px] font-bold px-2 py-1 rounded-[4px] tracking-widest uppercase">
              VISA
            </span>
            <span className="border border-zinc-800 text-neutral-400 text-[9px] font-bold px-2 py-1 rounded-[4px] tracking-widest uppercase">
              MC
            </span>
            <span className="border border-zinc-800 text-neutral-400 text-[9px] font-bold px-2 py-1 rounded-[4px] tracking-widest uppercase">
              HALYK
            </span>
            <span className="border border-zinc-800 text-neutral-400 text-[9px] font-bold px-2 py-1 rounded-[4px] tracking-widest uppercase">
              CASH
            </span>
          </div>
        </div>

        {/* Column 4: ПРАВОВАЯ ИНФОРМАЦИЯ */}
        <div className="space-y-4 text-left">
          <h4 className="text-[14px] font-bold text-[#94A3B8] tracking-wider uppercase">ПРАВОВАЯ ИНФОРМАЦИЯ</h4>
          <ul className="space-y-4">
            <li>
              <Link to="/catalog" className="text-[15px] font-medium text-neutral-300 hover:text-[#31A8FF] transition-colors block">
                ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ
              </Link>
            </li>
            <li>
              <Link to="/catalog" className="text-[15px] font-medium text-neutral-300 hover:text-[#31A8FF] transition-colors block">
                ПУБЛИЧНАЯ ОФЕРТА
              </Link>
            </li>
          </ul>
          
          {/* 18+ Badge block */}
          <div className="flex gap-3 items-start mt-6 border-t border-zinc-900 pt-4">
            <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-yellow-400 text-black text-xs font-black rounded-[4px]">
              18+
            </div>
            <p className="text-neutral-400 text-[10px] sm:text-[11px] leading-snug">
              Сайт содержит материалы для взрослых. Продажа товаров осуществляется строго лицам старше 18 лет.
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Legal Bar */}
      <div className="px-8 py-5 flex flex-col md:flex-row justify-between items-center border-t border-zinc-900 text-sm text-[#64748B] bg-black/40 gap-4">
        {/* Left Side: Panic Button + Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handlePanic}
            className="flex items-center gap-2 bg-black hover:bg-zinc-900 text-white border border-zinc-800 hover:border-zinc-700 px-4 py-2 rounded-full text-[10px] sm:text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-neutral-400"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            <span>БЫСТРЫЙ ВЫХОД [ESC]</span>
          </button>
          <span className="text-[12px] sm:text-[13px] text-[#64748B] text-center">
            © 2026 Hot Stuff. Все права защищены.
          </span>
        </div>
        
        {/* Right Side */}
        <div className="text-[11px] sm:text-[12px] font-bold tracking-[0.2em] text-[#64748B] uppercase">
          100% АНОНИМНОСТЬ ГАРАНТИРОВАНА
        </div>
      </div>
    </div>
  );
};

const GlassText = () => {
  return (
    <div className="relative w-full flex items-center justify-center select-none pt-0 overflow-hidden bg-black">
      {/* SVG Glass Effect Filter */}
      <svg className="absolute w-0 h-0" width="0" height="0">
        <defs>
          <filter id="glass-effect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feColorMatrix 
              type="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" 
              result="contrast" 
            />
            <feSpecularLighting 
              in="blur" 
              specularExponent="30" 
              specularConstant="1.2" 
              surfaceScale="4" 
              lightingColor="#ffffff" 
              result="specular"
            >
              <feDistantLight azimuth="225" elevation="45" />
            </feSpecularLighting>
            <feComposite in="specular" in2="SourceGraphic" operator="in" result="highlight" />
            <feMerge>
              <feMergeNode in="contrast" />
              <feMergeNode in="highlight" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex justify-center py-6"
      >
        <h1 
          className="text-[min(14vw,240px)] font-black tracking-widest leading-none select-none text-zinc-900 text-center font-sans-inter lowercase" 
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
    <footer className="w-full bg-black flex flex-col gap-0 pt-10">
      <FooterCard />
      <GlassText />
    </footer>
  );
}
