/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0a0e17',
          darker: '#06090e',
          card: '#111827',
          cardHover: '#182234',
          border: '#1f293d',
          accent: '#06b6d4',      // cyan
          accentHover: '#0891b2',
          success: '#10b981',     // emerald
          warning: '#f59e0b',     // amber
          danger: '#ef4444',      // red
          critical: '#dc2626',    // crimson
          muted: '#94a3b8',
          light: '#f1f5f9'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 15px -3px rgba(6, 182, 212, 0.25)',
        'glow-danger': '0 0 15px -3px rgba(239, 68, 68, 0.3)',
        'glow-success': '0 0 15px -3px rgba(16, 185, 129, 0.25)',
      }
    },
  },
  plugins: [],
}
