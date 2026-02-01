/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#37ec13",           // AgriMarket Neon Green
        "brand-green": "#37ec13",
        "background-light": "#f8fafc",
        "background-dark": "#132210",
      },
      fontFamily: {
        "display": ["Lexend", "sans-serif"],
        "sans": ["Lexend", "sans-serif"],
      },
      maxWidth: {
        '7xl': '80rem',
      },
    },
  },
  plugins: [],
}

