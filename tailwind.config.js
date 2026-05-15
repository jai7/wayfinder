/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink:    '#1a2622',
        paper:  '#fdf6df',
        cream:  '#fff9e2',
        butter: '#f4dc7c',
        'wf-pink':  '#f0a6b5',
        mint:   '#9cd6a5',
        peach:  '#f0b487',
        water:  '#9fd6d8',
        road:   '#2c4838',
        pop:    '#e63a2e',
      },
      fontFamily: {
        pop:  ['Bungee', 'system-ui', 'sans-serif'],
        big:  ['"Big Shoulders Display"', 'system-ui', 'sans-serif'],
        body: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['VT323', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        track: '0.22em',
      },
    },
  },
  plugins: [],
};
