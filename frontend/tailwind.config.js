/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#09120d',
          800: '#0f1d16',
          700: '#14261c',
          600: '#1e3828',
          500: '#10b981',
        }
      }
    },
  },
  plugins: [],
}

