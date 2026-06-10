import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-hs py-20">
        {/* Top row — 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="header-logo-text text-2xl block mb-6">HOT STUFF</Link>
            <p className="text-body-md text-on-surface-variant max-w-xs leading-relaxed">
              Мы создаём продукты, которые вдохновляют на эмоциональную близость и самопознание.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="label-caps text-on-surface-variant mb-6">Навигация</h4>
            <nav className="flex flex-col gap-4">
              {[
                { to: '/catalog', label: 'Каталог' },
                { to: '/catalog?cat=wellness', label: 'Wellness' },
                { to: '/catalog?cat=philosophy', label: 'Philosophy' },
                { to: '/about', label: 'О нас' },
              ].map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="label-caps text-on-surface-variant hover:text-primary transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Info + Social */}
          <div>
            <h4 className="label-caps text-on-surface-variant mb-6">Информация</h4>
            <nav className="flex flex-col gap-4 mb-8">
              {[
                { to: '/delivery', label: 'Доставка' },
                { to: '/returns', label: 'Возврат' },
                { to: '/privacy', label: 'Конфиденциальность' },
                { to: '/contacts', label: 'Контакты' },
              ].map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="label-caps text-on-surface-variant hover:text-primary transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Social icons */}
            <div className="flex items-center gap-5 mt-6">
              {['Instagram', 'Telegram', 'WhatsApp'].map(name => (
                <a
                  key={name}
                  href="#"
                  className="label-caps text-[10px] text-outline hover:text-primary transition-colors"
                  aria-label={name}
                >
                  {name.toUpperCase()}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-outline tracking-wider">
            © {new Date().getFullYear()} HOT STUFF. Все права защищены.
          </p>
          <p className="text-xs text-outline tracking-wider">
            Атырау, Казахстан
          </p>
        </div>
      </div>
    </footer>
  );
}
