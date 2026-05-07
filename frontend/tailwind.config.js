/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#0f172a",
          slate: "#1e293b",
          mist: "#e2e8f0",
          mint: "#14b8a6",
          amber: "#f59e0b",
          rose: "#fb7185",
        },
      },
      boxShadow: {
        soft: "0 24px 48px rgba(15, 23, 42, 0.14)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(20,184,166,0.15), transparent 32%), radial-gradient(circle at bottom right, rgba(245,158,11,0.12), transparent 28%)",
      },
    },
  },
  plugins: [],
};
