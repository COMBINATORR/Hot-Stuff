import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function CheckoutForm({
  firstName, setFirstName,
  lastName, setLastName,
  phone, setPhone,
  email, setEmail,
  delivery, setDelivery,
  payment, setPayment,
  address, setAddress,
  city, setCity,
  zip, setZip,
  formErrors,
  paymentError,
  deliveryOptions,
  paymentOptions,
  cartItems,
  subtotal,
  deliveryCost,
  total,
  isCheckingOut,
  handleNextStep
}) {
  const { t } = useTranslation();

  return (
    <motion.div
      key="form-step"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
    >
      {/* Left Column (Forms) */}
      <div className="lg:col-span-7 space-y-10">
        {/* SECTION 1: Контакты */}
        <div className="space-y-6">
          <div className="flex items-center mb-2">
            <div className="w-7 h-7 flex items-center justify-center bg-black text-white rounded-full font-bold text-xs flex-none">1</div>
            <h2 className="text-xs font-black tracking-wider text-black uppercase ml-3">{t('checkout.contact_info')}</h2>
            <div className="flex-1 h-px bg-black/5 ml-4" />
          </div>

          {paymentError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-[20px] text-xs font-bold uppercase tracking-wider">
              ⚠️ {paymentError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="text-[12px] text-neutral-500 font-bold ml-1 mb-1.5 block">{t('checkout.first_name')}</label>
              <input
                className={`w-full h-[50px] bg-white border ${formErrors.firstName ? 'border-red-500' : 'border-neutral-200'} rounded-[20px] px-5 text-[16px] text-black placeholder-neutral-400 outline-none transition-all focus:border-black`}
                placeholder={t('checkout.first_name_placeholder')}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              {formErrors.firstName && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2">{formErrors.firstName}</p>}
            </div>
            <div>
              <label className="text-[12px] text-neutral-500 font-bold ml-1 mb-1.5 block">{t('checkout.last_name')}</label>
              <input
                className="w-full h-[50px] bg-white border border-neutral-200 rounded-[20px] px-5 text-[16px] text-black placeholder-neutral-400 outline-none transition-all focus:border-black"
                placeholder={t('checkout.last_name_placeholder')}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[12px] text-neutral-500 font-bold ml-1 mb-1.5 block">{t('checkout.phone')}</label>
              <input
                className={`w-full h-[50px] bg-white border ${formErrors.phone ? 'border-red-500' : 'border-neutral-200'} rounded-[20px] px-5 text-[16px] text-black placeholder-neutral-400 outline-none transition-all focus:border-black`}
                type="tel"
                placeholder="+7 (777) 777-77-77"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {formErrors.phone && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2">{formErrors.phone}</p>}
            </div>
            <div>
              <label className="text-[12px] text-neutral-500 font-bold ml-1 mb-1.5 block">Email</label>
              <input
                className="w-full h-[50px] bg-white border border-neutral-200 rounded-[20px] px-5 text-[16px] text-black placeholder-neutral-400 outline-none transition-all focus:border-black"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Доставка */}
        <div className="space-y-6">
          <div className="flex items-center mb-2">
            <div className="w-7 h-7 flex items-center justify-center bg-black text-white rounded-full font-bold text-xs flex-none">2</div>
            <h2 className="text-xs font-black tracking-wider text-black uppercase ml-3">{t('checkout.delivery_method')}</h2>
            <div className="flex-1 h-px bg-black/5 ml-4" />
          </div>

          <div className="flex flex-col gap-3">
            {deliveryOptions.map(d => (
              <button
                key={d.id}
                type="button"
                className={`w-full flex items-center gap-4 p-4 border rounded-[20px] transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99] ${
                  delivery === d.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-black/5 bg-neutral-50 hover:border-black/10'
                }`}
                onClick={() => setDelivery(d.id)}
              >
                <div className="w-5 h-5 rounded-full border flex items-center justify-center flex-none"
                  style={{ borderColor: delivery === d.id ? '#f2ca50' : '#d1d1d6' }}
                >
                  {delivery === d.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs font-black text-black uppercase tracking-wider">{d.label}</p>
                  <p className="text-[11px] text-neutral-500 font-medium mt-0.5">{d.time}</p>
                </div>
                <span className="text-xs font-bold text-black">
                  {d.price === 0 ? t('checkout.free', 'Бесплатно') : `${d.price.toLocaleString('ru-KZ')} ₸`}
                </span>
              </button>
            ))}
          </div>

          {/* Address details directly shown ONLY if payment is NOT Kaspi Pay */}
          {payment !== 'kaspi' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-2">
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
          )}
        </div>

        {/* SECTION 3: Оплата */}
        <div className="space-y-6">
          <div className="flex items-center mb-2">
            <div className="w-7 h-7 flex items-center justify-center bg-black text-white rounded-full font-bold text-xs flex-none">3</div>
            <h2 className="text-xs font-black tracking-wider text-black uppercase ml-3">{t('checkout.payment_method')}</h2>
            <div className="flex-1 h-px bg-black/5 ml-4" />
          </div>

          <div className="flex flex-col gap-3">
            {paymentOptions.map(p => (
              <button
                key={p.id}
                type="button"
                className={`w-full flex items-center gap-4 p-4 border rounded-[20px] transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99] ${
                  payment === p.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-black/5 bg-neutral-50 hover:border-black/10'
                }`}
                onClick={() => setPayment(p.id)}
              >
                <div className="w-5 h-5 rounded-full border flex items-center justify-center flex-none"
                  style={{ borderColor: payment === p.id ? '#f2ca50' : '#d1d1d6' }}
                >
                  {payment === p.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <span className="text-2xl select-none">{p.icon}</span>
                <div className="flex-1 text-left">
                  <p className="text-xs font-black text-black uppercase tracking-wider">{p.label}</p>
                  <p className="text-[11px] text-neutral-500 font-medium mt-0.5">{p.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column (Summary Panel) */}
      <div className="lg:col-span-5 lg:sticky lg:top-[112px] space-y-6">
        {/* Order Bento Card */}
        <div className="bg-neutral-50 border border-black/5 p-6 md:p-8 rounded-[28px] space-y-6">
          <h3 className="text-xs font-black tracking-wider text-black uppercase">{t('checkout.your_order')}</h3>

          {/* Items */}
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-neutral-300 mb-3 block">shopping_bag</span>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">{t('checkout.empty_cart')}</p>
              <Link to="/catalog" className="w-full h-[46px] bg-black hover:bg-neutral-900 text-white font-bold text-xs uppercase tracking-widest rounded-[20px] transition-colors flex items-center justify-center mt-6 cursor-pointer">
                {t('checkout.back_to_catalog')}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-h-[320px] overflow-y-auto pr-1">
              {cartItems.map(item => (
                <div key={item.id + (item.variant || '')} className="flex gap-4 p-3 bg-white border border-black/5 rounded-[16px] shadow-sm">
                  <div className="w-14 h-14 bg-neutral-50 rounded-[12px] flex-none flex items-center justify-center text-2xl border border-black/5">
                    {item.emoji || '🛍️'}
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0 text-left">
                    <div>
                      <h4 className="text-[11px] font-black text-black uppercase tracking-wider truncate">
                        {item.name}
                      </h4>
                      {item.variant && <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">{item.variant}</p>}
                    </div>
                    <div className="flex justify-between items-baseline mt-1">
                      <span className="text-[10px] text-neutral-400 font-bold">
                        {t('checkout.item_summary', { qty: item.qty, price: item.price.toLocaleString('ru-KZ') })}
                      </span>
                      <span className="text-[11px] font-black text-black">
                        {(item.price * item.qty).toLocaleString('ru-KZ')} ₸
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div className="border-t border-black/5 pt-6 space-y-3 font-sans text-xs">
            <div className="flex justify-between text-neutral-500 font-medium">
              <span>{t('checkout.items')}</span>
              <span className="font-bold text-black">{subtotal.toLocaleString('ru-KZ')} ₸</span>
            </div>
            <div className="flex justify-between text-neutral-500 font-medium">
              <span>{t('checkout.delivery')}</span>
              <span className="font-bold text-black">{deliveryCost === 0 ? t('checkout.free', 'Бесплатно') : `${deliveryCost.toLocaleString('ru-KZ')} ₸`}</span>
            </div>
            <div className="h-px bg-black/5 my-2" />
            <div className="flex justify-between items-baseline">
              <span className="text-[11px] font-black text-black uppercase tracking-wider">{t('checkout.total')}</span>
              <span className="text-xl font-black text-primary tracking-wide">
                {total.toLocaleString('ru-KZ')} ₸
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button & Disclaimer */}
        <div className="space-y-4">
          <button
            onClick={handleNextStep}
            disabled={isCheckingOut || cartItems.length === 0}
            className="w-full h-[58px] btn-fluid-paint text-white font-bold text-[14px] tracking-widest uppercase rounded-[20px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border-none"
          >
            {isCheckingOut ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3">
                  <circle cx="12" cy="12" r="9" />
                </svg>
                <span>{t('header.processing')}</span>
              </>
            ) : (
              <span>
                {payment === 'kaspi'
                  ? t('checkout.pay_kaspi_btn', 'Выставить счет Kaspi')
                  : t('checkout.confirm', { total: total.toLocaleString('ru-KZ') })
                }
              </span>
            )}
          </button>
          <p className="text-[10px] text-neutral-400 text-center tracking-wider font-medium">
            {t('checkout.terms')}{' '}
            <Link to="/privacy" className="underline hover:text-black transition-colors">{t('checkout.policy_link')}</Link>
          </p>
        </div>

        {/* Privacy & Discretion Assurances */}
        <div className="bg-neutral-100 border border-black/5 p-6 rounded-[28px] text-left font-sans space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-black/5">
            <div className="w-10 h-10 flex-none flex items-center justify-center bg-white border border-black/5 rounded-full shadow-sm text-primary">
              <span className="material-symbols-outlined text-[20px]">visibility_off</span>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-black uppercase tracking-widest">{t('checkout.sec_title')}</h4>
              <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">{t('checkout.sec_sub')}</p>
            </div>
          </div>

          <div className="space-y-4 text-[11px] leading-relaxed text-neutral-600 font-medium">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[16px] text-primary mt-0.5 flex-none">inventory_2</span>
              <div>
                <span className="text-black font-black block mb-0.5 uppercase tracking-wider text-[9px]">{t('checkout.packaging')}</span>
                {t('checkout.packaging_desc')}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[16px] text-primary mt-0.5 flex-none">account_balance_wallet</span>
              <div>
                <span className="text-black font-black block mb-0.5 uppercase tracking-wider text-[9px]">{t('checkout.billing')}</span>
                {t('checkout.billing_desc')}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[16px] text-primary mt-0.5 flex-none">shield</span>
              <div>
                <span className="text-black font-black block mb-0.5 uppercase tracking-wider text-[9px]">{t('checkout.ssl')}</span>
                {t('checkout.ssl_desc')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
