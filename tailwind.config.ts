import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10141E",
        paper: "#F6F8FC",
        accent: "#FF6B4A",
        mint: "#5CD1B3",
      },
      boxShadow: {
        soft: "0 10px 35px rgba(16, 20, 30, 0.10)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
