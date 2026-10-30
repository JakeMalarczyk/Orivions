/** @type {import('tailwindcss').Config} */
const c = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'blue-deep': c('blue-deep'),
        'blue-light': c('blue-light'),
        ink: c('ink'),
        spark: c('spark'),
        paper: c('paper'),
        gray: {
          DEFAULT: c('gray'),
          soft: c('gray-soft'),
        },
        line: c('line'),
        'bg-soft': c('bg-soft'),
        ok: c('ok'),
        danger: c('danger'),
        warn: c('warn'),
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
