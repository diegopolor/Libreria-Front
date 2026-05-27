/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f6fb', 100: '#e9edf7', 200: '#cbd6ed', 300: '#9db3dd',
          400: '#6889ca', 500: '#4668b5', 600: '#344f95', 700: '#2b3f79',
          800: '#273766', 900: '#242f55', 950: '#191f37',
        },
      },
      fontFamily: { sans: ['Outfit', 'Inter', 'sans-serif'] },
    },
  },
  plugins: [],
}
