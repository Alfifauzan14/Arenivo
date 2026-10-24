/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../shared/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "400px",
        tablet: "600px", // Tablet Portrait / Foldable (Medium standard: 600px - 840px)
        expanded: "840px", // Tablet Landscape / Desktop (Expanded standard: >840px)
      },
      colors: {
        // Sporty Crimson Red Brand Colors (desain.md)
        brand: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626", // Primary Red (CTA Utama)
          700: "#B91C1C", // Primary Red Hover
          800: "#991B1B", // Hero & Header Banner
          900: "#7F1D1D",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans Variable", "Plus Jakarta Sans", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["Plus Jakarta Sans Variable", "Plus Jakarta Sans", "sans-serif"],
      },
      boxShadow: {
        clean: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        card: "0 2px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
