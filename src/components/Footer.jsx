import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer bg-black border-t border-white/5">
      <div className="container-hs py-20">
        {/* Main Grid: 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Column 1: Brand details */}
          <div className="flex flex-col items-start">
            <Link to="/" className="font-sans font-black text-2xl tracking-[0.2em] text-white uppercase mb-6">
              HOT STUFF
            </Link>
            <p className="text-body-md text-on-surface-variant max-w-xs leading-relaxed mb-6 font-sans">
              Мы создаём продукты, которые вдохновляют на эмоциональную близость, чувственность и самопознание.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-5">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="text-outline hover:text-[#E1306C] transition-colors duration-300"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a 
                href="https://t.me" 
                target="_blank" 
                rel="noreferrer" 
                className="text-outline hover:text-[#26A5E4] transition-colors duration-300"
                aria-label="Telegram"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </a>
              <a 
                href="https://wa.me" 
                target="_blank" 
                rel="noreferrer" 
                className="text-outline hover:text-[#25D366] transition-colors duration-300"
                aria-label="WhatsApp"
              >
                <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="flex flex-col items-start">
            <h4 className="font-sans font-black text-xs tracking-[0.2em] text-white uppercase mb-6">Навигация</h4>
            <nav className="flex flex-col gap-3">
              {[
                { to: '/catalog', label: 'Каталог' },
                { to: '/catalog?cat=wellness', label: 'Wellness' },
                { to: '/catalog?cat=philosophy', label: 'Philosophy' },
                { to: '/about', label: 'О нас' },
              ].map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="font-sans font-bold text-xs tracking-wider text-outline hover:text-white transition-colors uppercase"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Information */}
          <div className="flex flex-col items-start">
            <h4 className="font-sans font-black text-xs tracking-[0.2em] text-white uppercase mb-6">Информация</h4>
            <nav className="flex flex-col gap-3">
              {[
                { to: '/delivery', label: 'Доставка' },
                { to: '/returns', label: 'Возврат' },
                { to: '/privacy', label: 'Конфиденциальность' },
                { to: '/contacts', label: 'Контакты' },
              ].map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="font-sans font-bold text-xs tracking-wider text-outline hover:text-white transition-colors uppercase"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 4: Contacts & Address */}
          <div className="flex flex-col items-start">
            <h4 className="font-sans font-black text-xs tracking-[0.2em] text-white uppercase mb-6">Контакты</h4>
            <div className="flex flex-col gap-3 font-sans text-xs text-outline">
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                <span>Атырау, Казахстан</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">mail</span>
                <a href="mailto:info@hotstuff.kz" className="hover:text-white transition-colors">info@hotstuff.kz</a>
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">call</span>
                <a href="tel:+77771234567" className="hover:text-white transition-colors">+7 (777) 123-45-67</a>
              </p>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/5 mt-16 mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="font-sans text-xs text-outline tracking-wider text-center md:text-left">
            © {new Date().getFullYear()} HOT STUFF. Все права защищены.
          </p>
          
          {/* Accepted Payments Section */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-outline">
            <span className="font-sans font-bold text-[10px] tracking-wider uppercase mr-2 select-none">
              Принимаем к оплате:
            </span>
            
            {/* Visa */}
            <span className="font-sans font-bold text-[11px] tracking-[0.15em] uppercase select-none hover:text-white transition-colors cursor-default">
              VISA
            </span>
            
            {/* Mastercard */}
            <div className="flex items-center gap-1.5 select-none hover:text-white transition-colors cursor-default">
              <div className="flex -space-x-1">
                <div className="w-2.5 h-2.5 rounded-full bg-current opacity-60"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
              </div>
              <span className="font-sans font-bold text-[11px] tracking-[0.1em] uppercase">MC</span>
            </div>
            
            {/* Kaspi QR */}
            <div className="flex items-center gap-1.5 select-none text-red-500 hover:text-red-400 transition-colors cursor-default">
              <span className="material-symbols-outlined text-[15px] leading-none">qr_code_2</span>
              <span className="font-sans font-black text-[11px] tracking-wider uppercase">KASPI QR</span>
            </div>
            
            {/* Halyk Bank */}
            <div className="flex items-center gap-1 select-none text-emerald-500 hover:text-emerald-400 transition-colors cursor-default">
              <span className="font-sans font-black text-[11px] tracking-wider uppercase">HALYK</span>
            </div>
            
            {/* Cash */}
            <div className="flex items-center gap-1 select-none hover:text-white transition-colors cursor-default">
              <span className="material-symbols-outlined text-[15px] leading-none">payments</span>
              <span className="font-sans font-bold text-[11px] tracking-[0.1em] uppercase">CASH</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/5 my-8" />

        {/* 18+ Discretion & Warning Sub-bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-outline font-sans text-[10px] sm:text-[11px] tracking-wider leading-relaxed select-none">
          <div className="flex items-center gap-2.5 text-center md:text-left justify-center md:justify-start">
            <span className="w-5 h-5 bg-[#FF5C3F] text-white rounded-[3px] flex items-center justify-center font-sans font-black text-[9px] flex-none">
              18
            </span>
            <span>Этот сайт предназначен для просмотра и покупок только совершеннолетними (18+).</span>
          </div>
          <div>
            <a href="#" className="underline hover:text-white transition-colors">Мобильная версия</a>
          </div>
          <div className="text-center md:text-right">
            Все модели на сайте достигли возраста 18 лет.
          </div>
        </div>

      </div>
    </footer>
  );
}
