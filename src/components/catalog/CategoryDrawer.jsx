import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function CategoryDrawer({
  isOpen,
  onClose,
  activeCat,
  categories,
  loading,
  handleCategoryClick
}) {
  const { t } = useTranslation();
  const [expandedCats, setExpandedCats] = useState({});

  // Auto-expand the active category's parent when drawer opens
  useEffect(() => {
    if (!isOpen || !activeCat || !categories) return;
    for (const cat of categories) {
      const isSub = cat.subcategories?.some(sub => sub.slug === activeCat);
      if (isSub || cat.slug === activeCat) {
        setExpandedCats(prev => ({ ...prev, [cat.slug]: true }));
      }
    }
  }, [isOpen, activeCat, categories]);

  const toggleCat = (slug) => {
    setExpandedCats(prev => ({ ...prev, [slug]: !prev[slug] }));
  };

  const handleSelect = (slug) => {
    handleCategoryClick(slug);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1050]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white text-black z-[1060] shadow-2xl flex flex-col font-sans border-r border-neutral-100"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-950 text-white">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-primary">favorite</span>
                <span className="font-sans font-black text-[12px] tracking-[0.2em] uppercase">
                  {t('catalog.all_toys', 'КАТЕГОРИИ')}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-primary transition-colors flex items-center justify-center p-1 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Scrollable Categories List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              
              {/* Popular item */}
              <div className="border-b border-neutral-100 pb-2">
                <button
                  onClick={() => handleSelect('all')}
                  className={`w-full flex items-center justify-between text-left font-sans font-bold text-[11px] tracking-wider py-2.5 hover:text-primary transition-colors uppercase ${
                    activeCat === 'all' || activeCat === 'popular' ? 'text-primary' : 'text-neutral-800'
                  }`}
                >
                  <span>{t('catalog.popular_upper', 'ПОПУЛЯРНЫЕ')}</span>
                  <span className="text-[10px] text-neutral-400">🔥</span>
                </button>
              </div>

              {/* Dynamic categories from DB */}
              {loading ? (
                <div className="text-[11px] text-neutral-400 font-sans py-4 flex items-center gap-2">
                  <span className="animate-spin text-[14px]">progress_activity</span>
                  {t('catalog.loading_categories', 'Загрузка...')}
                </div>
              ) : (
                categories.map((cat) => {
                  const subcategories = cat.subcategories || [];
                  const hasSub = subcategories.length > 0;
                  const isExpanded = !!expandedCats[cat.slug];
                  const isParentActive = activeCat === cat.slug;

                  return (
                    <div key={cat.slug} className="border-b border-neutral-100 pb-2">
                      {hasSub ? (
                        <div>
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => handleSelect(cat.slug)}
                              className={`flex-1 text-left font-sans font-bold text-[11px] tracking-wider py-2.5 hover:text-primary transition-colors uppercase ${
                                isParentActive ? 'text-primary' : 'text-neutral-800'
                              }`}
                            >
                              {t('menu.' + cat.name.toLowerCase(), cat.name)}
                            </button>
                            <button
                              onClick={() => toggleCat(cat.slug)}
                              className="px-3 py-2.5 text-neutral-400 hover:text-black focus:outline-none bg-transparent"
                            >
                              <span className="material-symbols-outlined text-[16px] transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                                expand_more
                              </span>
                            </button>
                          </div>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="pl-4 space-y-2 mt-1 pb-2 overflow-hidden flex flex-col border-l border-neutral-100 ml-1"
                              >
                                {/* Option to view all in this category */}
                                <button
                                  onClick={() => handleSelect(cat.slug)}
                                  className={`text-left font-sans font-bold text-[10px] tracking-[0.15em] py-1.5 uppercase transition-colors ${
                                    isParentActive ? 'text-primary' : 'text-neutral-500 hover:text-black'
                                  }`}
                                >
                                  {t('catalog.view_all', 'Смотреть все')}
                                </button>

                                {subcategories.map((sub) => {
                                  const isActive = activeCat === sub.slug;
                                  return (
                                    <button
                                      key={sub.slug}
                                      onClick={() => handleSelect(sub.slug)}
                                      className={`text-left font-sans font-bold text-[10px] tracking-[0.15em] py-1.5 uppercase transition-colors ${
                                        isActive ? 'text-primary' : 'text-neutral-500 hover:text-black'
                                      }`}
                                    >
                                      {t('menu.' + sub.name.toLowerCase(), sub.name)}
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSelect(cat.slug)}
                          className={`w-full flex items-center justify-between text-left font-sans font-bold text-[11px] tracking-wider py-2.5 hover:text-primary transition-colors uppercase ${
                            isParentActive ? 'text-primary' : 'text-neutral-800'
                          }`}
                        >
                          <span>{t('menu.' + cat.name.toLowerCase(), cat.name)}</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}

              {/* News item */}
              <div className="border-b border-neutral-100 pb-2">
                <button
                  onClick={() => handleSelect('new')}
                  className={`w-full flex items-center justify-between text-left font-sans font-bold text-[11px] tracking-wider py-2.5 hover:text-primary transition-colors uppercase ${
                    activeCat === 'new' ? 'text-primary' : 'text-neutral-800'
                  }`}
                >
                  <span>{t('catalog.new_upper', 'НОВИНКИ')}</span>
                  <span className="text-[10px] text-neutral-400">✨</span>
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
