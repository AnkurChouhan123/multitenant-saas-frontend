/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // ⚠️ CRITICAL: This enables class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c7ff',
          400: '#8da9ff',
          500: '#667eea', // Main primary color
          600: '#5568d3',
          700: '#4553b8',
          800: '#374194',
          900: '#2d3573',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#764ba2', // Main secondary color
          600: '#6b3d91',
          700: '#5e3380',
          800: '#4d2a6a',
          900: '#3f2254',
        },
      },
    },
  },
  plugins: [],
}