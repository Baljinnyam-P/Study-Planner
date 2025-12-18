// -------------------------------------------------------------
// Why: This file configures Tailwind CSS for the frontend project.
//
// Why this design?
//   - Centralizes all Tailwind theme and plugin settings.
//   - Makes it easy to customize the app's design system.

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: 'var(--accent-color, #2563eb)', // fallback to blue-600
        },
        navbar: {
          light: '#ffffffcc',
          dark: '#18181bcc',
        },
        card: {
          light: '#ffffffcc',
          dark: '#23272fbb',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        float: 'float 3s ease-in-out infinite',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
    },
  },
  plugins: [],
}
