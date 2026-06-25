import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function CategoryLink({ category, onClick }) {

  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const subcategories = category.subcategories || [];
  const hasSub = subcategories.length > 0;

  return (
    <div className="relative flex flex-col w-full">
      {hasSub ? (
        <>
          <div className="flex justify-between items-center w-full py-1.5">
            <span
              onClick={() => setIsOpen(!isOpen)}
              className="text-white text-[11px] font-bold tracking-widest lowercase cursor-pointer hover:text-primary transition-colors text-left flex-1"
            >
              {t(`menu.${category.name.toLowerCase()}`, category.name)}
            </span>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-primary transition-colors p-1 focus:outline-none focus-visible:text-primary active:scale-90 rounded-[2px]"
            >
              <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden pl-4 flex flex-col gap-2 border-l border-white/10 my-1 pb-2"
              >
                <Link
                  to={`/catalog?cat=${category.slug}`}
                  onClick={onClick}
                  className="text-neutral-300 text-[10px] tracking-wider uppercase hover:text-primary transition-colors text-left focus:outline-none focus-visible:text-primary"
                >
                  {t('header.view_all', 'посмотреть все')}
                </Link>
                {subcategories.map((sub) => (
                  <Link
                    key={sub.slug}
                    to={`/catalog?cat=${sub.slug}`}
                    onClick={onClick}
                    className="text-neutral-400 text-[10px] tracking-wider uppercase hover:text-primary transition-colors text-left focus:outline-none focus-visible:text-primary"
                  >
                    {t(`menu.${sub.name.toLowerCase()}`, sub.name)}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <>
          <Link
            to={`/catalog?cat=${category.slug}`}
            onClick={onClick}
            className="text-white text-[11px] font-bold tracking-widest lowercase block w-full py-1.5 hover:text-primary transition-colors text-left focus:outline-none focus-visible:text-primary"
          >
            {t(`menu.${category.name.toLowerCase()}`, category.name)}
          </Link>
          {category.description && (
            <span className="text-[10px] text-neutral-400 leading-normal block -mt-1 pb-2 font-normal font-sans text-left">
              {category.description}
            </span>
          )}
        </>
      )}
    </div>
  );
}
