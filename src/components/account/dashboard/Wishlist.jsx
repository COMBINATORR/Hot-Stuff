export function Wishlist({ favorites, t, isPrivate, handleAddWishlistItem, handleShareWishlist }) {
  return (
    <div className="p-6 md:p-8 bg-neutral-50 border border-black/5 rounded-[28px] space-y-6 lg:col-span-1 flex flex-col justify-between">
      <div className="space-y-6">
        <h3 className="text-xs font-black tracking-wider text-black uppercase">{t('account.favorites', 'Избранные Товары')}</h3>

        {favorites.length === 0 ? (
          <div className="py-8">
            <p className="text-xs text-neutral-500 font-medium text-center">
              {t('account.favorites_empty', 'Ваш список желаний пуст.')}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {favorites.map(product => (
              <div key={product.id} className="flex gap-4 p-3 bg-white border border-black/5 rounded-lg">
                <div className="w-16 h-16 bg-neutral-50 rounded-[4px] overflow-hidden flex items-center justify-center flex-none relative">
                  {isPrivate ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 text-neutral-400 select-none">
                      <span className="material-symbols-outlined text-[18px]">visibility_off</span>
                      <span className="text-[7px] font-bold uppercase tracking-wider mt-0.5">{t('account.hidden', 'Скрыто')}</span>
                    </div>
                  ) : (
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-black text-black uppercase tracking-wider truncate max-w-[150px]">
                      {isPrivate ? t('account.intimate_device', 'Интимный девайс ••••') : product.name}
                    </h4>
                    <p className="text-[11px] text-neutral-900 font-bold mt-0.5">{product.price.toLocaleString('ru-KZ')} ₸</p>
                  </div>
                  <button
                    onClick={() => handleAddWishlistItem(product)}
                    className="bg-black hover:bg-neutral-800 text-white font-sans font-black text-[8px] tracking-widest uppercase py-1.5 px-3 rounded-[2px] transition-colors self-start mt-2 cursor-pointer"
                  >
                    {t('account.to_cart', 'В КОРЗИНУ')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {favorites.length > 0 && (
        <button
          onClick={handleShareWishlist}
          className="w-full bg-black hover:bg-neutral-800 text-white font-sans font-bold text-[9px] tracking-[0.2em] py-3.5 px-4 rounded-[20px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-4"
        >
          <span className="material-symbols-outlined text-[16px] leading-none">share</span>
          <span>{t('account.hint', 'НАМЕКНУТЬ ПАРТНЕРУ (АНОНИМНО)')}</span>
        </button>
      )}
    </div>
  );
}
