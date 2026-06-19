/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      xs: "380px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      landscape: { raw: "(orientation: landscape) and (max-height: 520px)" },
    },
    extend: {
      colors: {
        correct: "#538d4e",
        present: "#b59f3b",
        absent: "#3a3a3c",
        key: "#818384",
        surface: "#1a1a2e",
        panel: "#16213e",
        accent: "#e94560",
      },
      fontFamily: {
        sans: ["Segoe UI", "system-ui", "-apple-system", "sans-serif"],
      },
      minHeight: {
        dvh: "100dvh",
      },
    },
  },
  plugins: [],
};
