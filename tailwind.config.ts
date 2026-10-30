import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#F3F6FC",
          100: "#E8ECF7",
          500: "#3D55A0",
          700: "#273E81",
          900: "#1B2A5E"
        },
        slate: {
          500: "#64748B"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 2px rgba(27,42,94,0.06), 0 8px 24px rgba(27,42,94,0.06)"
      }
    }
  },
  plugins: []
} satisfies Config;
