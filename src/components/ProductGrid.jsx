import React from 'react';
import { useTranslation } from 'react-i18next';
import { ALL_PRODUCTS } from '../data/products';
import ResponsiveImage from './ResponsiveImage';

export default function ProductGrid({ onSelectQuickView, onAddToCart }) {
  const { t } = useTranslation();

  const handleQuickAdd = (product, e) => {
    e.stopPropagation();
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : { name: 'Default', hex: '#fff' };
    onAddToCart(product, defaultColor, 'One Size');
  };

  return (
    <section className="bg-black py-16 px-6">
      <div className="container-hs max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-sans font-black text-[18px] md:text-[32px] tracking-[0.2em] text-white uppercase mb-4">
            {t('catalog.title', 'наш каталог')}
          </h2>
          <div className="w-12 h-[2px] bg-primary mx-auto"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 w-full">
          {ALL_PRODUCTS.slice(0, 8).map((product) => (
            <div key={product.id} className="group relative flex flex-col justify-between h-full bg-[#0F0F0F] border border-white/5 transition-all duration-300 hover:border-white/15">
              <div className="relative overflow-hidden aspect-[3/4] bg-stone-900">
                <ResponsiveImage
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Desktop hover action overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 gap-2">
                  <button
                    onClick={() => onSelectQuickView(product)}
                    className="w-full bg-white hover:bg-neutral-200 text-black text-[9px] font-bold tracking-widest py-2 px-3 uppercase rounded-none transition-colors"
                  >
                    {t('product.quick_view', 'быстрый просмотр')}
                  </button>
                  <button
                    onClick={(e) => handleQuickAdd(product, e)}
                    className="w-full bg-primary hover:bg-[#FFE088] text-[#3c2f00] text-[9px] font-black tracking-widest py-2 px-3 uppercase rounded-none transition-colors"
                  >
                    {t('product.add_to_cart', 'купить')}
                  </button>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-sans font-bold text-[10px] md:text-[11px] tracking-wider text-stone-200 uppercase truncate">
                    {product.name}
                  </h3>
                  <p className="text-[9px] text-primary tracking-widest uppercase font-bold mt-1">
                    {product.categoryLabel || product.category}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] md:text-[12px] font-bold text-white">
                    {product.price.toLocaleString('ru-KZ')} ₸
                  </span>
                  
                  {/* Mobile friendly buttons (visible only on mobile) */}
                  <div className="flex gap-2 md:hidden">
                    <button
                      onClick={() => onSelectQuickView(product)}
                      className="p-1.5 bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-white border border-white/10"
                      title={t('product.quick_view', 'Быстрый просмотр')}
                    >
                      <span className="material-symbols-outlined text-[16px] flex items-center">visibility</span>
                    </button>
                    <button
                      onClick={(e) => handleQuickAdd(product, e)}
                      className="p-1.5 bg-primary text-[#3c2f00] hover:bg-[#FFE088]"
                      title={t('product.add_to_cart', 'Добавить в корзину')}
                    >
                      <span className="material-symbols-outlined text-[16px] flex items-center">shopping_cart</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
