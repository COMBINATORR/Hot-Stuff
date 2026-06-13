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
            <Link to="/catalog" className="hover:text-primary transition-colors">Каталог</Link>
            <span>/</span>
            <span className="text-neutral-600">Оформление заказа</span>
          </motion.div>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="pb-6 border-b border-black/5"
          >
            <h1 className="text-xl md:text-2xl font-black text-black uppercase tracking-wider">
              Оформление заказа
            </h1>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (Forms) */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="lg:col-span-7 space-y-10"
            >
              {/* SECTION 1: Контакты */}
              <motion.div variants={fadeUp} className="space-y-6">
                <div className="flex items-center mb-2">
                  <div className="w-7 h-7 flex items-center justify-center bg-black text-white rounded-full font-bold text-xs flex-none">1</div>
                  <h2 className="text-xs font-black tracking-wider text-black uppercase ml-3">Контактная информация</h2>
                  <div className="flex-1 h-px bg-black/5 ml-4" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label className="text-[12px] text-neutral-500 font-bold ml-1 mb-1.5 block">Имя</label>
                    <input
                      className="w-full h-[50px] bg-white border border-neutral-200 rounded-[20px] px-5 text-[14px] text-black placeholder-neutral-400 outline-none transition-all focus:border-black"
                      placeholder="Ваше имя"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] text-neutral-500 font-bold ml-1 mb-1.5 block">Фамилия</label>
                    <input
                      className="w-full h-[50px] bg-white border border-neutral-200 rounded-[20px] px-5 text-[14px] text-black placeholder-neutral-400 outline-none transition-all focus:border-black"
                      placeholder="Ваша фамилия"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] text-neutral-500 font-bold ml-1 mb-1.5 block">Телефон</label>
                    <input
                      className="w-full h-[50px] bg-white border border-neutral-200 rounded-[20px] px-5 text-[14px] text-black placeholder-neutral-400 outline-none transition-all focus:border-black"
                      type="tel"
                      placeholder="+7 (777) 777-77-77"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] text-neutral-500 font-bold ml-1 mb-1.5 block">Email</label>
                    <input
                      className="w-full h-[50px] bg-white border border-neutral-200 rounded-[20px] px-5 text-[14px] text-black placeholder-neutral-400 outline-none transition-all focus:border-black"
                      type="email"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </motion.div>

              {/* SECTION 2: Доставка */}
              <motion.div variants={fadeUp} className="space-y-6">
                <div className="flex items-center mb-2">
                  <div className="w-7 h-7 flex items-center justify-center bg-black text-white rounded-full font-bold text-xs flex-none">2</div>
                  <h2 className="text-xs font-black tracking-wider text-black uppercase ml-3">Способ доставки</h2>
                  <div className="flex-1 h-px bg-black/5 ml-4" />
                </div>

                <div className="flex flex-col gap-3">
                  {DELIVERY_OPTIONS.map(d => (
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
                        {d.price === 0 ? 'Бесплатно' : `${d.price.toLocaleString('ru-KZ')} ₸`}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Address details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-2">
                  <div className="sm:col-span-2">
                    <label className="text-[12px] text-neutral-500 font-bold ml-1 mb-1.5 block">Адрес доставки</label>
                    <input
                      className="w-full h-[50px] bg-white border border-neutral-200 rounded-[20px] px-5 text-[14px] text-black placeholder-neutral-400 outline-none transition-all focus:border-black"
                      placeholder="ул. Примерная, д. 1, кв. 1"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] text-neutral-500 font-bold ml-1 mb-1.5 block">Город</label>
                    <input
                      className="w-full h-[50px] bg-white border border-neutral-200 rounded-[20px] px-5 text-[14px] text-black placeholder-neutral-400 outline-none transition-all focus:border-black"
                      placeholder="Атырау"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] text-neutral-500 font-bold ml-1 mb-1.5 block">Почтовый индекс</label>
                    <input
                      className="w-full h-[50px] bg-white border border-neutral-200 rounded-[20px] px-5 text-[14px] text-black placeholder-neutral-400 outline-none transition-all focus:border-black"
                      placeholder="060000"
                    />
                  </div>
                </div>
              </motion.div>

              {/* SECTION 3: Оплата */}
              <motion.div variants={fadeUp} className="space-y-6">
                <div className="flex items-center mb-2">
                  <div className="w-7 h-7 flex items-center justify-center bg-black text-white rounded-full font-bold text-xs flex-none">3</div>
                  <h2 className="text-xs font-black tracking-wider text-black uppercase ml-3">Способ оплаты</h2>
                  <div className="flex-1 h-px bg-black/5 ml-4" />
                </div>

                <div className="flex flex-col gap-3">
                  {PAYMENT_OPTIONS.map(p => (
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
              </motion.div>
            </motion.div>

            {/* Right Column (Summary Panel) */}
            <motion.div
              className="lg:col-span-5 lg:sticky lg:top-[112px] space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              {/* Order Bento Card */}
              <div className="bg-neutral-50 border border-black/5 p-6 md:p-8 rounded-[28px] space-y-6">
                <h3 className="text-xs font-black tracking-wider text-black uppercase">Ваш заказ</h3>

                {/* Items */}
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-4xl text-neutral-300 mb-3 block">shopping_bag</span>
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Корзина пуста</p>
                    <Link to="/catalog" className="w-full h-[46px] bg-black hover:bg-neutral-900 text-white font-bold text-xs uppercase tracking-widest rounded-[20px] transition-colors flex items-center justify-center mt-6 cursor-pointer">
                      В каталог
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 max-h-[320px] overflow-y-auto pr-1">
                    {cartItems.map(item => (
                      <div key={item.id + (item.variant || '')} className="flex gap-4 p-3 bg-white border border-black/5 rounded-[16px] shadow-sm">
                        {/* Item image/emoji placeholder */}
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
                              {item.qty} шт × {item.price.toLocaleString('ru-KZ')} ₸
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
                    <span>Товары</span>
                    <span className="font-bold text-black">{subtotal.toLocaleString('ru-KZ')} ₸</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 font-medium">
                    <span>Доставка</span>
                    <span className="font-bold text-black">{deliveryCost === 0 ? 'Бесплатно' : `${deliveryCost.toLocaleString('ru-KZ')} ₸`}</span>
                  </div>
                  <div className="h-px bg-black/5 my-2" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-black text-black uppercase tracking-wider">Итого к оплате</span>
                    <span className="text-xl font-black text-primary tracking-wide">
                      {total.toLocaleString('ru-KZ')} ₸
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button & Disclaimer */}
              <div className="space-y-4">
                <button className="w-full h-[58px] bg-black hover:bg-neutral-900 text-white font-bold text-[14px] tracking-widest uppercase rounded-[20px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]">
                  Подтвердить заказ — {total.toLocaleString('ru-KZ')} ₸
                </button>
                <p className="text-[10px] text-neutral-400 text-center tracking-wider font-medium">
                  Нажимая кнопку, вы принимаете условия{' '}
                  <Link to="/privacy" className="underline hover:text-black transition-colors">политики конфиденциальности</Link>
                </p>
              </div>

              {/* Privacy & Discretion Assurances */}
              <div className="bg-neutral-100 border border-black/5 p-6 rounded-[28px] text-left font-sans space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-black/5">
                  {/* SVG of discreet box */}
                  <div className="w-10 h-10 flex-none flex items-center justify-center bg-white border border-black/5 rounded-full shadow-sm text-primary">
                    <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-black uppercase tracking-widest">100% Конфиденциальность</h4>
                    <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">Гарантия анонимности</p>
                  </div>
                </div>

                <div className="space-y-4 text-[11px] leading-relaxed text-neutral-600 font-medium">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[16px] text-primary mt-0.5 flex-none">inventory_2</span>
                    <div>
                      <span className="text-black font-black block mb-0.5 uppercase tracking-wider text-[9px]">Нейтральная упаковка</span>
                      Все заказы отправляются в плотных непрозрачных сейф-пакетах или стандартных картонных коробках без каких-либо логотипов, надписей бренда или указания интимного характера содержимого.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[16px] text-primary mt-0.5 flex-none">account_balance_wallet</span>
                    <div>
                      <span className="text-black font-black block mb-0.5 uppercase tracking-wider text-[9px]">Нейтральный биллинг</span>
                      В выписке по вашей карте или Kaspi при списании отобразится нейтральное наименование продавца (например, <span className="text-black font-bold">«Retail Atyrau»</span> или <span className="text-black font-bold">«HS-Atyrau»</span>), без упоминания интимных товаров или бренда.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[16px] text-primary mt-0.5 flex-none">shield</span>
                    <div>
                      <span className="text-black font-black block mb-0.5 uppercase tracking-wider text-[9px]">Защита SSL и данных</span>
                      Ваши персональные данные защищены 256-битным SSL-шифрованием и используются исключительно для конфиденциальной доставки заказа курьером.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
