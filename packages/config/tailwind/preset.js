/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary Colors - Navy Theme
        navy: {
          deep: '#0A1628',
          DEFAULT: '#0F2137',
          medium: '#142240',
          light: '#1A2D4D',
        },
        // Accent Colors - Sunset/Orange
        sunset: {
          DEFAULT: '#F5A623',
          amber: '#FF8C42',
          light: '#FFB84D',
          dark: '#E09000',
        },
        // Secondary Accent - Ocean/Teal
        ocean: {
          DEFAULT: '#4ECDC4',
          light: '#6ED9D2',
          dark: '#3DB8B0',
        },
        // Utility Colors
        sky: {
          blue: '#7EB8DA',
          light: '#A8D1EB',
        },
        pearl: {
          DEFAULT: '#F8FAFC',
          gray: '#E2E8F0',
        },
        warm: {
          gray: '#94A3B8',
          dark: '#64748B',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Source Sans 3', 'sans-serif'],
        ui: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-sunset': 'linear-gradient(135deg, #F5A623 0%, #FF8C42 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #4ECDC4 0%, #7EB8DA 100%)',
        'gradient-navy': 'linear-gradient(180deg, #0A1628 0%, #142240 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0A1628 0%, #1A2D4D 50%, #142240 100%)',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(10, 22, 40, 0.15)',
        'card-hover': '0 8px 30px rgba(10, 22, 40, 0.25)',
        'sunset': '0 4px 20px rgba(245, 166, 35, 0.3)',
        'ocean': '0 4px 20px rgba(78, 205, 196, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

