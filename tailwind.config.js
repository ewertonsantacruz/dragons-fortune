/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          100: '#FFF3B8',
          300: '#FFE066',
          400: '#FFD700',
          500: '#B8860B',
          700: '#5C4305',
        },
        ruby: {
          400: '#E32636',
          500: '#C1121F',
          700: '#720913',
        },
        ember: {
          400: '#FF8A3D',
          500: '#FF6B00',
        },
        obsidian: {
          700: '#1A1420',
          800: '#120D18',
          900: '#09070D',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px) scale(0.96)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
    },
  },
  plugins: [],
};
