/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  safelist: [
    'grid',
    'grid-cols-1',
    'grid-cols-2',
    'grid-cols-3',
    'grid-cols-4',
    'grid-cols-6',
    'sm:grid-cols-2',
    'sm:grid-cols-3',
    'lg:grid-cols-3',
    'xl:grid-cols-4',
    'xl:grid-cols-6',
  ],
  theme: {
    extend: {

      fontFamily: {
        comfortaa: ['Comfortaa', 'cursive'],
        intro: ['Poppins', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],

        ubuntu: ['var(--font-ubuntu)', 'sans-serif'], // since you're already using this
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      },
    },
  },
  plugins: [],
};
