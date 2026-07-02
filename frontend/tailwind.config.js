/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        meesho: {
          pink: '#e91e8c',
          'pink-dark': '#c2185b',
          'pink-light': '#fce4ec',
          'pink-bg': '#fdf0f7',
          purple: '#5a0b6c',
          'purple-mid': '#7b2d8b',
          'purple-light': '#f3e5f5',
          orange: '#f97316',
          'orange-light': '#fff3e0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px 0 rgba(90,11,108,0.08)',
        'card-hover': '0 6px 24px 0 rgba(90,11,108,0.14)',
        pink: '0 4px 14px 0 rgba(233,30,140,0.30)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
};
