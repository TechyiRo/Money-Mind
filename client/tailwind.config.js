/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1E3A5F',
        accent: '#0EA5E9',
        income: '#22C55E',
        expense: '#EF4444',
        warning: '#F59E0B',
        surface: {
          light: '#F8FAFC',
          dark: '#0F172A',
        },
        card: {
          light: '#FFFFFF',
          dark: '#1E293B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
