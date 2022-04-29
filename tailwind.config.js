const defaultTheme = require('tailwindcss/defaultTheme');

const fontFamily = defaultTheme.fontFamily;
fontFamily['sans'] = ['Outfit', 'system-ui'];
fontFamily['mono'] = ['Roboto Mono', 'system-ui'];

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', "./node_modules/flowbite/**/*.js"],
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class', // or 'media' or 'class'
  variants: {
    extend: {
      borderRadius: ['first', 'last']
    }
  },
  theme: {
    fontFamily: fontFamily, // <-- this is where the override is happening
    extend: {
      animation: {
        bounce200: 'bounce 1s infinite 200ms',
        bounce400: 'bounce 1s infinite 400ms',
        'ping-once': 'ping 800ms 100ms'
      },
      colors: {
        black: {
          DEFAULT: '#272727'
        },
        orange: {
          DEFAULT: '#FF8F00',
          50: '#FFE0B8',
          100: '#FFD7A3',
          200: '#FFC57A',
          300: '#FFB352',
          400: '#FFA129',
          500: '#FF8F00',
          600: '#C77000',
          700: '#8F5000',
          800: '#573100',
          900: '#1F1100'
        }
      }
    }
  },

  plugins: [
    require('flowbite/plugin')
  ]
};
