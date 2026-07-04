import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartFlyEffect() {
  const [animations, setAnimations] = useState([]);

  useEffect(() => {
    const handleFly = (e) => {
      const { image, startX, startY } = e.detail;
      
      // Calculate target coordinates dynamically
      let endX = window.innerWidth - 50;
      let endY = 50;

      // Check for desktop cart button first
      const desktopCart = document.getElementById('header-cart-btn');
      const mobileCart = document.getElementById('mobile-cart-btn');

      if (window.innerWidth >= 768 && desktopCart) {
        const rect = desktopCart.getBoundingClientRect();
        endX = rect.left + rect.width / 2;
        endY = rect.top + rect.height / 2;
      } else if (mobileCart) {
        const rect = mobileCart.getBoundingClientRect();
        endX = rect.left + rect.width / 2;
        endY = rect.top + rect.height / 2;
      }

      const id = Date.now() + Math.random();
      const newAnim = { id, image, startX, startY, endX, endY };

      setAnimations(prev => [...prev, newAnim]);
    };

    window.addEventListener('fly-to-cart', handleFly);
    return () => window.removeEventListener('fly-to-cart', handleFly);
  }, []);

  const handleAnimationComplete = (id) => {
    setAnimations(prev => prev.filter(anim => anim.id !== id));
    // Trigger cart wiggle animation in header
    window.dispatchEvent(new CustomEvent('cart-bounce'));
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999]">
      <AnimatePresence>
        {animations.map(anim => (
          <motion.div
            key={anim.id}
            initial={{
              x: anim.startX - 24,
              y: anim.startY - 24,
              scale: 1,
              opacity: 1
            }}
            animate={{
              x: anim.endX - 12,
              y: [anim.startY - 24, anim.startY - 120, anim.endY - 12],
              scale: 0.15,
              opacity: [1, 1, 0.7, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.85,
              ease: "easeInOut",
              times: [0, 0.4, 0.85] // Control y curve timing
            }}
            onAnimationComplete={() => handleAnimationComplete(anim.id)}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '2px solid #E3A33F', // Gold theme border
              backgroundColor: '#ffffff',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25), inset 0 2px 4px rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {anim.image ? (
              <img 
                src={anim.image} 
                alt="Product" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback in case of image load error
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              // Fallback emoji if no image
              <span className="text-xl">🌸</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
