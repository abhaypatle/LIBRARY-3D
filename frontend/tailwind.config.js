/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7ff',
          100: '#e7edff',
          200: '#d4e0ff',
          300: '#b1c7ff',
          400: '#7ea3ff',
          500: '#4f7bff',
          600: '#2b5be1',
          700: '#1b46ba',
          800: '#183e9f',
          900: '#18357f'
        }
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.05), 0 20px 50px rgba(79,123,255,0.25)'
      }
    }
  },
  plugins: []
};
