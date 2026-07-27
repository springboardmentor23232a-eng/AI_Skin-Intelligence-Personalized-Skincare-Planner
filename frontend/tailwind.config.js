/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fdf4f0",
          100: "#fbe6dc",
          400: "#e39176",
          500: "#d97757",
          600: "#c5623f",
        },
      },
    },
  },
  plugins: [],
}
