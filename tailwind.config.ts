import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  darkMode: ['variant', '&:not(.light *)'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"system-ui"', 'sans-serif']
      },
      backgroundImage: {
        'hero': "url('/bg.png')",
      }
    },
  },
  plugins: [],
} satisfies Config;
