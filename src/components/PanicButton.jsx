import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PanicButton() {
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
      className="fixed bottom-20 md:bottom-6 left-6 z-[9999] bg-black/95 hover:bg-[#FF5C3F] text-white border border-white/10 hover:border-[#FF5C3F] shadow-2xl transition-all duration-300 font-sans font-bold text-[10px] tracking-[0.15em] cursor-pointer flex items-center justify-center sm:justify-start gap-2 h-10 w-10 sm:w-auto sm:px-4 sm:py-2.5 rounded-full focus:outline-none"
      title="Быстрый выход (Клавиша ESC)"
    >
      <span className="material-symbols-outlined text-[16px] flex-none">visibility_off</span>
      <span className="hidden sm:inline uppercase">БЫСТРЫЙ ВЫХОД [ESC]</span>
    </motion.button>
  );
}
