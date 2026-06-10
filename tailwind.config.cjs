module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        brandGold:    'hsl(42, 88%, 54%)',
        brandMustard: 'hsl(30, 80%, 46%)',
        brandDark:    'hsl(220, 20%, 7%)',
      },
      fontFamily: {
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
        body:    ['Urbanist',   'system-ui', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        fadeUp:  'fadeUp 0.4s cubic-bezier(0.0, 0.0, 0.2, 1) both',
      },
    },
  },
  plugins: [],
};
