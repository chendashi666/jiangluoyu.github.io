/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        paper: "#F4ECD8",
        paperDeep: "#E8DEC2",
        ink: "#2B2B2B",
        inkSoft: "#5A5550",
        stamp: "#C73E3A",
        bamboo: "#6B8E7F",
        card: "#FBF6E9",
        phone: "#1C1C1E",
        phoneScreen: "#F2EAD3",
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"Noto Sans SC"', "sans-serif"],
        stamp: ['"ZCOOL XiaoWei"', "serif"],
      },
      boxShadow: {
        card: "0 2px 0 rgba(43,43,43,0.06), 0 8px 18px -8px rgba(43,43,43,0.25)",
        cardHover: "0 4px 0 rgba(43,43,43,0.08), 0 16px 28px -10px rgba(43,43,43,0.35)",
        phone: "0 30px 60px -20px rgba(0,0,0,0.55), 0 0 0 2px rgba(0,0,0,0.5) inset",
      },
      keyframes: {
        cardIn: {
          "0%": { transform: "rotate(-6deg) translateY(12px) scale(0.92)", opacity: "0" },
          "100%": { transform: "rotate(-2deg) translateY(0) scale(1)", opacity: "1" },
        },
        bubbleIn: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        flipCard: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(180deg)" },
        },
        stampPress: {
          "0%": { transform: "scale(1.6) rotate(-12deg)", opacity: "0" },
          "60%": { transform: "scale(0.9) rotate(-2deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-3deg)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        cardIn: "cardIn 0.45s cubic-bezier(0.22,1,0.36,1) both",
        bubbleIn: "bubbleIn 0.32s ease-out both",
        stampPress: "stampPress 0.5s ease-out both",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};
