/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#080d08',
          surface: '#0f1710',
          border: '#1b2e1e',
          muted: '#3b523e',
          text: '#c8e6c9',
          green: {
            DEFAULT: '#00ff66',
            bright: '#33ff77',
            dim: '#00aa44',
            glow: 'rgba(0, 255, 102, 0.4)',
          },
          amber: {
            DEFAULT: '#ffb000',
            bright: '#ffc233',
            dim: '#cc8c00',
            glow: 'rgba(255, 176, 0, 0.4)',
          },
          cyan: {
            DEFAULT: '#00f3ff',
            dim: '#0099aa',
          },
          danger: '#ff4444',
        },
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
        display: ['"VT323"', 'monospace'],
      },
      boxShadow: {
        'phosphor-green': '0 0 15px rgba(0, 255, 102, 0.35), 0 0 3px rgba(0, 255, 102, 0.8)',
        'phosphor-amber': '0 0 15px rgba(255, 176, 0, 0.35), 0 0 3px rgba(255, 176, 0, 0.8)',
        'crt-inset': 'inset 0 0 80px rgba(0, 0, 0, 0.8)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker': 'flicker 0.15s infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      },
    },
  },
  plugins: [],
};
