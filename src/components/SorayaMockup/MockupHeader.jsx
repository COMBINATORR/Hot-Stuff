import React from 'react';
import { useTranslation } from 'react-i18next';

export function MockupHeader({ isFavorited, setIsFavorited, onClose }) {
  const { t } = useTranslation();
  return (
        <header className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-white sticky top-0 z-30">
          <div>
            <h2 className="font-sans font-black text-[18px] tracking-[0.15em] text-black uppercase leading-none">
              SORAYA WAVE™
            </h2>
            <span className="text-[8px] tracking-[0.2em] font-sans font-bold text-gray-400 uppercase mt-1 block">
              {t('mockup.rabbit', 'ВИБРАТОРЫ-КРОЛИКИ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className="text-black hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-none"
              aria-label={t('account.favorites', 'В избранное')}
            >
              <span className={`material-symbols-outlined text-[20px] ${isFavorited ? 'fill-current text-primary' : ''}`}>
                {isFavorited ? 'favorite' : 'favorite_border'}
              </span>
            </button>
            <button
              onClick={onClose}
              className="text-black hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-none"
              aria-label={t('catalog.close', 'Закрыть')}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </header>

  );
}
