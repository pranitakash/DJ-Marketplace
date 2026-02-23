/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#333", 
        "accent": "#ffffff",
        "background-light": "#f6f6f8",
        "background-dark": "#050505",
        "surface-dark": "#0a0a0a",
        "surface-border": "#333333",
        "text-main": "#ffffff",
        "text-muted": "#888888",
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #222 1px, transparent 1px), linear-gradient(to bottom, #222 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid-size': '100px 100px',
      }
    },
  },
  plugins: [],
}
