import type { Config } from "tailwindcss";

const config: Config = {
  content:[
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cream: "#F4F1EA",
          gold: "#C5A059",
          black: "#1A1A1A",
          light: "#FDFBF7",
          camel: "#B29071", 
        }
      },
      fontFamily: {
        serif:['var(--font-playfair)'],
        sans: ['var(--font-montserrat)'],
      }
    },
  },
  plugins:[],
};
export default config;