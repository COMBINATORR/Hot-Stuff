import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import CheckoutForm from '../components/checkout/CheckoutForm';
import CheckoutKaspiPending from '../components/checkout/CheckoutKaspiPending';
import CheckoutDeliveryAddress from '../components/checkout/CheckoutDeliveryAddress';
import CheckoutSuccess from '../components/checkout/CheckoutSuccess';
import { supabase } from '../lib/supabase';
import { calculateYandexDelivery } from '../lib/supabaseClient';

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
  
  const [delivery, setDelivery] = useState('pickup');
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

  // Yandex Delivery dynamic cost states
  const [yandexDeliveryCost, setYandexDeliveryCost] = useState(0);
  const [yandexDeliveryTime, setYandexDeliveryTime] = useState(0);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);

  // Confirmed order data to persist totals after cart is cleared
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const deliveryOptions = [
    { 
      id: 'yandex',       
      label: t('checkout.delivery_yandex', 'Яндекс Доставка (Экспресс)'),   
      price: yandexDeliveryCost, 
      time: isCalculatingDelivery 
        ? t('checkout.delivery_calculating', 'Расчет стоимости...') 
        : (yandexDeliveryTime ? t('checkout.delivery_time_mins', { time: `${yandexDeliveryTime} мин` }) : t('checkout.delivery_yandex_calc', 'Рассчитывается по адресу'))
    },
    { 
      id: 'kz',       
      label: t('checkout.delivery_kz', 'По Казахстану'),   
      price: 2500, 
      time: t('checkout.delivery_time', { time: i18n.language === 'en' ? '3-7 days' : (i18n.language === 'kk' || i18n.language === 'kz' ? '3-7 күн' : '3–7 дней') }) 
    },
    { 
      id: 'pickup',   
      label: t('checkout.delivery_pickup', 'Самовывоз'),       
      price: 0,    
      time: t('checkout.delivery_pickup_time', { time: i18n.language === 'en' ? 'Today' : (i18n.language === 'kk' || i18n.language === 'kz' ? 'Бүгін' : 'Сегодня') }) 
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

  // Dynamic Yandex Delivery price calculation with 1s debounce
  useEffect(() => {
    if (delivery !== 'yandex' || !address.trim()) {
      setYandexDeliveryCost(0);
      setYandexDeliveryTime(0);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsCalculatingDelivery(true);
      try {
        const data = await calculateYandexDelivery({
          address,
          city: city || 'Атырау',
          items: cartItems.map(item => ({
            name: item.name,
            quantity: item.qty
          }))
        });

        if (data && data.success) {
          setYandexDeliveryCost(data.price || 0);
          setYandexDeliveryTime(data.eta_minutes || 0);
        } else {
          console.error('Yandex delivery calculation failed:', data);
        }
      } catch (err) {
        console.error('Failed to calculate Yandex delivery:', err);
      } finally {
        setIsCalculatingDelivery(false);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [address, city, delivery, cartItems]);

  // Background polling for ApiPay invoice status
  useEffect(() => {
    if (step !== 'kaspi_pending' || !invoiceId || provider === 'kaspi-direct') {
      return;
    }

    let timerId;
    let isMounted = true;

    const poll = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('kaspi-checkout', {
          body: { action: 'status', invoiceId }
        });

        if (!error && data && data.status === 'paid') {
          if (delivery === 'yandex' || delivery === 'pickup') {
            finalizeAndCleanCart(invoiceId);
          } else {
            setStep('delivery_address');
          }
          isMounted = false; // Stop polling
        }
      } catch (err) {
        console.warn('[Kaspi Polling Error]', err);
      } finally {
        if (isMounted) {
          timerId = setTimeout(poll, 5000);
        }
      }
    };

    timerId = setTimeout(poll, 5000);

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [step, invoiceId, provider]);

  // Helper to finalize order details, switch to success, and clear cart
  const finalizeAndCleanCart = (currentOrderId) => {
    setConfirmedOrder({
      orderId: currentOrderId || orderId || `HS-${Date.now()}`,
      payment,
      delivery,
      address,
      city,
      zip,
      total
    });
    setStep('success');
    if (setCartItems) {
      setCartItems([]);
    }
  };

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

    if ((payment !== 'kaspi' || delivery === 'yandex') && delivery !== 'pickup') {
      if (!address.trim()) errors.address = t('checkout.error_address', 'Адрес обязателен');
      if (!city.trim()) errors.city = t('checkout.error_city', 'Город обязателен');
    }

    // Require successful Yandex Delivery price estimation
    if (delivery === 'yandex' && !errors.address) {
      if (isCalculatingDelivery) {
        errors.address = t('checkout.error_calculating_delivery', 'Идет расчет стоимости доставки...');
      } else if (yandexDeliveryCost === 0) {
        errors.address = t('checkout.error_delivery_calc_failed', 'Не удалось рассчитать доставку. Проверьте адрес.');
      }
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
            window.open(data.paymentUrl, '_blank', 'noopener,noreferrer');
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
      finalizeAndCleanCart(generatedOrderId);
    }
  };

  const checkPaymentStatusManual = async () => {
    if (provider === 'kaspi-direct' || invoiceId.startsWith('mock-')) {
      // Free / Mock flow proceeds immediately
      if (delivery === 'yandex' || delivery === 'pickup') {
        finalizeAndCleanCart(orderId);
      } else {
        setStep('delivery_address');
      }
      return;
    }

    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke('kaspi-checkout', {
        body: { action: 'status', invoiceId }
      });

      if (error) throw error;

      if (data && data.status === 'paid') {
        if (delivery === 'yandex' || delivery === 'pickup') {
          finalizeAndCleanCart(orderId);
        } else {
          setStep('delivery_address');
        }
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
    
    finalizeAndCleanCart(orderId);
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
              <CheckoutForm
                firstName={firstName} setFirstName={setFirstName}
                lastName={lastName} setLastName={setLastName}
                phone={phone} setPhone={setPhone}
                email={email} setEmail={setEmail}
                delivery={delivery} setDelivery={setDelivery}
                payment={payment} setPayment={setPayment}
                address={address} setAddress={setAddress}
                city={city} setCity={setCity}
                zip={zip} setZip={setZip}
                formErrors={formErrors}
                paymentError={paymentError}
                deliveryOptions={deliveryOptions}
                paymentOptions={paymentOptions}
                cartItems={cartItems}
                subtotal={subtotal}
                deliveryCost={deliveryCost}
                total={total}
                isCheckingOut={isCheckingOut}
                handleNextStep={handleNextStep}
              />
            )}

            {/* STEP 2: Kaspi Payment Pending Screen */}
            {step === 'kaspi_pending' && (
              <CheckoutKaspiPending
                provider={provider}
                phone={phone}
                orderId={orderId}
                total={total}
                paymentUrl={paymentUrl}
                checkPaymentStatusManual={checkPaymentStatusManual}
                isCheckingOut={isCheckingOut}
                setStep={setStep}
              />
            )}

            {/* STEP 3: Delivery Address (Post-payment) */}
            {step === 'delivery_address' && (
              <CheckoutDeliveryAddress
                address={address} setAddress={setAddress}
                city={city} setCity={setCity}
                zip={zip} setZip={setZip}
                formErrors={formErrors}
                handleFinalizeOrder={handleFinalizeOrder}
              />
            )}

            {/* STEP 4: Checkout Success View */}
            {step === 'success' && (
              <CheckoutSuccess
                orderId={confirmedOrder?.orderId || orderId}
                payment={confirmedOrder?.payment || payment}
                delivery={confirmedOrder?.delivery || delivery}
                address={confirmedOrder?.address || address}
                city={confirmedOrder?.city || city}
                zip={confirmedOrder?.zip || zip}
                total={confirmedOrder?.total ?? total}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
