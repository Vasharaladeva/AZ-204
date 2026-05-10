/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        azure: {
          50:  '#f0f6ff',
          100: '#dbeafe',
          500: '#0078d4',  // Microsoft Azure brand blue
          600: '#106ebe',
          700: '#005a9e',
          900: '#003a6e',
        },
      },
    },
  },
  plugins: [],
};
