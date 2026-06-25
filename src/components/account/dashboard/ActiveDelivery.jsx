export function ActiveDelivery({ activeOrders, t }) {
  return (
    <div className="p-6 md:p-8 bg-neutral-50 border border-black/5 rounded-[28px] space-y-5 lg:col-span-1 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 text-green-600 mb-4">
          <span className="material-symbols-outlined text-[20px] font-light">local_shipping</span>
          <h3 className="text-xs font-black tracking-wider text-black uppercase">{t('account.current_delivery', 'Текущая Доставка')}</h3>
        </div>
        {activeOrders.length === 0 ? (
          <div className="py-4">
            <p className="text-xs text-neutral-500 font-medium">
              {t('account.no_active_orders', 'У вас пока нет активных заказов.')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map(order => (
              <div key={order.id} className="border-l-2 border-primary pl-4 py-1 space-y-2">
                <p className="text-xs font-black text-black">
                  {t('account.delivery_order_num', { num: order.number })} — {order.status}
                </p>
                <p className="text-[10px] text-neutral-500">{order.details}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Anti-Anxiety Privacy Banner */}
      <div className="bg-neutral-100 border border-black/5 p-4 rounded-[16px] flex items-start gap-3 mt-4">
        <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">visibility_off</span>
        <div>
          <h4 className="text-[9px] font-black text-black uppercase tracking-wider">{t('account.anon_title', 'Гарантия 100% анонимности доставки:')}</h4>
          <p className="text-[9px] text-neutral-600 leading-relaxed mt-1 font-normal">
            {t('account.anon_desc', 'Заказ упакован в плотный непрозрачный сейф-пакет без каких-либо логотипов. В накладной содержимое указано как «Аксессуары (косметика)».')}
          </p>
        </div>
      </div>
    </div>
  );
}
