import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function CheckoutDeliveryAddress({
  address, setAddress,
  city, setCity,
  zip, setZip,
  formErrors,
  handleFinalizeOrder
}) {
  const { t } = useTranslation();

  return (
    <motion.div
      key="address-step"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl mx-auto space-y-8 py-4 text-left"
    >
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-green-50 border border-green-200 text-green-600 flex items-center justify-center mx-auto text-xl font-bold">✓</div>
        <h2 className="text-xl font-black text-black uppercase tracking-wider pt-2">{t('checkout.payment_confirmed', 'Оплата получена!')}</h2>
        <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">{t('checkout.delivery_details_title', 'Пожалуйста, заполните адрес доставки')}</p>
      </div>

      <div className="bg-neutral-50 border border-black/5 p-6 md:p-8 rounded-[28px] space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div className="sm:col-span-2">
            <label className="text-[12px] text-neutral-500 font-bold ml-1 mb-1.5 block">{t('checkout.address')}</label>
            <input
              className={`w-full h-[50px] bg-white border ${formErrors.address ? 'border-red-500' : 'border-neutral-200'} rounded-[20px] px-5 text-[16px] text-black placeholder-neutral-400 outline-none transition-all focus:border-black`}
              placeholder={t('checkout.address_placeholder')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {formErrors.address && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2">{formErrors.address}</p>}
          </div>
          <div>
            <label className="text-[12px] text-neutral-500 font-bold ml-1 mb-1.5 block">{t('checkout.city')}</label>
            <input
              className={`w-full h-[50px] bg-white border ${formErrors.city ? 'border-red-500' : 'border-neutral-200'} rounded-[20px] px-5 text-[16px] text-black placeholder-neutral-400 outline-none transition-all focus:border-black`}
              placeholder={t('checkout.city_placeholder')}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            {formErrors.city && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2">{formErrors.city}</p>}
          </div>
          <div>
            <label className="text-[12px] text-neutral-500 font-bold ml-1 mb-1.5 block">{t('checkout.zip')}</label>
            <input
              className="w-full h-[50px] bg-white border border-neutral-200 rounded-[20px] px-5 text-[16px] text-black placeholder-neutral-400 outline-none transition-all focus:border-black"
              placeholder="060000"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleFinalizeOrder}
          className="w-full h-[58px] bg-black hover:bg-neutral-900 text-white font-bold text-[13px] tracking-widest uppercase rounded-[20px] transition-colors flex items-center justify-center cursor-pointer shadow-md border-none"
        >
          <span>{t('checkout.finalize_order', 'Завершить оформление')}</span>
        </button>
      </div>
    </motion.div>
  );
}
