/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        paper: {
          50: '#FDFCFA',
          100: '#FAF8F3',
          200: '#F4F0E8',
          300: '#E8E0D2',
        },
        ink: {
          900: '#1A1A1A',
          800: '#2A2A2A',
          700: '#3D3D3D',
          600: '#525252',
          500: '#6B6B6B',
          400: '#8B8B8B',
          300: '#ABABAB',
        },
        forest: {
          50: '#F0F5F0',
          100: '#DCE8DC',
          200: '#B8D2B8',
          400: '#4A7C4A',
          500: '#2D5F3F',
          600: '#234A32',
          700: '#1A3826',
        },
        gold: {
          100: '#FAF3E0',
          300: '#E8D49B',
          400: '#D4B86A',
          500: '#C9A961',
          600: '#A88B4A',
        },
        clay: {
          400: '#D4845C',
          500: '#C06A3E',
        },
      },
    },
  },
  plugins: [],
};
