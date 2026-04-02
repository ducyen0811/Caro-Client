/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        galaxy: {
          950: "#050816",
          900: "#0B1120",
          800: "#0F172A",
          700: "#16213E",
          600: "#1F3B73",
          500: "#2957A4",
          400: "#4A7BD0",
          300: "#7CA8F5",
          200: "#B9D1FF",
          100: "#E7F0FF",
        },
        aurora: {
          500: "#55C6FF",
          400: "#7FDBFF",
          300: "#A5EAFF",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(125, 211, 252, 0.14), 0 20px 60px rgba(37, 99, 235, 0.22)",
      },
      backgroundImage: {
        "galaxy-gradient":
          "radial-gradient(circle at top, rgba(96,165,250,0.22), transparent 30%), radial-gradient(circle at 85% 15%, rgba(125,211,252,0.16), transparent 18%), linear-gradient(180deg, #050816 0%, #0B1120 45%, #0F172A 100%)",
      },
    },
  },
  plugins: [],
};