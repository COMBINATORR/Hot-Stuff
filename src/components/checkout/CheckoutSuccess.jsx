import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function CheckoutSuccess({
  orderId,
  payment,
  delivery,
  address,
  city,
  zip,
  total
}) {
  const { t } = useTranslation();

  return (
    <motion.div
      key="success-step"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto text-center space-y-8 py-8"
    >
      <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto text-3xl shadow-sm">
        ✨
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-black text-black uppercase tracking-wider">
          {t('checkout.order_success_title', 'Заказ оформлен!')}
        </h2>
        <p className="text-sm text-neutral-500 leading-relaxed font-medium">
          {t('checkout.order_success_desc', 'Спасибо за покупку! Ваш заказ успешно принят в обработку.')}
        </p>
      </div>

      {/* Receipt Details Box */}
      <div className="bg-neutral-50 border border-black/5 p-6 rounded-[28px] space-y-4 text-left font-sans text-xs">
        <div className="flex justify-between items-baseline py-1">
          <span className="text-neutral-400 font-bold uppercase tracking-wider">{t('checkout.order_id_label', 'Номер заказа')}</span>
          <span className="font-black text-black uppercase">{orderId || `HS-${Date.now()}`}</span>
        </div>
        <div className="flex justify-between items-baseline py-1">
          <span className="text-neutral-400 font-bold uppercase tracking-wider">{t('checkout.payment_method_label', 'Оплата')}</span>
          <span className="font-black text-black">
            {payment === 'kaspi'
              ? 'Kaspi Pay'
              : (payment === 'card' ? t('checkout.payment_card', 'Банковская карта') : t('checkout.payment_cash', 'Наличными'))
            }
          </span>
        </div>
        <div className="flex justify-between items-baseline py-1">
          <span className="text-neutral-400 font-bold uppercase tracking-wider">{t('checkout.delivery_method_label', 'Доставка')}</span>
          <span className="font-black text-black">
            {delivery === 'yandex' 
              ? t('checkout.delivery_yandex', 'Яндекс Доставка (Экспресс)') 
              : (delivery === 'pickup' 
                ? t('checkout.delivery_pickup', 'Самовывоз') 
                : t('checkout.delivery_kz', 'По Казахстану'))
            }
          </span>
        </div>

        {address && (
          <div className="border-t border-black/5 pt-4 mt-2">
            <span className="text-neutral-400 font-bold uppercase tracking-wider block mb-1">{t('checkout.shipping_address_label', 'Адрес доставки')}</span>
            <span className="font-bold text-neutral-700 block leading-relaxed">{address}, {city}{zip ? `, ${zip}` : ''}</span>
          </div>
        )}

        <div className="border-t border-black/5 pt-4 mt-2 flex justify-between items-baseline">
          <span className="text-neutral-400 font-bold uppercase tracking-wider">{t('checkout.total_paid_label', 'Итого оплачено')}</span>
          <span className="text-lg font-black text-primary">{total.toLocaleString('ru-KZ')} ₸</span>
        </div>
      </div>

      <div className="pt-2">
        <Link
          to="/catalog"
          className="w-full h-[58px] bg-black hover:bg-neutral-900 text-white font-bold text-[13px] tracking-widest uppercase rounded-[20px] transition-colors flex items-center justify-center cursor-pointer shadow-md no-underline"
        >
          {t('checkout.back_to_shop', 'Вернуться в каталог')}
        </Link>
      </div>
    </motion.div>
  );
}
