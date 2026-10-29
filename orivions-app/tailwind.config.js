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
        ink: '#15140F',
        paper: '#FBFAF6',
        gray: {
          DEFAULT: '#5C5A52',
          soft: '#6E6B61',
        },
        line: '#E6E2D8',
        'bg-soft': '#F3F1EA',
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
