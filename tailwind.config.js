/** @type {import('tailwindcss').Config} */
const { heroui } = require('@heroui/react')

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    {
      pattern: /bg-(amber|blue|sky|emerald|yellow|green|gray|purple|violet|fuchsia|pink|rose)-.*/
    }
  ],
  theme: {
    extend: {}
  },
  darkMode: 'class',
  plugins: [heroui()]
}
