import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartFlyEffect() {
  const [animations, setAnimations] = useState([]);

  useEffect(() => {
    // Track click coordinates globally inside the container to bypass custom event mutation limits
    let lastClickCoords = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const handleGlobalClick = (e) => {
      if (e.clientX !== 0 || e.clientY !== 0) {
        lastClickCoords = { x: e.clientX, y: e.clientY };
      }
    };

    window.addEventListener('click', handleGlobalClick, true);

    const handleFly = (e) => {
      const { image } = e.detail;
      const startX = e.detail.startX || lastClickCoords.x;
      const startY = e.detail.startY || lastClickCoords.y;
      
      // Calculate target coordinates dynamically based on viewport size
      let endX = window.innerWidth - 50;
      let endY = 50;

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
    
    return () => {
      window.removeEventListener('click', handleGlobalClick, true);
      window.removeEventListener('fly-to-cart', handleFly);
    };
  }, []);

  const handleAnimationComplete = (id) => {
    setAnimations(prev => {
      const exists = prev.some(anim => anim.id === id);
      if (!exists) return prev;
      
      // Dispatch the bounce event asynchronously to avoid React state update collision
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('cart-bounce'));
      }, 0);
      
      return prev.filter(anim => anim.id !== id);
    });
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
              times: [0, 0.4, 0.85]
            }}
            onAnimationComplete={() => handleAnimationComplete(anim.id)}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '2px solid #E3A33F',
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
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <span className="text-xl">🌸</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
