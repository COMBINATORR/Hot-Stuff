import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from './ResponsiveImage';

export default function FavoritesDrawer({ isOpen, onClose, favorites = [], setFavorites, onAddToCart }) {
  const { t } = useTranslation();

  const handleRemove = (productId) => {
    if (setFavorites) {
      setFavorites(prev => prev.filter(p => p.id !== productId));
    }
  };

  const handleMoveToCart = (product) => {
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : { name: 'Default', hex: '#fff' };
    onAddToCart(product, defaultColor, 'One Size');
    handleRemove(product.id);
  };

  // lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />

          {/* Slider Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0F0F0F] border-l border-white/10 z-[201] shadow-2xl flex flex-col font-sans text-stone-100"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white">
                {t('wishlist.title', 'ИЗБРАННОЕ')}
              </h2>
              <button 
                onClick={onClose}
                className="text-stone-400 hover:text-white transition-colors focus:outline-none"
                aria-label="Close wishlist"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <span className="material-symbols-outlined text-4xl text-stone-600">favorite</span>
                  <p className="text-[10px] tracking-widest text-stone-400 uppercase font-bold">
                    {t('wishlist.empty', 'ваше избранное пусто')}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {favorites.map((product) => (
                    <div key={product.id} className="flex gap-4 border-b border-white/5 pb-6">
                      <div className="w-20 h-24 bg-stone-900 flex-none border border-white/5">
                        <ResponsiveImage alt={product.name} className="w-full h-full object-cover" src={product.image} loading="lazy" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-[10px] tracking-widest text-white uppercase font-bold truncate">{product.name}</h3>
                            <button 
                              onClick={() => handleRemove(product.id)}
                              className="text-stone-500 hover:text-stone-300 transition-colors"
                              title={t('wishlist.remove', 'Удалить')}
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </div>
                          <p className="text-primary text-[11px] font-bold mt-1">{product.price.toLocaleString('ru-KZ')} ₸</p>
                        </div>
                        
                        <div className="mt-4">
                          <button
                            onClick={() => handleMoveToCart(product)}
                            className="w-full border border-white/20 hover:border-white hover:bg-white hover:text-black text-white text-[9px] tracking-widest font-bold py-2 px-3 uppercase rounded-none transition-all"
                          >
                            {t('wishlist.move_to_cart', 'добавить в корзину')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
