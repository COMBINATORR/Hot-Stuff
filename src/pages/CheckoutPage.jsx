import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const DELIVERY_OPTIONS = [
  { id: 'atyrau',   label: 'По Атырау',       price: 0,    time: '1–2 дня' },
  { id: 'kz',       label: 'По Казахстану',   price: 2500, time: '3–7 дней' },
];

const PAYMENT_OPTIONS = [
  { id: 'kaspi',    label: 'Kaspi Pay',        icon: '💳', desc: 'Моментальная оплата' },
  { id: 'card',     label: 'Банковская карта', icon: '🏦', desc: 'Visa / Mastercard' },
  { id: 'cash',     label: 'Наличными',        icon: '💵', desc: 'При получении' },
];

export default function CheckoutPage({ cartItems = [] }) {
  const [delivery, setDelivery] = useState('atyrau');
  const [payment, setPayment]   = useState('kaspi');

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryCost = DELIVERY_OPTIONS.find(d => d.id === delivery)?.price || 0;
  const total = subtotal + deliveryCost;

  return (
    <div className="page-enter pt-[80px]">
      <div className="container-hs py-16 md:py-24">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="flex items-center gap-2 mb-12"
        >
          <Link to="/catalog" className="label-caps text-outline hover:text-primary transition-colors">Каталог</Link>
          <span className="text-outline">/</span>
          <span className="label-caps text-on-surface-variant">Оформление заказа</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="text-headline-lg mb-16"
        >
          Оформление заказа
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 lg:gap-gutter items-start">
          {/* ═══ LEFT — Form ═══════════════════════ */}
          <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col gap-16">
            {/* ── SECTION 1: Контакты ─────────────── */}
            <motion.div variants={fadeUp}>
              <div className="flex items-center mb-8">
                <div className="w-7 h-7 flex items-center justify-center bg-primary text-on-primary label-caps text-[11px]">1</div>
                <h2 className="label-caps text-on-surface ml-4">КОНТАКТНАЯ ИНФОРМАЦИЯ</h2>
                <div className="section-rule" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="field-label">ИМЯ</label>
                  <input className="field-underline" placeholder="Ваше имя" />
                </div>
                <div>
                  <label className="field-label">ФАМИЛИЯ</label>
                  <input className="field-underline" placeholder="Ваша фамилия" />
                </div>
                <div>
                  <label className="field-label">ТЕЛЕФОН</label>
                  <input className="field-underline" type="tel" placeholder="+7 (___) ___-__-__" />
                </div>
                <div>
                  <label className="field-label">EMAIL</label>
                  <input className="field-underline" type="email" placeholder="email@example.com" />
                </div>
              </div>
            </motion.div>

            {/* ── SECTION 2: Доставка ─────────────── */}
            <motion.div variants={fadeUp}>
              <div className="flex items-center mb-8">
                <div className="w-7 h-7 flex items-center justify-center bg-primary text-on-primary label-caps text-[11px]">2</div>
                <h2 className="label-caps text-on-surface ml-4">ДОСТАВКА</h2>
                <div className="section-rule" />
              </div>

              <div className="flex flex-col gap-3 mb-8">
                {DELIVERY_OPTIONS.map(d => (
                  <button
                    key={d.id}
                    className={`radio-option ${delivery === d.id ? 'selected' : ''}`}
                    onClick={() => setDelivery(d.id)}
                  >
                    {/* radio circle */}
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-none"
                      style={{ borderColor: delivery === d.id ? '#f2ca50' : 'rgba(255,255,255,0.2)' }}
                    >
                      {delivery === d.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="label-caps text-on-surface text-[11px]">{d.label}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{d.time}</p>
                    </div>
                    <span className="text-body-md text-on-surface-variant">
                      {d.price === 0 ? 'Бесплатно' : `${d.price.toLocaleString('ru-KZ')} ₸`}
                    </span>
                  </button>
                ))}
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div className="sm:col-span-2">
                  <label className="field-label">АДРЕС</label>
                  <input className="field-underline" placeholder="ул. Примерная, д. 1, кв. 1" />
                </div>
                <div>
                  <label className="field-label">ГОРОД</label>
                  <input className="field-underline" placeholder="Атырау" />
                </div>
                <div>
                  <label className="field-label">ПОЧТОВЫЙ ИНДЕКС</label>
                  <input className="field-underline" placeholder="060000" />
                </div>
              </div>
            </motion.div>

            {/* ── SECTION 3: Оплата ───────────────── */}
            <motion.div variants={fadeUp}>
              <div className="flex items-center mb-8">
                <div className="w-7 h-7 flex items-center justify-center bg-primary text-on-primary label-caps text-[11px]">3</div>
                <h2 className="label-caps text-on-surface ml-4">ОПЛАТА</h2>
                <div className="section-rule" />
              </div>

              <div className="flex flex-col gap-3">
                {PAYMENT_OPTIONS.map(p => (
                  <button
                    key={p.id}
                    className={`radio-option ${payment === p.id ? 'selected' : ''}`}
                    onClick={() => setPayment(p.id)}
                  >
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-none"
                      style={{ borderColor: payment === p.id ? '#f2ca50' : 'rgba(255,255,255,0.2)' }}
                    >
                      {payment === p.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <span className="text-2xl">{p.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="label-caps text-on-surface text-[11px]">{p.label}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* ── Submit ──────────────────────────── */}
            <motion.div variants={fadeUp}>
              <button className="btn-primary w-full py-5 text-sm">
                ПОДТВЕРДИТЬ ЗАКАЗ — {total.toLocaleString('ru-KZ')} ₸
              </button>
              <p className="text-xs text-outline text-center mt-4 tracking-wider">
                Нажимая кнопку, вы принимаете условия{' '}
                <Link to="/privacy" className="underline hover:text-primary transition-colors">политики конфиденциальности</Link>
              </p>
            </motion.div>
          </motion.div>

          {/* ═══ RIGHT — Order Summary (sticky) ════ */}
          <motion.div
            className="lg:sticky lg:top-[112px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <div className="bg-surface-container-low p-8">
              <h3 className="label-caps text-on-surface-variant mb-8">ВАШ ЗАКАЗ</h3>

              {/* Items */}
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-4xl text-outline mb-3 block">shopping_bag</span>
                  <p className="text-body-md text-on-surface-variant">Корзина пуста</p>
                  <Link to="/catalog" className="btn-outline mt-6 inline-flex">В КАТАЛОГ</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-6 mb-8">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-surface-container flex-none flex items-center justify-center text-2xl">
                        {item.emoji || '🛍️'}
                      </div>
                      <div className="flex-1">
                        <p className="label-caps text-on-surface text-[10px]">{item.name}</p>
                        {item.variant && <p className="text-xs text-outline mt-0.5">{item.variant}</p>}
                        <p className="text-body-md text-on-surface-variant mt-1">
                          {item.qty} × {item.price.toLocaleString('ru-KZ')} ₸
                        </p>
                      </div>
                      <p className="text-body-md text-on-surface">
                        {(item.price * item.qty).toLocaleString('ru-KZ')} ₸
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-white/10 pt-6 flex flex-col gap-3">
                <div className="flex justify-between text-body-md text-on-surface-variant">
                  <span>Товары</span>
                  <span>{subtotal.toLocaleString('ru-KZ')} ₸</span>
                </div>
                <div className="flex justify-between text-body-md text-on-surface-variant">
                  <span>Доставка</span>
                  <span>{deliveryCost === 0 ? 'Бесплатно' : `${deliveryCost.toLocaleString('ru-KZ')} ₸`}</span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="flex justify-between items-end">
                  <span className="label-caps text-on-surface-variant">ИТОГО</span>
                  <span className="text-xl text-primary font-medium tracking-wide">
                    {total.toLocaleString('ru-KZ')} ₸
                  </span>
                </div>
              </div>
            </div>

            {/* Privacy & Discretion Assurances */}
            <div className="mt-6 border border-white/10 bg-[#0F0E11] p-6 text-left font-sans">
              <div className="flex items-center gap-4 mb-4">
                {/* SVG of discreet box */}
                <div className="w-12 h-12 flex-none flex items-center justify-center bg-white/5 border border-white/10">
                  <svg className="w-8 h-8 text-[#f2ca50]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    {/* Isometric box representation */}
                    <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 7v10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 12v10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 7v10" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Tape accent */}
                    <path d="M12 7l5-2.5M12 12l5-2.5" stroke="#f2ca50" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h4 className="label-caps text-[10px] text-white tracking-[0.2em] font-bold">100% КОНФИДЕНЦИАЛЬНОСТЬ</h4>
                  <p className="text-[9px] text-[#f2ca50] label-caps tracking-[0.1em] mt-0.5">ГАРАНТИЯ АНОНИМНОСТИ</p>
                </div>
              </div>

              <div className="space-y-4 text-[11px] leading-relaxed text-on-surface-variant border-t border-white/5 pt-4">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[16px] text-[#f2ca50] mt-0.5 flex-none">inventory_2</span>
                  <div>
                    <span className="text-white font-bold block mb-0.5">НЕЙТРАЛЬНАЯ УПАКОВКА</span>
                    Все заказы отправляются в плотных непрозрачных сейф-пакетах или стандартных картонных коробках без каких-либо логотипов, надписей бренда или указания интимного характера содержимого.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[16px] text-[#f2ca50] mt-0.5 flex-none">account_balance_wallet</span>
                  <div>
                    <span className="text-white font-bold block mb-0.5">НЕЙТРАЛЬНЫЙ БИЛЛИНГ</span>
                    В выписке по вашей карте или Kaspi при списании отобразится нейтральное наименование продавца (например, <span className="text-white">«Retail Atyrau»</span> или <span className="text-white">«HS-Atyrau»</span>), без упоминания интимных товаров или бренда.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[16px] text-[#f2ca50] mt-0.5 flex-none">shield</span>
                  <div>
                    <span className="text-white font-bold block mb-0.5">ЗАЩИТА SSL И ДАННЫХ</span>
                    Ваши персональные данные защищены 256-битным SSL-шифрованием и используются исключительно для конфиденциальной доставки заказа курьером.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
