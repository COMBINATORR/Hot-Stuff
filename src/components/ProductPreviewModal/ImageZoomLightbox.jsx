import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageZoomLightbox({
  isOpen,
  onClose,
  imageSrc,
  gallery = [],
  currentIndex = 0,
  onChangeIndex
}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Mobile drag state
  const touchStartRef = useRef({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Swipe logic for gallery navigation (when not zoomed)
  const swipeStartRef = useRef(null);

  // Sync zoom status when changing image or closing
  useEffect(() => {
    setIsZoomed(false);
    setZoomPos({ x: 0, y: 0 });
    setPanOffset({ x: 0, y: 0 });
  }, [currentIndex, isOpen]);

  // Handle Keyboard Navigation (Esc to close, Left/Right arrows)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && gallery.length > 1 && !isZoomed) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && gallery.length > 1 && !isZoomed) {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, isZoomed, gallery]);

  const handleNext = () => {
    if (onChangeIndex && gallery.length > 1) {
      onChangeIndex((currentIndex + 1) % gallery.length);
    }
  };

  const handlePrev = () => {
    if (onChangeIndex && gallery.length > 1) {
      onChangeIndex((currentIndex - 1 + gallery.length) % gallery.length);
    }
  };

  // Toggle Zoom Click
  const handleImageClick = (e) => {
    if (isZoomed) {
      setIsZoomed(false);
      setZoomPos({ x: 0, y: 0 });
      setPanOffset({ x: 0, y: 0 });
    } else {
      // Zoom in at click position
      setIsZoomed(true);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX) || (rect.left + rect.width / 2);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY) || (rect.top + rect.height / 2);

        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;
        
        setZoomPos({
          x: (0.5 - x) * 100,
          y: (0.5 - y) * 100
        });
      }
    }
  };

  // Desktop Mouse Move Panning
  const handleMouseMove = (e) => {
    if (!isZoomed || window.innerWidth < 768) return;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Pan the image proportional to cursor position
      setZoomPos({
        x: (0.5 - x) * 120, // multiplier controls the panning range
        y: (0.5 - y) * 120
      });
    }
  };

  // Mobile Touch Panning and Gallery Swipe
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      if (isZoomed) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      } else {
        swipeStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length !== 1) return;

    if (isZoomed) {
      // Touch Drag Panning
      const deltaX = e.touches[0].clientX - touchStartRef.current.x;
      const deltaY = e.touches[0].clientY - touchStartRef.current.y;

      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };

      setPanOffset((prev) => {
        // Clamp offsets to prevent dragging image fully off screen
        const maxOffset = window.innerWidth * 0.6;
        return {
          x: Math.max(-maxOffset, Math.min(maxOffset, prev.x + deltaX)),
          y: Math.max(-maxOffset, Math.min(maxOffset, prev.y + deltaY))
        };
      });
    }
  };

  const handleTouchEnd = (e) => {
    if (!isZoomed && swipeStartRef.current) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = swipeStartRef.current.x - touchEndX;
      const diffY = swipeStartRef.current.y - touchEndY;

      // Swipe threshold is 50px
      if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      } else if (diffY > 100) {
        // Swipe down to close
        onClose();
      }
      swipeStartRef.current = null;
    }
  };

  const activeImage = gallery.length > 0 ? gallery[currentIndex] : imageSrc;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 w-full h-full bg-black/95 z-[99999] flex items-center justify-center select-none overflow-hidden touch-none"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-none cursor-pointer z-50 backdrop-blur-md active:scale-95 transition-all focus:outline-none"
            aria-label="Close fullscreen"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>

          {/* Prev button */}
          {gallery.length > 1 && !isZoomed && (
            <button
              onClick={handlePrev}
              className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-none cursor-pointer z-50 backdrop-blur-md active:scale-95 transition-all focus:outline-none hidden md:flex"
              aria-label="Previous image"
            >
              <span className="material-symbols-outlined text-[28px]">chevron_left</span>
            </button>
          )}

          {/* Next button */}
          {gallery.length > 1 && !isZoomed && (
            <button
              onClick={handleNext}
              className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-none cursor-pointer z-50 backdrop-blur-md active:scale-95 transition-all focus:outline-none hidden md:flex"
              aria-label="Next image"
            >
              <span className="material-symbols-outlined text-[28px]">chevron_right</span>
            </button>
          )}

          {/* Main Image Container */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleImageClick}
            className="w-full h-full flex items-center justify-center p-4 cursor-pointer relative"
          >
            <motion.div
              style={{
                x: isZoomed ? (window.innerWidth >= 768 ? `${zoomPos.x}%` : panOffset.x) : 0,
                y: isZoomed ? (window.innerWidth >= 768 ? `${zoomPos.y}%` : panOffset.y) : 0,
                scale: isZoomed ? 2.2 : 1,
                cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transformOrigin: 'center center',
              }}
              transition={isZoomed ? { type: 'tween', duration: 0.1 } : { type: 'spring', stiffness: 300, damping: 30 }}
            >
              <img
                src={activeImage}
                alt="Enlarged product view"
                className="max-w-full max-h-full object-contain pointer-events-none"
                draggable="false"
              />
            </motion.div>
          </div>

          {/* Dots Indicator for Mobile */}
          {gallery.length > 1 && !isZoomed && (
            <div className="absolute bottom-6 flex gap-2 z-40">
              {gallery.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => onChangeIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all border-none ${
                    currentIndex === idx ? 'bg-white scale-125' : 'bg-white/35'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Instructions Overlay (briefly shown) */}
          <div className="absolute bottom-16 bg-black/60 text-white/80 text-[10px] tracking-widest uppercase py-2 px-4 rounded-full pointer-events-none backdrop-blur-sm z-30 font-bold hidden md:block">
            {isZoomed ? 'Перемещайте курсор для осмотра • Нажмите для отдаления' : 'Нажмите на фото для приближения'}
          </div>
          <div className="absolute bottom-16 bg-black/60 text-white/80 text-[10px] tracking-widest uppercase py-2 px-4 rounded-full pointer-events-none backdrop-blur-sm z-30 font-bold md:hidden">
            {isZoomed ? 'Тапните для отдаления • Двигайте пальцем' : 'Нажмите для приближения • Смахните для перелистывания'}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
