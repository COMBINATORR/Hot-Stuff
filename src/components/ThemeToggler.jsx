import React, { useEffect, useState } from 'react';

const THEMES = ['system', 'light', 'dark'];

const labels = { system: '⚙ Системная', light: '☀ Светлая', dark: '🌙 Тёмная' };

export default function ThemeToggler() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('hs-theme') || 'system'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme'); // system — через @media
    localStorage.setItem('hs-theme', theme);
  }, [theme]);

  return (
    <div
      id="theme-toggler"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        gap: '0.5rem',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '2rem',
        padding: '0.4rem 0.8rem',
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
      }}
    >
      {THEMES.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          title={labels[t]}
          style={{
            padding: '0.3rem 0.7rem',
            borderRadius: '1.5rem',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            fontWeight: theme === t ? '700' : '400',
            background: theme === t ? 'var(--brand-gold)' : 'transparent',
            color: theme === t ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
        >
          {labels[t]}
        </button>
      ))}
    </div>
  );
}
