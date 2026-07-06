import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';

/* ── tiny confetti helper (canvas-based, no extra deps) ─────────── */
function Confetti({ active }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return; // Fix for jsdom/testing environments
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#D4AF37', '#f5c842', '#ffffff', '#e8d5a0', '#c9a227', '#ffd966'];
    particlesRef.current = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 100,
      r: 4 + Math.random() * 6,
      d: 1.5 + Math.random() * 2.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngle: 0,
      tiltAngleInc: 0.07 + Math.random() * 0.05,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach(p => {
        p.tiltAngle += p.tiltAngleInc;
        p.y += p.d;
        p.tilt = Math.sin(p.tiltAngle) * 15;
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
        ctx.stroke();
      });
      particlesRef.current = particlesRef.current.filter(p => p.y < canvas.height + 20);
      if (particlesRef.current.length > 0) rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}

/* ── helper metadata functions with i18n support ─────────────────── */
const getDeliveryMeta = (delivery, t) => {
  if (delivery === 'yandex') {
    return { label: t('checkout.delivery_yandex', 'Яндекс Доставка (Экспресс)'), icon: '🚀', eta: '1–3 часа', color: '#F5A623' };
  }
  if (delivery === 'pickup') {
    return { label: t('checkout.delivery_pickup', 'Самовывоз'), icon: '🏪', eta: 'Сегодня', color: '#34C759' };
  }
  return { label: t('checkout.delivery_kz', 'По Казахстану'), icon: '📦', eta: '3–7 рабочих дней', color: '#7B61FF' };
};

const PAYMENT_ICONS = {
  kaspi: '💳',
  card:  '🏦',
  cash:  '💵',
};

const getPaymentLabel = (payment, t) => {
  if (payment === 'kaspi') return 'Kaspi Pay';
  if (payment === 'card') return t('checkout.payment_card', 'Банковская карта');
  return t('checkout.payment_cash', 'Наличными');
};

const getStatusSteps = (delivery, t) => [
  { id: 'placed',    label: t('checkout.status_placed', 'Заказ принят'),        icon: '✅', done: true  },
  { id: 'confirmed', label: t('checkout.status_confirmed', 'Подтверждение'),     icon: '📋', done: true  },
  { id: 'packed',    label: t('checkout.status_packed', 'Упаковка'),             icon: '📦', done: false },
  { id: 'delivery',  label: delivery === 'pickup'
                              ? t('checkout.status_ready_pickup', 'Готов к выдаче')
                              : t('checkout.status_in_transit', 'В пути'),
                                                    icon: delivery === 'pickup' ? '🏪' : '🚚', done: false },
];

