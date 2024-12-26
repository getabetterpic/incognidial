const { createGlobPatternsForDependencies } = require('@nx/vue/tailwind');
const { join } = require('path');
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'index.html'),
    join(__dirname, 'src/**/*!(*.stories|*.spec).{vue,ts,tsx,js,jsx}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.slate,
      gray: colors.gray,
      yellow: colors.yellow,
      blue: colors.blue,
      purple: colors.purple,
    },
  },
  plugins: [],
};