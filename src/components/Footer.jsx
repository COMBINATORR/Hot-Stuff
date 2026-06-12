import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Footer Configuration Data (Config)
const FOOTER_CONFIG = {
  brand: {
    logo: "HOT STUFF",
    subtitle: "АТЫРАУ",
    description: "Мы гарантируем 100% анонимность доставки. Все заказы отправляются в плотных непрозрачных сейф-пакетах без каких-либо логотипов или названия магазина. Курьер не знает о содержимом посылки.",
    socials: [
      { name: 'Instagram', url: 'https://instagram.com', icon: 'instagram' },
      { name: 'Telegram', url: 'https://t.me', icon: 'telegram' },
      { name: 'WhatsApp', url: 'https://wa.me', icon: 'whatsapp' }
    ]
  },
  buyers: {
    title: "Покупателям",
    links: [
      { label: "Таблица размеров", to: "/size-guide" },
      { label: "FAQ", to: "/faq" },
      { label: "Правила возврата нижнего белья", to: "/returns-policy" },
      { label: "Служба поддержки", to: "/support" }
    ]
  },
  paymentsLogistics: {
    title: "Оплата и Логистика",
    description: "Бережная и оперативная доставка осуществляется по всей территории Казахстана. Выберите любой удобный способ оплаты при оформлении заказа.",
    payments: [
      { id: "kaspi", name: "Kaspi Pay", type: "highlight", label: "KASPI PAY" },
      { id: "visa", name: "Visa", type: "standard", label: "VISA" },
      { id: "mc", name: "Mastercard", type: "standard", label: "MC" },
      { id: "halyk", name: "Halyk", type: "standard", label: "HALYK" },
      { id: "cash", name: "Cash", type: "standard", label: "CASH" }
    ]
  },
  legal: {
    title: "Правовая информация",
    links: [
      { label: "Политика конфиденциальности", to: "/privacy" },
      { label: "Публичная оферта", to: "/terms" }
    ],
    ageRestriction: "18+",
    warningText: "Сайт содержит материалы для взрослых. Продажа товаров осуществляется строго лицам старше 18 лет."
  }
};

