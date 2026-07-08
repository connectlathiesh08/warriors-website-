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
        burgundy: {
          50: '#fdf2f7',
          100: '#fbe4ee',
          200: '#f7cadc',
          300: '#f0a2c2',
          400: '#e36e9c',
          500: '#8B003A', /* Primary Rotaract Burgundy */
          600: '#78002e',
          700: '#5c0022',
          800: '#400018',
          900: '#26000e',
        }
      },
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
        display: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        premium: "0 8px 30px rgb(0,0,0,0.03)",
        card: "0 10px 40px rgba(0, 0, 0, 0.04)",
      }
    },
  },
  plugins: [],
};
export default config;
