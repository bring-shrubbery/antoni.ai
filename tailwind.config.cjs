const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        alternate: "var(--color-alternate)",
        black: "var(--color-text)",
      },
      backgroundColor: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        alternate: "var(--color-alternate)",
      },
      textColor: {
        default: "var(--color-text)",
        interted: "var(--color-text-inverted)",
      },
      boxShadow: {
        ["default"]: "12px 12px 0px var(--color-shadow)",
        ["default-4"]: "4px 4px 0px var(--color-shadow)",
        ["default-6"]: "6px 6px 0px var(--color-shadow)",
        ["default-8"]: "8px 8px 0px var(--color-shadow)",
      },
    },
  },
  corePlugins: {
    fontSize: false,
  },
  plugins: [require("tailwindcss-fluid-type")],
};
