import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/templates/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcdaff",
          300: "#8ec2ff",
          400: "#589eff",
          500: "#2f78ff",
          600: "#1857f5",
          700: "#1444e0",
          800: "#1738b5",
          900: "#18348f",
          950: "#0f1e57",
        },
        accent: {
          DEFAULT: "#00c2a8",
          light: "#5be8d4",
          dark: "#009d87",
        },
        luxflag: {
          red: "#ED2939",
          white: "#FFFFFF",
          blue: "#00A1DE",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #0f1e57 0%, #1444e0 55%, #00c2a8 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
