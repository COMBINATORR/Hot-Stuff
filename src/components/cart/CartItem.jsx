import React from 'react';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage';

export default function CartItem({ item, handleUpdateQty, handleRemove }) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-4 border-b border-white/5 pb-6">
      <div className="w-20 h-24 bg-stone-900 flex-none border border-white/5">
        {item.image ? (
          <ResponsiveImage alt={item.name} className="w-full h-full object-cover" src={item.image} loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl bg-stone-850">🌸</div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="text-[10px] tracking-widest text-white uppercase font-bold truncate">{item.name}</h3>
          {item.variant && <p className="text-[9px] tracking-wider text-stone-400 uppercase mt-0.5">{item.variant}</p>}
          <p className="text-primary text-[11px] font-bold mt-1">{item.price.toLocaleString('ru-KZ')} ₸</p>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Quantity Selector */}
          <div className="flex items-center border border-white/15">
            <button
              className="px-2 py-0.5 text-stone-400 hover:text-white transition-colors"
              onClick={() => handleUpdateQty(item.id, item.variant, item.qty - 1)}
            >-</button>
            <span className="px-3 text-[11px] font-bold">{item.qty}</span>
            <button
              className="px-2 py-0.5 text-stone-400 hover:text-white transition-colors"
              onClick={() => handleUpdateQty(item.id, item.variant, item.qty + 1)}
            >+</button>
          </div>

          {/* Delete Button */}
          <button
            onClick={() => handleRemove(item.id, item.variant)}
            className="text-stone-500 hover:text-red-400 transition-colors"
            aria-label={t('header.remove_item', 'Удалить товар')}
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
