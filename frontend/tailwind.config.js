// -------------------------------------------------------------
// Why: This file configures Tailwind CSS for the frontend project.
//
// Why this design?
//   - Centralizes all Tailwind theme and plugin settings.
//   - Makes it easy to customize the app's design system.

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
