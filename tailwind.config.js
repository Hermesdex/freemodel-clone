/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'fm-bg': '#0a0a0a',
        'fm-surface': '#141414',
        'fm-surface-hover': '#1c1c1c',
        'fm-border': '#2a2a2a',
        'fm-text': '#ffffff',
        'fm-text-muted': '#888888',
        'fm-text-dim': '#666666',
        'fm-green': '#00e57a',
        'fm-green-dim': '#00b863',
        'fm-blue': '#3b82f6',
        'fm-red': '#ef4444',
        'fm-amber': '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
