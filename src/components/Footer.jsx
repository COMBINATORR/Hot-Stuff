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
                className="text-outline hover:text-white transition-colors duration-300"
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
                className="text-outline hover:text-white transition-colors duration-300"
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
                className="text-outline hover:text-white transition-colors duration-300"
                aria-label="WhatsApp"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
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
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="font-sans font-bold text-[10px] tracking-wider text-outline uppercase mr-2 select-none">
              Принимаем к оплате:
            </span>
            
            {/* Visa */}
            <div className="h-7 px-3 border border-white/10 flex items-center justify-center select-none text-outline hover:text-white hover:border-white/30 transition-colors">
              <span className="font-sans font-bold text-[9px] tracking-[0.15em] uppercase">VISA</span>
            </div>
            
            {/* Mastercard */}
            <div className="h-7 px-3 border border-white/10 flex items-center justify-center gap-1.5 select-none text-outline hover:text-white hover:border-white/30 transition-colors">
              <div className="flex -space-x-1">
                <div className="w-2.5 h-2.5 rounded-full bg-current opacity-60"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
              </div>
              <span className="font-sans font-bold text-[9px] tracking-[0.1em] uppercase">MC</span>
            </div>
            
            {/* Kaspi QR */}
            <div className="h-7 px-3 border border-white/15 bg-red-600/10 text-red-500 hover:text-red-400 hover:border-red-500/30 flex items-center justify-center gap-1.5 select-none transition-colors">
              <span className="material-symbols-outlined text-[13px] leading-none">qr_code_2</span>
              <span className="font-sans font-black text-[9px] tracking-wider uppercase">KASPI QR</span>
            </div>
            
            {/* Halyk Bank */}
            <div className="h-7 px-3 border border-white/15 bg-emerald-600/10 text-emerald-500 hover:text-emerald-400 hover:border-emerald-500/30 flex items-center justify-center select-none transition-colors">
              <span className="font-sans font-black text-[9px] tracking-wider uppercase">HALYK</span>
            </div>
            
            {/* Cash */}
            <div className="h-7 px-3 border border-white/10 flex items-center justify-center gap-1 select-none text-outline hover:text-white hover:border-white/30 transition-colors">
              <span className="material-symbols-outlined text-[13px] leading-none">payments</span>
              <span className="font-sans font-bold text-[9px] tracking-[0.1em] uppercase">CASH</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
