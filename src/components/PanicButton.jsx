import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function PanicButton() {
  const { t } = useTranslation();

  const handlePanic = () => {
    // Redirection replacing history to keep visitor's browsing private
    window.location.replace('https://www.google.com');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handlePanic();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.button
      onClick={handlePanic}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="hidden md:flex md:fixed md:bottom-6 md:left-6 z-[9999] bg-black/95 hover:bg-primary text-white hover:text-on-primary border border-white/10 hover:border-primary shadow-2xl transition-all duration-300 font-sans font-bold text-[10px] tracking-[0.15em] cursor-pointer items-center justify-start gap-2 h-10 px-4 py-2.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95"
      title={t('panic.title')}
    >
      <span className="material-symbols-outlined text-[16px] flex-none">visibility_off</span>
      <span className="hidden sm:inline uppercase">{t('panic.btn')}</span>
    </motion.button>
  );
}
