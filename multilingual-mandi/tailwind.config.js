/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#37ec13",
                "background-light": "#f6f8f6",
                "background-dark": "#132210",
            },
            fontFamily: {
                "display": ["Lexend", "sans-serif"],
                "sans": ["Lexend", "sans-serif"],
            },
        },
    },
    plugins: [],
}
