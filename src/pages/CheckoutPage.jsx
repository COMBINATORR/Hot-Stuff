import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

export default function CheckoutPage({ cartItems = [], setCartItems }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Step state: 'form' | 'kaspi_pending' | 'delivery_address' | 'success'
  const [step, setStep] = useState('form');

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  const [delivery, setDelivery] = useState('atyrau');
  const [payment, setPayment] = useState('kaspi');
  
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');

  // Payment states
  const [invoiceId, setInvoiceId] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [provider, setProvider] = useState('kaspi-direct');
  const [orderId, setOrderId] = useState('');

  // UI state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [paymentError, setPaymentError] = useState('');

  const deliveryOptions = [
    { 
      id: 'atyrau',   
      label: t('checkout.delivery_atyrau', 'По Атырау'),       
      price: 0,    
      time: t('checkout.delivery_time', { time: i18n.language === 'en' ? '1-2 days' : (i18n.language === 'kk' || i18n.language === 'kz' ? '1-2 күн' : '1–2 дня') }) 
    },
    { 
      id: 'kz',       
      label: t('checkout.delivery_kz', 'По Казахстану'),   
      price: 2500, 
      time: t('checkout.delivery_time', { time: i18n.language === 'en' ? '3-7 days' : (i18n.language === 'kk' || i18n.language === 'kz' ? '3-7 күн' : '3–7 дней') }) 
    },
  ];

  const paymentOptions = [
    { id: 'kaspi',    label: t('checkout.payment_kaspi', 'Kaspi Pay'),        icon: '💳', desc: t('checkout.payment_desc_kaspi', 'Моментальная оплата') },
    { id: 'card',     label: t('checkout.payment_card', 'Банковская карта'), icon: '🏦', desc: t('checkout.payment_desc_card', 'Visa / Mastercard') },
    { id: 'cash',     label: t('checkout.payment_cash', 'Наличными'),        icon: '💵', desc: t('checkout.payment_desc_cash', 'При получении') },
  ];

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryCost = deliveryOptions.find(d => d.id === delivery)?.price || 0;
  const total = subtotal + deliveryCost;

  // Background polling for ApiPay invoice status
  useEffect(() => {
    if (step !== 'kaspi_pending' || !invoiceId || provider === 'kaspi-direct') {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('kaspi-checkout', {
          body: { action: 'status', invoiceId }
        });

        if (!error && data && data.status === 'paid') {
          clearInterval(intervalId);
          setStep('delivery_address');
        }
      } catch (err) {
        console.warn('[Kaspi Polling Error]', err);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [step, invoiceId, provider]);

  // Form input validation
  const validateForm = () => {
    const errors = {};
    if (!firstName.trim()) errors.firstName = t('checkout.error_first_name', 'Имя обязательно');
    
    // Simple phone check
    const digits = phone.replace(/\D/g, '');
    if (!phone.trim()) {
      errors.phone = t('checkout.error_phone', 'Телефон обязателен');
    } else if (digits.length < 10) {
      errors.phone = t('checkout.error_phone_invalid', 'Неверный формат телефона');
    }

    if (payment !== 'kaspi') {
      if (!address.trim()) errors.address = t('checkout.error_address', 'Адрес обязателен');
      if (!city.trim()) errors.city = t('checkout.error_city', 'Город обязателен');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = async () => {
    if (!validateForm()) return;
    setPaymentError('');

    const generatedOrderId = `HS-${Date.now()}`;
    setOrderId(generatedOrderId);

    if (payment === 'kaspi') {
      setIsCheckingOut(true);
      try {
        console.log(`[Kaspi Checkout] Initiating invoice for ${total} ₸ (Order ID: ${generatedOrderId})`);
        
        const { data, error } = await supabase.functions.invoke('kaspi-checkout', {
          body: { 
            action: 'create', 
            amount: total, 
            orderId: generatedOrderId, 
            phone 
          }
        });

        if (error) throw error;
        
        if (data && data.paymentUrl) {
          setInvoiceId(data.invoiceNumber || `mock-${generatedOrderId}`);
          setPaymentUrl(data.paymentUrl);
          setProvider(data.provider || 'kaspi-direct');
          
          // Open payment link in new window immediately if user on mobile
          if (data.provider === 'kaspi-direct' && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
            window.open(data.paymentUrl, '_blank');
          }
          
          setStep('kaspi_pending');
        } else {
          throw new Error(t('header.payment_url_error', 'Не удалось получить ссылку на оплату от сервера'));
        }
      } catch (err) {
        console.error('[Kaspi Invoice Error]', err);
        setPaymentError(err.message || 'Ошибка выставления счета');
      } finally {
        setIsCheckingOut(false);
      }
    } else {
      // Cash / Card checkout goes straight to success
      setStep('success');
      if (setCartItems) {
        setCartItems([]);
      }
    }
  };

  const checkPaymentStatusManual = async () => {
    if (provider === 'kaspi-direct' || invoiceId.startsWith('mock-')) {
      // Free / Mock flow proceeds immediately
      setStep('delivery_address');
      return;
    }

    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke('kaspi-checkout', {
        body: { action: 'status', invoiceId }
      });

      if (error) throw error;

      if (data && data.status === 'paid') {
        setStep('delivery_address');
      } else {
        alert(t('checkout.payment_not_received', 'Оплата еще не поступила. Пожалуйста, оплатите счет в приложении Kaspi.kz и попробуйте снова.'));
      }
    } catch (err) {
      console.error('[Manual Check Error]', err);
      alert(t('checkout.check_error', 'Ошибка при проверке платежа: {{error}}', { error: err.message }));
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleFinalizeOrder = () => {
    if (!address.trim() || !city.trim()) {
      setFormErrors({
        address: !address.trim() ? t('checkout.error_address', 'Адрес обязателен') : '',
        city: !city.trim() ? t('checkout.error_city', 'Город обязателен') : ''
      });
      return;
    }
    
    setStep('success');
    if (setCartItems) {
      setCartItems([]);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-background text-on-surface py-20 md:py-28 px-4 md:px-8">
      {/* White Card Wrapper */}
      <div className="w-full max-w-5xl bg-white text-black border border-black/5 p-6 md:p-10 rounded-[28px] shadow-2xl font-sans relative z-10 overflow-hidden">
        {/* Background radial highlight for light dashboard */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none z-0"></div>

        <div className="relative z-10 space-y-8 text-left">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400"
          >
            <Link to="/catalog" className="hover:text-primary transition-colors">{t('header.catalog', 'Каталог')}</Link>
            <span>/</span>
            <span className="text-neutral-600">{t('checkout.title')}</span>
          </motion.div>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="pb-6 border-b border-black/5"
          >
            <h1 className="text-xl md:text-2xl font-black text-black uppercase tracking-wider">
              {t('checkout.title')}
            </h1>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Main Form View */}
            {step === 'form' && (
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
            )}

            {/* STEP 2: Kaspi Payment Pending Screen */}
            {step === 'kaspi_pending' && (
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
            )}

            {/* STEP 3: Delivery Address (Post-payment) */}
            {step === 'delivery_address' && (
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
            )}

            {/* STEP 4: Checkout Success View */}
            {step === 'success' && (
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
                      {delivery === 'atyrau' ? t('checkout.delivery_atyrau', 'По Атырау') : t('checkout.delivery_kz', 'По Казахстану')}
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
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
