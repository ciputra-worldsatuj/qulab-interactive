/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",
    "./public/**/*.html",
    "./public/**/*.js",
    "./src/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#5B3FD1',
          hover: '#4A31B0'
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1C1B29'
        },
        canvas: {
          DEFAULT: '#F7F7FB',
          dark: '#0F0E17'
        },
        font: {
          base: '#1B1B2F',
          muted: '#5A5A72',
          dark: '#FFFFFE',
          'dark-muted': '#A7A9BE'
        },
        border: {
          DEFAULT: '#DADAE6',
          dark: '#2E2D3D'
        },
        status: {
          success: '#1F8A57',
          error: '#C93A40',
          warning: '#8F5F0A',
          info: '#2F4FC7'
        },
        opt: {
          a: '#C93A40',
          b: '#2F4FC7',
          c: '#F5A524',
          d: '#1F8A57'
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif']
      },
      borderRadius: {
        'card': '12px',
        'lg-card': '16px'
      }
    }
  },
  plugins: []
};
