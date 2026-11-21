/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#FFFFFF',
          100: '#FAF8F5',
          200: '#F5F0E6',
          300: '#EBE3D5',
          400: '#DDD2BE',
          500: '#C5A880',
          600: '#A68963',
          700: '#856B49',
        },
        cream: {
          50: '#FFFFFF',
          100: '#FAF8F5',
          200: '#F4EFE6',
          300: '#E8DFD1',
        },
        crest: {
          950: '#222826',
          900: '#2C3330',
          800: '#3D4642',
          700: '#525D58',
          600: '#68746F',
          500: '#84918B',
        },
        gold: {
          900: '#5C4930',
          700: '#856B49',
          600: '#9E815B',
          500: '#C5A880',
          400: '#D4BC9A',
          300: '#E3D2B9',
          200: '#F0E6D6',
          100: '#FAF6F0',
        }
      },
      fontFamily: {
        serif: ['"Ubuntu"', 'sans-serif'],
        sans: ['"Fredoka"', '"Plus Jakarta Sans"', 'sans-serif'],
        signature: ['"Ubuntu"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'gold-sm': '0 4px 20px -4px rgba(197, 168, 128, 0.18)',
        'gold-md': '0 10px 30px -6px rgba(197, 168, 128, 0.22)',
        'gold-lg': '0 20px 50px -12px rgba(197, 168, 128, 0.28)',
        'crest-xl': '0 20px 50px -15px rgba(34, 40, 38, 0.08)',
      }
    },
  },
  plugins: [],
}
