/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#F2ECDD",
        sandDark: "#E7DEC7",
        ink: "#232019",
        forest: "#2F4A34",
        forestDark: "#1E3324",
        maize: "#D4A017",
        maizeLight: "#EFC94C",
        ember: "#B5502F",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["'Work Sans'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "6px",
      },
    },
  },
  plugins: [],
};
