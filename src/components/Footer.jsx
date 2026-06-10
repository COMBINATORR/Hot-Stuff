import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const navItems = [
  { key: 'home',     to: '/' },
  { key: 'catalog',  to: '/catalog' },
  { key: 'cart',     to: '/cart' },
  { key: 'checkout', to: '/checkout' },
];

const SOCIALS = [
  { label: 'Instagram', href: '#', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )},
  { label: 'WhatsApp', href: '#', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
    </svg>
  )},
];

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="site-footer" id="site-footer">
      {/* Trust bar */}
      <div className="trust-bar">
        {[
          { icon: '🚚', title: 'Яндекс Доставка', sub: 'По всему Казахстану' },
          { icon: '💳', title: 'Kaspi Pay', sub: 'Оплата и рассрочка' },
          { icon: '↩️', title: 'Возврат 30 дней', sub: 'Без лишних вопросов' },
          { icon: '🔒', title: 'Безопасная оплата', sub: 'SSL-шифрование' },
        ].map(({ icon, title, sub }) => (
          <div key={title} className="trust-bar-item">
            <div className="trust-bar-icon">{icon}</div>
            <div className="trust-bar-text">
              <strong>{title}</strong>
              <span>{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer body */}
      <div className="container-hs">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--brand-gold)', letterSpacing: '0.1em' }}>
                HOT STUFF
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.45)', maxWidth: '260px' }}>
              Премиальные товары с быстрой доставкой по Казахстану. Оплата Kaspi Pay.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              {SOCIALS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  style={{
                    width: 36, height: 36,
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.45)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--brand-gold)';
                    e.currentTarget.style.borderColor = 'var(--brand-gold)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="footer-col-title">Навигация</p>
            <div className="footer-links">
              {navItems.map(({ key, to }) => (
                <NavLink key={key} to={to} className="footer-links">
                  {t(`nav.${key}`)}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="footer-col-title">Информация</p>
            <div className="footer-links">
              <a href="#">Доставка и оплата</a>
              <a href="#">Возврат товара</a>
              <a href="#">Политика конфиденциальности</a>
              <a href="#">Публичная оферта</a>
              <a href="#">Контакты</a>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="footer-bottom">
          <span>{t('footer.copyright')}</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', transition: 'color 0.2s' }}
               onMouseEnter={e => e.target.style.color = 'var(--brand-gold)'}
               onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}>
              Kaspi
            </a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', transition: 'color 0.2s' }}
               onMouseEnter={e => e.target.style.color = 'var(--brand-gold)'}
               onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}>
              Яндекс
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
