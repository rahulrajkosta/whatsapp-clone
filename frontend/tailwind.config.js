/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          green: '#25D366',
          dark: '#075E54',
          light: '#DCF8C6',
          blue: '#34B7F1'
        }
      }
    },
  },
  plugins: [],
}