/* ── main component ───────────────────────────────────────────────── */
export default function CheckoutSuccess({
  orderId,
  payment,
  delivery,
  address,
  city,
  zip,
  total,
  firstName,
  lastName,
  phone,
  items = [],
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [showItems, setShowItems] = useState(false);

  const handleCopy = () => {
    const id = orderId || `HS-${Date.now()}`;
    navigator.clipboard?.writeText(id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deliveryMeta = getDeliveryMeta(delivery, t);
  const statusSteps  = getStatusSteps(delivery, t);
  const fullName     = [firstName, lastName].filter(Boolean).join(' ') || null;
  const displayOrderId = orderId || `HS-${Date.now()}`;

  /* estimated date string */
  const now = new Date();
  let etaStr = '';
  if (delivery === 'yandex') {
    const plus3 = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    etaStr = `до ${plus3.getHours()}:${String(plus3.getMinutes()).padStart(2,'0')}`;
  } else if (delivery === 'kz') {
    const plus7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    etaStr = `до ${plus7.toLocaleDateString('ru-KZ', { day: 'numeric', month: 'long' })}`;
  } else {
    etaStr = 'сегодня';
  }

  return (
    <>
      <Confetti active={true} />

      <motion.div
        key="success-step"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg mx-auto space-y-5 py-6"
      >
        {/* ── Hero ── */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #f5c842 100%)' }}
          >
            🎉
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-2xl font-black text-black uppercase tracking-wider">
              {t('checkout.order_success_title', 'Заказ оформлен!')}
            </h2>
            {fullName ? (
              <p className="text-sm text-neutral-500 font-medium mt-1">
                {fullName}, {t('checkout.order_success_thanks', 'спасибо за покупку!')} 🙏
              </p>
            ) : (
              <p className="text-sm text-neutral-500 font-medium mt-1">
                {t('checkout.order_success_desc', 'Спасибо за покупку! Ваш заказ успешно принят в обработку.')}
              </p>
            )}
          </motion.div>
        </div>

        {/* ── Order ID card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="bg-black text-white rounded-[22px] px-5 py-4 flex items-center justify-between gap-3"
        >
          <div>
            <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest mb-0.5">
              {t('checkout.order_id_label', 'Номер заказа')}
            </p>
            <p className="text-base font-black tracking-wide">{displayOrderId}</p>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-[12px] transition-all cursor-pointer"
            style={{ background: copied ? '#34C759' : 'rgba(255,255,255,0.12)', color: copied ? '#fff' : 'rgba(255,255,255,0.8)' }}
          >
            {copied ? '✓ Скопировано' : '📋 Копировать'}
          </button>
        </motion.div>

        {/* ── Delivery status tracker ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="bg-neutral-50 border border-black/5 rounded-[22px] px-5 pt-5 pb-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{deliveryMeta.icon}</span>
            <div>
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">{t('checkout.delivery_method_label', 'Доставка')}</p>
              <p className="font-black text-black text-sm">{deliveryMeta.label}</p>
            </div>
            <span
              className="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: deliveryMeta.color + '18', color: deliveryMeta.color }}
            >
              {deliveryMeta.eta}
            </span>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-0">
            {statusSteps.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center flex-shrink-0">
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.45 + idx * 0.1 }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: step.done ? '#D4AF37' : '#e5e5e5',
                      color: step.done ? '#fff' : '#999',
                    }}
                  >
                    {step.done ? '✓' : idx + 1}
                  </motion.div>
                  <p className="text-[9px] font-bold text-center mt-1 leading-tight"
                     style={{ color: step.done ? '#D4AF37' : '#aaa' }}>
                    {step.label}
                  </p>
                </div>
                {idx < statusSteps.length - 1 && (
                  <div className="flex-1 h-[2px] mx-1 mb-4 rounded-full"
                       style={{ background: step.done ? '#D4AF37' : '#e5e5e5' }} />
                )}
              </div>
            ))}
          </div>

          {address && (
            <div className="mt-4 pt-3 border-t border-black/5">
              <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-1">
                {t('checkout.shipping_address_label', '📍 Адрес доставки')}
              </p>
              {delivery === 'pickup' ? (
                <p className="text-sm font-bold text-neutral-700">
                  {[address, city, zip].filter(Boolean).join(', ')}
                </p>
              ) : (
                <p className="text-sm font-bold text-neutral-700">
                  {[address, city, zip].filter(Boolean).join(', ')}
                </p>
              )}
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Ориентировочное время — <span className="font-bold text-black">{etaStr}</span>
              </p>
            </div>
          )}
        </motion.div>

        {/* ── Receipt (payment + items) ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44 }}
          className="bg-neutral-50 border border-black/5 rounded-[22px] overflow-hidden"
        >
          {/* Payment row */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-black/5">
            <span className="text-2xl">{PAYMENT_ICONS[payment] || '💳'}</span>
            <div>
              <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">{t('checkout.payment_method_label', 'Оплата')}</p>
              <p className="font-black text-black text-sm">{getPaymentLabel(payment, t)}</p>
            </div>
            <span className="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-600">
              ✓ Оплачено
            </span>
          </div>

          {/* Items toggle */}
          {items.length > 0 && (
            <div className="border-b border-black/5">
              <button
                onClick={() => setShowItems(v => !v)}
                className="w-full flex items-center justify-between px-5 py-3 text-left cursor-pointer"
              >
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Товары ({items.length})
                </span>
                <span className="text-[11px] font-bold text-neutral-500">
                  {showItems ? '▲ скрыть' : '▼ показать'}
                </span>
              </button>

              <AnimatePresence>
                {showItems && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-3 space-y-2">
                      {items.map((item, idx) => (
                        <div key={`${item.id}-${item.variant}-${idx}`}
                             className="flex items-center gap-3">
                          {item.image ? (
                            <img src={item.image} alt={item.name}
                                 className="w-10 h-10 rounded-[10px] object-cover flex-shrink-0 bg-neutral-100" />
                          ) : (
                            <div className="w-10 h-10 rounded-[10px] bg-neutral-200 flex items-center justify-center text-lg flex-shrink-0">
                              🛍
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-black truncate">{item.name}</p>
                            {item.variant && item.variant !== 'default' && (
                              <p className="text-[10px] text-neutral-400">{item.variant}</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-[12px] font-black text-black">
                              {(item.price * item.qty).toLocaleString('ru-KZ')} ₸
                            </p>
                            <p className="text-[10px] text-neutral-400">{item.qty} шт.</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center px-5 py-4">
            <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">{t('checkout.total_paid_label', 'Итого оплачено')}</span>
            <span className="text-xl font-black" style={{ color: '#D4AF37' }}>
              {(total ?? 0).toLocaleString('ru-KZ')} ₸
            </span>
          </div>
        </motion.div>

        {/* ── Contact / support block ── */}
        {phone && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.50 }}
            className="bg-neutral-50 border border-black/5 rounded-[22px] px-5 py-4 flex items-center gap-3"
          >
            <span className="text-xl">📞</span>
            <div>
              <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Контакт для уведомлений</p>
              <p className="font-bold text-black text-sm">{phone}</p>
            </div>
            <p className="ml-auto text-[10px] text-neutral-400 text-right leading-snug">
              Статус заказа<br />придёт на этот номер
            </p>
          </motion.div>
        )}

        {/* ── Support hint ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.56 }}
          className="text-center text-[11px] text-neutral-400 leading-relaxed"
        >
          Есть вопросы? Напишите нам в{' '}
          <a href="https://t.me/hotstuffplay" className="text-black font-bold underline underline-offset-2" target="_blank" rel="noopener noreferrer">
            Telegram
          </a>{' '}
          или по номеру{' '}
          <a href="tel:+77000000000" className="text-black font-bold">+7 700 000 00 00</a>
        </motion.p>

        {/* ── Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.60 }}
          className="flex flex-col gap-3 pt-1"
        >
          <Link
            to="/catalog"
            className="w-full h-[56px] bg-black hover:bg-neutral-900 text-white font-bold text-[13px] tracking-widest uppercase rounded-[18px] transition-colors flex items-center justify-center cursor-pointer shadow-md no-underline"
          >
            {t('checkout.back_to_shop', 'Вернуться в каталог')}
          </Link>
          <Link
            to="/"
            className="w-full h-[48px] bg-neutral-100 hover:bg-neutral-200 text-black font-bold text-[12px] tracking-wider uppercase rounded-[18px] transition-colors flex items-center justify-center cursor-pointer no-underline"
          >
            На главную
          </Link>
        </motion.div>
      </motion.div>
    </>
  );
}
