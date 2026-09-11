/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        body: ["'Plus Jakarta Sans'", "sans-serif"],
        headline: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      spacing: {
        "margin-desktop": "48px",
        "margin-tablet": "24px",
        "margin-mobile": "16px",
        "gutter-desktop": "32px",
        "gutter-tablet": "24px",
        "gutter-mobile": "16px",
        "space-1": "4px",
        "space-2": "8px",
        "space-3": "12px",
        "space-4": "16px",
        "space-6": "24px",
        "space-8": "32px",
        "space-10": "96px",
        "space-12": "48px",
        "space-16": "64px",
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "full": "9999px",
      },
    },
  },
  plugins: [],
};
