import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-open-sans)"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        highlight: {
          "0%": {
            backgroundColor: "rgb(125, 211, 252)",
            backgroundOpacity: "0",
          },
          "50%": { backgroundOpacity: "1" },
          "99%": { backgroundOpacity: "0" },
          "100%": { backgroundColor: "initial", backgroundOpacity: "initial" },
        },
      },
      animation: {
        highlight: "highlight 1500ms ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
