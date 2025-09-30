import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./src/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./src/@Client/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./src/@Client/Components/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./node_modules/ndui-ahrom/**/*.{js,ts,jsx,tsx}", // این خط را اضافه کن!
    "./node_modules/ndui-ahrom/src/**/*.{js,ts,jsx,tsx}", // این خط را اضافه کن!
    "./node_modules/ndui-ahrom/dist/**/*.{js,ts,jsx,tsx}", // این خط را اضافه کن!
  ],
  safelist: [
    "text-xs",
    "text-md",
    "text-lg",
    "text-xl",
    "text-2xl",
    "text-3xl",
    "text-4xl",
    "text-primary",
    "text-accent",
    "text-secondary",
    "text-warning",
    "text-success",
    "text-neutral",
    "text-info",
    "border-primary",
    "border-accent",
    "border-secondary",
    "border-warning",
    "border-success",
    "border-neutral",
    "border-info",
    "border-xs",
    "border-sm",
    "border-md",
    "border-lg",
    "border-xl",
    "border-2xl",
    "bg-primary",
    "bg-accent",
    "bg-secondary",
    "bg-warning",
    "bg-success",
    "bg-neutral",
    "bg-info",
    "alert-primary",
    "alert-accent",
    "alert-secondary",
    "alert-warning",
    "alert-success",
    "alert-neutral",
    "alert-info",
    "alert",
    "badge-primary",
    "badge-accent",
    "badge-secondary",
    "badge-warning",
    "badge-success",
    "badge-neutral",
    "badge-info",
    "badge",
  ],
  theme: {
    extend: {},
  },

  // daisyUI config (optional - here are the default values)
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#00796B",
          accent: "#C8B575",
          secondary: "#9EFFFF",
          warning: "#FFD63B",
          success: "#A8FFFF",
          neutral: "#607D8B",
          info: "#64B5F6",
          "primary-content": "#FFFFFF",
          "info-content": "#FFFFFF",
          "accent-content": "#3E2723",
          "secondary-content": "#004D40",
          "warning-content": "#795548",
          "success-content": "#004D40",
          "neutral-content": "#ECEFF1",
          "primary-focus": "#00574B",
          "base-100": "#ECEFF1",
          "base-200": "#CFD8DC",
          "base-300": "#B0BEC5",
        },
      },
      "dark",
    ], // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
    darkTheme: "light", // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ":root", // The element that receives theme color CSS variables
  },
  plugins: [require("daisyui")],
} satisfies Config;
