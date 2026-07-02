import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export default function PromoTicker({ t, i18n, tickerIndex, tickerItems, handlePrevTicker, handleNextTicker }) {
  return (
    <div className="w-full bg-black py-2 md:py-3 border-b border-white/5 flex items-center justify-between px-2 md:px-6 text-xs text-white z-50 relative h-12 global-promo-ticker">
      <button onClick={handlePrevTicker} className="hover:text-primary transition-colors focus:outline-none focus-visible:text-primary z-10 flex-none" aria-label={t('header.prev_promo', 'Предыдущая акция')}>
        <span className="material-symbols-outlined text-[16px] align-middle" aria-hidden="true">chevron_left</span>
      </button>

      <div className="flex-1 text-center font-bold tracking-wider overflow-hidden px-1 md:px-4 flex items-center justify-center relative h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={tickerIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex items-center justify-center gap-2 md:gap-4 w-full h-full"
          >
            <span className="text-[9.5px] md:text-xs tracking-[0.05em] md:tracking-[0.15em] font-sans whitespace-normal leading-tight md:leading-normal text-center">
              {tickerItems[tickerIndex]?.text}
            </span>
            <Link
              to={i18n.language === 'ru' ? tickerItems[tickerIndex]?.link : `/${i18n.language === 'kk' ? 'kz' : i18n.language}${tickerItems[tickerIndex]?.link}`}
              className="bg-primary hover:bg-[#ffe088] active:scale-95 transition-all text-on-primary text-[8px] md:text-[9px] font-black tracking-widest uppercase py-1 px-2.5 md:py-1.5 md:px-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary inline-block flex-none"
            >
              {t('header.buy', 'КУПИТЬ')}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <button onClick={handleNextTicker} className="hover:text-primary transition-colors focus:outline-none focus-visible:text-primary z-10 flex-none" aria-label={t('header.next_promo', 'Следующая акция')}>
        <span className="material-symbols-outlined text-[16px] align-middle" aria-hidden="true">chevron_right</span>
      </button>
    </div>
  );
}
