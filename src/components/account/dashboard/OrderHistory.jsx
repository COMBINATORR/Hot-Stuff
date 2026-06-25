import { Link } from 'react-router-dom';
import { ALL_PRODUCTS } from '../../../data/products';

export function OrderHistory({ orderHistory, t, lang, isPrivate, handleAddWishlistItem }) {
  return (
    <div className="p-6 md:p-8 bg-neutral-50 border border-black/5 rounded-[28px] space-y-4 lg:col-span-2">
      <h3 className="text-xs font-black tracking-wider text-black uppercase mb-2">{t('account.history', 'История Покупок')}</h3>

      {orderHistory.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-center gap-4">
          <p className="text-xs text-neutral-500 font-medium">
            {t('account.no_orders_yet', 'Вы еще ничего не заказывали.')}
          </p>
          <Link
            to={lang && lang !== 'ru' ? `/${lang}/catalog` : '/catalog'}
            className="border border-black hover:bg-black hover:text-white text-black font-sans font-black text-[9px] tracking-[0.2em] px-6 py-3.5 uppercase transition-all rounded-none cursor-pointer"
          >
            {t('account.go_to_catalog', 'Перейти в каталог')}
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-black/5 text-xs font-sans">
          {orderHistory.map(order => (
            <div key={order.id} className="py-4 flex justify-between items-center gap-4">
              <div>
                <p className="font-bold text-black uppercase">{t('account.order_completed', { num: order.number, date: order.date })}</p>
                <p className="text-[10px] text-neutral-500 mt-1">
                  {isPrivate ? t('account.delicate_accessory', 'Деликатный аксессуар •••• x1') : `${order.itemsSummary}`} — {order.status}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-neutral-900">{order.totalPrice.toLocaleString('ru-KZ')} ₸</p>
                {order.canRepeat && (
                  <button
                    onClick={() => {
                      const prod = ALL_PRODUCTS.find(p => p.id === order.productId);
                      if (prod) handleAddWishlistItem(prod);
                    }}
                    className="text-[9px] font-black tracking-wider text-black hover:text-primary uppercase mt-1.5 transition-colors block cursor-pointer bg-transparent border-none p-0 focus-visible:outline-none focus-visible:underline"
                  >
                    {t('account.repeat', 'Повторить в 1 клик')}
                  </button>
                )}
                {!order.canRepeat && (
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-1.5 block">{t('account.archive', 'Архив')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
