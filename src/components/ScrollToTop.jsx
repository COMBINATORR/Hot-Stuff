import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-[88px] right-4 md:bottom-6 md:right-6 z-50 w-11 h-11 md:w-12 md:h-12 bg-neutral-950/80 backdrop-blur-md border border-white/10 hover:border-primary/50 text-primary hover:text-white flex items-center justify-center transition-colors duration-300 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 shadow-xl cursor-pointer"
          aria-label="Scroll to top"
        >
          <span className="material-symbols-outlined text-[22px] md:text-[24px]">arrow_upward</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
