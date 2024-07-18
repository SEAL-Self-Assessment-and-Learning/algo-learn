/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./front-end/src/**/*.{html,js,ts,jsx,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        goethe: {
          DEFAULT: "hsl(var(--goethe))",
          foreground: "hsl(var(--goethe-foreground))",
        },
        // color groups, used wherever items need to be separated by color.
        cg:{
          foreground: "hsl(var(--color-group-foreground))",
          0: "var(--color-group-0)",
          1: "var(--color-group-1)",
          2: "var(--color-group-2)",
          3: "var(--color-group-3)",
          4: "var(--color-group-4)",
          5: "var(--color-group-5)",
          6: "var(--color-group-6)",
          7: "var(--color-group-7)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  safelist: [
    {
      // These classes are assigned dynamically, so tailwind thinks they are not used and removes them from the css file.
      pattern: /(fill|stroke)-(cg|primary|secondary)(-([0-7]|foreground))?/,
    },
  ],
  future: {
    hoverOnlyWhenSupported: true
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
}
