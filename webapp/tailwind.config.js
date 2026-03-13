/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        lv: {
          50:  '#edfcff',
          100: '#d6f7ff',
          200: '#b5f1ff',
          300: '#83e8ff',
          400: '#48d5f5',
          500: '#1eb8db',
          600: '#0d93b7',
          700: '#107594',
          800: '#155f78',
          900: '#164f66',
        },
      },
      animation: {
        'slide-up':   'slideUp 0.35s ease-out',
        'fade-in':    'fadeIn 0.25s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(14px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}