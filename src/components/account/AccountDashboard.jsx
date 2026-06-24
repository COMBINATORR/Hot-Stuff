import { startTransition } from 'react';
import { Link } from 'react-router-dom';
import { ALL_PRODUCTS } from '../../data/products';
import { supabase } from '../../lib/supabase';

export default function AccountDashboard({
  t,
  getDisplayAvatar,
  getDisplayName,
  getDisplayEmailOrPhone,
  isPrivate,
  handleTogglePrivate,
  loading,
  setLoading,
  handleLogout,
  loyaltyData,
  activeOrders,
  orderHistory,
  lang,
  favorites,
  handleAddWishlistItem,
  handleShareWishlist,
  MOCK_REGISTERED_USERS,
  setSavedAccounts,
  setRegisteredUsers,
}) {
  return (
        <div className="w-full max-w-5xl bg-white text-black border border-black/5 p-6 md:p-10 rounded-[28px] shadow-2xl font-sans relative z-10 overflow-hidden">
          {/* Background radial highlight for light dashboard */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none z-0"></div>

          <div className="relative z-10 space-y-10 text-left">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-black/5">
              <div className="flex items-center gap-4">
                {getDisplayAvatar() ? (
                  <img
                    src={getDisplayAvatar()}
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full object-cover border border-black/10 shadow-sm"
                  />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-primary font-light">account_circle</span>
                )}
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-black uppercase tracking-wider">
                    {getDisplayName()}
                  </h1>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mt-1">
                    {getDisplayEmailOrPhone()}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 self-start md:self-auto">
                {/* Incognito Toggle Button */}
                <button
                  type="button"
                  onClick={handleTogglePrivate}
                  className={`flex items-center gap-2 border px-4 py-2.5 rounded-[20px] transition-all cursor-pointer font-sans text-[10px] font-bold uppercase tracking-wider ${
                    isPrivate
                      ? 'bg-black border-black text-white'
                      : 'bg-white border-black/10 text-neutral-500 hover:text-black hover:border-black'
                  }`}
                  title={isPrivate ? t('account.private_title_off', 'Выключить режим приватности') : t('account.private_title_on', 'Включить режим приватности')}
                >
                  <span className="material-symbols-outlined text-[16px] leading-none">
                    {isPrivate ? 'visibility_off' : 'visibility'}
                  </span>
                  <span>{isPrivate ? t('account.private', 'Приватно') : t('account.public', 'Публично')}</span>
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 border border-black/10 hover:border-red-500 hover:text-red-500 text-black font-sans font-black text-[9px] tracking-[0.2em] px-6 py-3.5 uppercase transition-colors rounded-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 active:scale-95 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px] leading-none">logout</span>
                  <span>{t('account.logout_btn', 'ВЫЙТИ ИЗ АККАУНТА')}</span>
                </button>
              </div>
            </div>

            {/* Main Dashboard Grid - Bento Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* 1. Loyalty Tier (Bento: 2 cols) */}
              <div className="p-6 md:p-8 bg-neutral-50 border border-black/5 rounded-[28px] space-y-4 lg:col-span-2 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black tracking-wider text-black uppercase">{t('account.privileges', 'Клуб Привилегий')}</h3>
                    <span className="bg-primary/15 text-[#b28b10] text-[8px] font-black tracking-widest px-2.5 py-1 rounded-[2px] uppercase">
                      {loyaltyData.tier}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-black leading-none">{loyaltyData.discount}%</span>
                    <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wide">{t('account.personal_discount', 'Ваша персональная скидка')}</span>
                  </div>
                </div>

                {loyaltyData.discount === 0 ? (
                  <div className="mt-4 p-4 bg-white/60 rounded-xl border border-black/5">
                    <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                      {t('account.loyalty_intro', 'Совершите вашу первую покупку, чтобы стать участником клуба привилегий и начать копить персональную скидку!')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                      <span>{t('account.to_next_level', 'До следующего уровня осталось:')}</span>
                      <span className="text-black">{loyaltyData.toNextLevel.toLocaleString('ru-KZ')} ₸</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.max(10, Math.min(100, (50000 - loyaltyData.toNextLevel) / 500))}%` }} />
                    </div>
                  </div>
                )}

                {loyaltyData.discount === 0 && (
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                      <span>{t('account.to_first_discount', 'До первой скидки осталось:')}</span>
                      <span className="text-black">{loyaltyData.toNextLevel.toLocaleString('ru-KZ')} ₸</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '0%' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Anonymous Active Delivery (Bento: 1 col) */}
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

              {/* 3. Order History (Bento: 2 cols) */}
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

              {/* 4. Wishlist (Избранное) (Bento: 1 col) */}
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


              {/* 5. Session Security & Devices (Bento: 3 cols) */}
              <div className="p-6 md:p-8 bg-neutral-50 border border-black/5 rounded-[28px] space-y-6 lg:col-span-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xs font-black tracking-wider text-black uppercase mb-1 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-black">security</span>
                      <span>{t('account.security', 'Безопасность и управление сессиями')}</span>
                    </h3>
                    <p className="text-[11px] text-neutral-500 font-sans">
                      {t('account.security_desc', 'Вы можете завершить сессии на других устройствах или стереть историю входов на этом компьютере.')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={async () => {
                        startTransition(() => {
                          setLoading(true);
                        });
                        try {
                          const { error } = await supabase.auth.signOut({ scope: 'others' });
                          if (error) throw error;
                          alert(t('account.err_others_success', 'Все сессии на других устройствах успешно завершены!'));
                        } catch (err) {
                          console.error(err);
                          alert(t('common.error', 'Ошибка') + ': ' + err.message);
                        } finally {
                          startTransition(() => {
                            setLoading(false);
                          });
                        }
                      }}
                      className="bg-black hover:bg-neutral-800 text-white font-sans font-black text-[9px] tracking-wider uppercase py-2.5 px-4 rounded-[20px] transition-colors cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3">
                            <circle cx="12" cy="12" r="9" />
                          </svg>
                          {t('account.loading', 'Загрузка...')}
                        </span>
                      ) : (
                        t('account.logout_others', 'Выйти на других устройствах')
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(t('account.clear_history_confirm', 'Вы уверены, что хотите очистить историю входов на этом устройстве? При следующем входе вам потребуется подтверждение по коду.'))) {
                          localStorage.removeItem('hs_registered_users');
                          setSavedAccounts([]);
                          setRegisteredUsers(MOCK_REGISTERED_USERS);
                          alert(t('account.err_history_cleared', 'История входов на этом устройстве очищена!'));
                        }
                      }}
                      className="border border-black/10 hover:border-black text-black font-sans font-black text-[9px] tracking-wider uppercase py-2.5 px-4 rounded-[20px] transition-colors cursor-pointer active:scale-95"
                    >
                      {t('account.clear_history', 'Стереть историю входов здесь')}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
  );
}
