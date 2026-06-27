import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function CheckoutKaspiPending({
  provider,
  phone,
  orderId,
  total,
  paymentUrl,
  checkPaymentStatusManual,
  isCheckingOut,
  setStep
}) {
  const { t } = useTranslation();

  return (
    <motion.div
      key="kaspi-step"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto text-center space-y-8 py-8 px-4"
    >
      {/* Kaspi Badge */}
      <div className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#f14635] text-white rounded-[24px] font-black text-sm uppercase tracking-wider shadow-lg shadow-red-500/10">
        <span className="text-lg">💳</span> Kaspi Pay
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-black text-black uppercase tracking-wider">
          {provider === 'apipay'
            ? t('checkout.invoice_sent', 'Счёт выставлен!')
            : t('checkout.ready_to_pay', 'Счёт готов к оплате')
          }
        </h2>
        <p className="text-sm text-neutral-500 leading-relaxed font-medium">
          {provider === 'apipay' ? (
            <>
              {t('checkout.invoice_sent_desc', 'Мы отправили счёт на номер')} <strong className="text-black">{phone}</strong>. {t('checkout.invoice_sent_hint', 'Пожалуйста, зайдите в приложение Kaspi.kz для оплаты.')}
            </>
          ) : (
            t('checkout.invoice_direct_desc', 'Для оплаты перейдите в приложение Kaspi.kz по кнопке ниже и подтвердите платёж.')
          )}
        </p>
      </div>

      {/* Main Action Box */}
      <div className="bg-neutral-50 border border-black/5 p-6 rounded-[28px] space-y-6">
        <div className="flex justify-between items-center text-left">
          <div>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{t('checkout.order_number', 'Номер заказа')}</p>
            <p className="text-sm font-black text-black">{orderId}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{t('checkout.amount_due', 'Сумма к оплате')}</p>
            <p className="text-xl font-black text-[#f14635]">{total.toLocaleString('ru-KZ')} ₸</p>
          </div>
        </div>

        <div className="h-px bg-black/5" />

        {/* Polling Spinner (only for ApiPay) */}
        {provider === 'apipay' && (
          <div className="flex items-center justify-center gap-3 py-2 text-xs text-neutral-500 font-bold uppercase tracking-widest">
            <svg className="animate-spin h-4 w-4 text-[#f14635]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3">
              <circle cx="12" cy="12" r="9" />
            </svg>
            <span>{t('checkout.awaiting_kaspi_payment', 'Ожидаем оплату в приложении...')}</span>
          </div>
        )}

        {/* Kaspi Deep Link Action */}
        <a
          href={paymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-[58px] bg-[#f14635] hover:bg-[#d83525] text-white font-bold text-[13px] tracking-widest uppercase rounded-[20px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-500/10 no-underline"
        >
          <span>📱 {t('checkout.open_kaspi_app', 'Открыть приложение Kaspi')}</span>
        </a>

        {/* Manual verification button */}
        <button
          onClick={checkPaymentStatusManual}
          disabled={isCheckingOut}
          className="w-full h-[50px] bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-bold text-[12px] tracking-wider uppercase rounded-[20px] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isCheckingOut ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3">
                <circle cx="12" cy="12" r="9" />
              </svg>
              <span>{t('header.processing')}</span>
            </>
          ) : (
            <span>✓ {t('checkout.paid_continue', 'Я оплатил(а), продолжить')}</span>
          )}
        </button>
      </div>

      {/* Back button */}
      <button
        onClick={() => setStep('form')}
        className="text-xs text-neutral-400 font-bold uppercase tracking-wider hover:text-black transition-colors bg-transparent border-none cursor-pointer"
      >
        ← {t('checkout.change_order_details', 'Изменить детали заказа')}
      </button>
    </motion.div>
  );
}
