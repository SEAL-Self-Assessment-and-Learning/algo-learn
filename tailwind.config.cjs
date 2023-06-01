/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./front-end/src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        goethe: {
          50: '#D5E5EC',
          100: '#AACADA',
          200: '#80B0C7',
          300: '#5596B4',
          400: '#2B7BA2',
          500: 'hsl(199deg 100% 28%)',
          DEFAULT: 'hsl(199deg 100% 28%)',
          600: '#005177',
          700: '#00415F',
          800: '#003148',
          900: '#002030',
        },
      }
    },
  },
  plugins: [],
  darkMode: "class",
}
