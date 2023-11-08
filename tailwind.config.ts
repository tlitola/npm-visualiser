import type { Config } from "tailwindcss";

const config: Config = {
  prefix: "tw-",
  corePlugins: {
    preflight: false,
  },
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
        dots: {
          to: {
            width: "40px",
          },
        },
      },
      animation: {
        highlight: "highlight 1500ms ease-out",
        dots: "dots steps(4, end) 2000ms infinite",
      },
    },
  },
  plugins: [],
};
export default config;
