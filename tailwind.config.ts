import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        tg: {
          bg: 'var(--tg-bg, #ffffff)',
          text: 'var(--tg-text, #000000)',
          hint: 'var(--tg-hint, #999999)',
          link: 'var(--tg-link, #2481cc)',
          button: 'var(--tg-button, #2481cc)',
          buttonText: 'var(--tg-button-text, #ffffff)',
          secondary: 'var(--tg-secondary-bg, #f1f1f1)',
        },
      },
    },
  },
  plugins: [],
}

export default config
