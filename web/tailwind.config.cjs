/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef9ff',
          100: '#d9f1ff',
          200: '#bce7ff',
          300: '#8fdaff',
          400: '#58c7ff',
          500: '#29adff',
          600: '#0a8ff0',
          700: '#0872c5',
          800: '#0a5da1',
          900: '#0d4e83',
        },
      },
      boxShadow: {
        'soft': '0 4px 24px -2px rgba(0,0,0,0.06)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(41,173,255,0.5)' },
          '50%': { boxShadow: '0 0 0 8px rgba(41,173,255,0.0)' },
        },
        beep: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.25 },
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-out infinite',
        'beep': 'beep 1s steps(2, end) infinite',
      },
    },
  },
  plugins: [],
}