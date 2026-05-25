import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF5B22",
          50: "#FFF3ED",
          100: "#FFE3D1",
          200: "#FFC3A3",
          300: "#FF9A6A",
          400: "#FF6B2E",
          500: "#FF5B22",
          600: "#E84F1C",
          700: "#CC4108",
          800: "#A3330A",
          900: "#822A0E",
        },
        surface: {
          DEFAULT: "#F4F4F5",
          50: "#FAFAFA",
          100: "#F4F4F5",
          200: "#E8E8E8",
          300: "#E0E0E0",
          400: "#BDBDBD",
        },
        dark: {
          DEFAULT: "#1A1A1A",
          50: "#2A2A2A",
          100: "#333333",
          200: "#404040",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 12px -4px rgba(0,0,0,0.05)",
        "card-hover": "0 8px 24px -8px rgba(0,0,0,0.1)",
        sidebar: "1px 0 4px rgba(0,0,0,0.04)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
