import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Premium delayed fade-in after 1 second
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 left-0 w-full md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:w-[92%] md:max-w-4xl bg-neutral-950/95 border-t border-white/10 md:border md:border-white/10 text-white pt-5 pb-[100px] px-6 md:py-4 md:px-6 rounded-t-2xl md:rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 z-[49] shadow-2xl"
        >
          {/* Left Description Text */}
          <p className="text-xs sm:text-[13px] text-white/80 leading-relaxed font-sans font-normal text-center md:text-left flex-1">
            Мы используем cookies. Продолжая использовать сайт, вы соглашаетесь с условиями{" "}
            <Link 
              to="/terms" 
              className="text-white hover:text-primary underline decoration-white/30 hover:decoration-primary underline-offset-4 transition-colors font-bold uppercase tracking-wider text-[11px]"
            >
              Пользовательского соглашения
            </Link>
            .
          </p>

          {/* Right Acceptance Button */}
          <button
            onClick={handleAccept}
            className="w-full md:w-auto bg-white hover:bg-neutral-100 text-black font-sans font-black text-[11px] tracking-widest uppercase px-6 py-2.5 rounded-[8px] transition-colors cursor-pointer flex-none text-center focus:outline-none"
          >
            Окей
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
