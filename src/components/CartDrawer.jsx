import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CartItem from './cart/CartItem';
import FreeShippingIndicator from './cart/FreeShippingIndicator';
import CartFooter from './cart/CartFooter';
import { useCartLogic } from '../hooks/useCartLogic';

export default function CartDrawer({ isOpen, onClose, items = [], setItems, onUpdateQty, onRemove }) {
  const {
    t,
    promo,
    setPromo,
    appliedPromo,
    isCheckingOut,
    checkoutError,
    handleUpdateQty,
    handleRemove,
    subtotal,
    progressPercent,
    discountAmount,
    finalTotal,
    handleCheckoutNavigate,
    handleApplyPromo,
    handleKaspiCheckout,
    FREE_SHIPPING_THRESHOLD
  } = useCartLogic({ items, setItems, onClose, onUpdateQty, onRemove });

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
                {t('header.cart_title', 'ваша корзина')}
              </h2>
              <button 
                onClick={onClose}
                className="text-stone-400 hover:text-white transition-colors focus:outline-none"
                aria-label={t('header.close_cart', 'Закрыть корзину')}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Free Shipping Indicator */}
            {items.length > 0 && (
              <FreeShippingIndicator
                subtotal={subtotal}
                freeShippingThreshold={FREE_SHIPPING_THRESHOLD}
                progressPercent={progressPercent}
              />
            )}

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <span className="material-symbols-outlined text-4xl text-stone-600">shopping_bag</span>
                  <p className="text-[10px] tracking-widest text-stone-400 uppercase font-bold">
                    {t('header.cart_empty', 'корзина пуста')}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item, idx) => (
                    <CartItem
                      key={`${item.id}-${item.variant}-${idx}`}
                      item={item}
                      handleUpdateQty={handleUpdateQty}
                      handleRemove={handleRemove}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <CartFooter
                promo={promo}
                setPromo={setPromo}
                appliedPromo={appliedPromo}
                handleApplyPromo={handleApplyPromo}
                discountAmount={discountAmount}
                finalTotal={finalTotal}
                isCheckingOut={isCheckingOut}
                handleKaspiCheckout={handleKaspiCheckout}
                handleCheckoutNavigate={handleCheckoutNavigate}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
