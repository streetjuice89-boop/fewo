/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy': {
          deep: '#0A1628',
          medium: '#142240',
          light: '#2A3B5B',
        },
        'sunset': {
          orange: '#F5A623',
          amber: '#FF8C42',
        },
        'ocean': {
          teal: '#4ECDC4',
        },
        'sky': {
          blue: '#7EB8DA',
        },
        'pearl': '#F8FAFC',
        'warm-gray': '#94A3B8',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Source Sans 3"', 'sans-serif'],
        ui: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}



