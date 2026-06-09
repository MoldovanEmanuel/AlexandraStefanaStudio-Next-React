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
        bg: {
          DEFAULT: "#0f0b09",
          lighter: "#1a1310",
          card: "#1e1612",
        },
        accent: {
          DEFAULT: "#c9a96e",
          dark: "#a8895a",
          light: "#e0c896",
          muted: "rgba(201,169,110,0.15)",
        },
        text: {
          primary: "#e8d5b7",
          secondary: "#b09070",
          muted: "#795c42",
          faint: "#4a3728",
        },
        border: {
          DEFAULT: "rgba(201,169,110,0.2)",
          strong: "rgba(201,169,110,0.4)",
        },
      },
      fontFamily: {
        display: ["var(--font-league-gothic)", "Impact", "sans-serif"],
        body: ["var(--font-montserrat)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem,8vw,7rem)", { lineHeight: "0.95" }],
        "display-lg": ["clamp(2.5rem,6vw,5rem)", { lineHeight: "1" }],
        "display-md": ["clamp(1.75rem,4vw,3.5rem)", { lineHeight: "1.05" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-overlay":
          "linear-gradient(to bottom, rgba(15,11,9,0) 40%, rgba(15,11,9,0.7) 70%, rgba(15,11,9,1) 100%)",
        "card-overlay":
          "linear-gradient(to top, rgba(15,11,9,0.9) 0%, rgba(15,11,9,0.4) 50%, transparent 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.7s ease-out forwards",
        "slide-in-left": "slideInLeft 0.6s ease-out forwards",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
      },
      boxShadow: {
        gold: "0 0 30px rgba(201,169,110,0.15)",
        "gold-sm": "0 0 15px rgba(201,169,110,0.1)",
        "gold-lg": "0 0 60px rgba(201,169,110,0.2)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
      },
      aspectRatio: {
        "4/3": "4 / 3",
        "3/4": "3 / 4",
        "16/10": "16 / 10",
      },
    },
  },
  plugins: [],
};

export default config;
