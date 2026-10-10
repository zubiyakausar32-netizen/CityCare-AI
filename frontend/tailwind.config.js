/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#103b2d',
        emerald: '#1f8d64',
        mint: '#def7ee',
        charcoal: '#1b1d1d',
        ivory: '#f7f8f4',
      },
      boxShadow: {
        soft: '0 10px 25px rgba(16, 59, 45, 0.08)',
      },
    },
  },
  plugins: [],
};
