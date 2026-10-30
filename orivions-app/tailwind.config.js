/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'blue-deep': '#1D4ED8',
        'blue-light': '#38BDF8',
        ink: '#0B1530',
        paper: '#F8FAFD',
        gray: {
          DEFAULT: '#55617A',
          soft: '#66728A',
        },
        line: '#DCE4F1',
        'bg-soft': '#EEF3FB',
        ok: '#1FA971',
        danger: '#E4574C',
        warn: '#E8A33D',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
