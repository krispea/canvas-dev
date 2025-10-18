/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{twig,html,js}',
    './templates/**/*.{twig,html}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  safelist: [
    // Text-bg utilities (used dynamically in badge component)
    'text-bg-primary',
    'text-bg-secondary',
    'text-bg-success',
    'text-bg-danger',
    'text-bg-warning',
    'text-bg-info',
    'text-bg-light',
    'text-bg-dark',
  ],
  theme: {
    extend: {
      colors: {
        // Cheppers brand colors
        primary: {
          DEFAULT: '#20b9f5',
          50: '#e8f8fe',
          100: '#d1f1fd',
          200: '#a3e3fb',
          300: '#75d5f9',
          400: '#47c7f7',
          500: '#20b9f5',
          600: '#1a94c4',
          700: '#136f93',
          800: '#0d4a62',
          900: '#062531',
        },
        secondary: {
          DEFAULT: '#1bfcbe',
          50: '#e7fef7',
          100: '#cffdef',
          200: '#9ffbdf',
          300: '#6ff9cf',
          400: '#3ff7bf',
          500: '#1bfcbe',
          600: '#16ca98',
          700: '#109772',
          800: '#0b654c',
          900: '#053226',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