export default function Footer() {
  const [buyersOpen, setBuyersOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const [paymentsOpen, setPaymentsOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const [legalOpen, setLegalOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);

  return (
    <footer className="site-footer bg-black border-t border-white/5">
      <div className="container-hs pt-6 pb-6 md:pt-12 md:pb-8 px-6 md:px-12 lg:px-16">
        
        {/* Main Grid: 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-8">
          
          {/* Column 1: Brand & Trust */}
          <div className="flex flex-col items-start space-y-4 md:space-y-6">
            <div className="flex flex-col select-none">
              <Link to="/" className="font-sans font-black text-2xl tracking-[0.2em] text-white uppercase hover:text-primary transition-colors">
                {FOOTER_CONFIG.brand.logo}
              </Link>
              <span className="text-[10px] tracking-[0.45em] text-[#71717a] font-bold mt-1.5 uppercase font-sans">
                {FOOTER_CONFIG.brand.subtitle}
              </span>
            </div>
            <p className="text-[13px] text-[#a1a1aa] leading-relaxed max-w-sm font-sans font-normal">
              {FOOTER_CONFIG.brand.description}
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-5 pt-2">
              {FOOTER_CONFIG.brand.socials.map(social => (
                <a 
                  key={social.name}
                  href={social.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[#71717a] hover:text-white transition-colors duration-300"
                  aria-label={social.name}
                >
                  {social.icon === 'instagram' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  )}
                  {social.icon === 'telegram' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                  )}
                  {social.icon === 'whatsapp' && (
                    <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Buyers */}
          <div className="flex flex-col items-start w-full">
            <button
              onClick={() => setBuyersOpen(!buyersOpen)}
              className="flex items-center text-left bg-transparent border-none text-white focus:outline-none group py-1 md:py-0 md:mb-6 w-full cursor-pointer"
            >
              <span className="text-[14px] font-light leading-none text-white/50 mr-2.5 transition-colors group-hover:text-primary md:hidden">
                {buyersOpen ? '–' : '+'}
              </span>
              <h4 className="font-sans font-black text-xs tracking-[0.2em] uppercase">{FOOTER_CONFIG.buyers.title}</h4>
            </button>
            <AnimatePresence initial={false}>
              {buyersOpen && (
                <motion.nav 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden flex flex-col gap-1.5 w-full pl-5 md:pl-0 pb-3 md:pb-0"
                >
                  {FOOTER_CONFIG.buyers.links.map(l => (
                    <Link
                      key={l.to}
                      to={l.to}
                      className="font-sans font-bold text-xs tracking-wider text-[#a1a1aa] hover:text-white transition-colors uppercase block py-1 md:py-0"
                    >
                      {l.label}
                    </Link>
                  ))}
                </motion.nav>
              )}
            </AnimatePresence>
          </div>

          {/* Column 3: Payments & Logistics */}
          <div className="flex flex-col items-start w-full">
            <button
              onClick={() => setPaymentsOpen(!paymentsOpen)}
              className="flex items-center text-left bg-transparent border-none text-white focus:outline-none group py-1 md:py-0 md:mb-6 w-full cursor-pointer"
            >
              <span className="text-[14px] font-light leading-none text-white/50 mr-2.5 transition-colors group-hover:text-primary md:hidden">
                {paymentsOpen ? '–' : '+'}
              </span>
              <h4 className="font-sans font-black text-xs tracking-[0.2em] uppercase">{FOOTER_CONFIG.paymentsLogistics.title}</h4>
            </button>
            <AnimatePresence initial={false}>
              {paymentsOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden flex flex-col gap-3 w-full pl-5 md:pl-0 pb-3 md:pb-0"
                >
                  <p className="text-[13px] text-[#a1a1aa] leading-relaxed font-sans font-normal">
                    {FOOTER_CONFIG.paymentsLogistics.description}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {FOOTER_CONFIG.paymentsLogistics.payments.map(pay => {
                      if (pay.type === 'highlight') {
                        return (
                          <div 
                            key={pay.id} 
                            className="bg-[#F14635] text-white font-black text-[9px] tracking-widest px-3 py-1.5 rounded-[4px] flex items-center gap-1 select-none shadow-md"
                            title={pay.name}
                          >
                            <span className="material-symbols-outlined text-[12px] leading-none">qr_code_2</span>
                            <span>{pay.label}</span>
                          </div>
                        );
                      }
                      return (
                        <div 
                          key={pay.id}
                          className="border border-white/10 text-[#a1a1aa] font-bold text-[9px] tracking-widest px-3 py-1.5 rounded-[4px] flex items-center select-none"
                          title={pay.name}
                        >
                          {pay.id === 'cash' && <span className="material-symbols-outlined text-[12px] leading-none mr-1">payments</span>}
                          <span>{pay.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Column 4: Legal */}
          <div className="flex flex-col items-start w-full">
            <button
              onClick={() => setLegalOpen(!legalOpen)}
              className="flex items-center text-left bg-transparent border-none text-white focus:outline-none group py-1 md:py-0 md:mb-6 w-full cursor-pointer"
            >
              <span className="text-[14px] font-light leading-none text-white/50 mr-2.5 transition-colors group-hover:text-primary md:hidden">
                {legalOpen ? '–' : '+'}
              </span>
              <h4 className="font-sans font-black text-xs tracking-[0.2em] uppercase">{FOOTER_CONFIG.legal.title}</h4>
            </button>
            <AnimatePresence initial={false}>
              {legalOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden flex flex-col gap-3 w-full pl-5 md:pl-0 pb-3 md:pb-0"
                >
                  <nav className="flex flex-col gap-1.5">
                    {FOOTER_CONFIG.legal.links.map(l => (
                      <Link
                        key={l.to}
                        to={l.to}
                        className="font-sans font-bold text-xs tracking-wider text-[#a1a1aa] hover:text-white transition-colors uppercase block py-1 md:py-0"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </nav>
                  
                  {/* Strict 18+ Warning Marker */}
                  <div className="flex items-start gap-3 border-t border-white/5 pt-3 mt-1">
                    <span className="w-8 h-8 bg-[#FF5C3F] text-white rounded-[4px] flex items-center justify-center font-sans font-black text-[11px] flex-none select-none shadow-sm">
                      {FOOTER_CONFIG.legal.ageRestriction}
                    </span>
                    <p className="text-[10px] text-[#71717a] leading-normal font-sans font-medium tracking-wide">
                      {FOOTER_CONFIG.legal.warningText}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/5 mt-6 mb-4 md:mt-12 md:mb-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[#71717a] font-sans text-xs">
          <p className="tracking-wider text-center md:text-left">
            © {new Date().getFullYear()} {FOOTER_CONFIG.brand.logo}. Все права защищены.
          </p>
          <p className="tracking-wider text-center md:text-right text-[10px] uppercase font-bold">
            100% анонимность гарантирована
          </p>
        </div>

      </div>
    </footer>
  );
}
