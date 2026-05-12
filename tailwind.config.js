export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1E3A5F',
          cyan: '#00B4D8',
        },
        category: {
          'sangat-hoaks': '#DC2626',
          'hoaks': '#EA580C',
          'verifikasi': '#D97706',
          'valid': '#16A34A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'bar-fill': 'barFill 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 1.5s ease-in-out infinite',
      },
      keyframes: {
        barFill: {
          from: { width: '0%' },
          to: { width: 'var(--bar-width)' }
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' }
        },
      },
    },
  },
  plugins: [],
}