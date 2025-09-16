// javascript
const cgCount = 8
const cgFillClasses = Array.from({ length: cgCount }, (_, i) => `fill-cg-${i}`)

module.exports = {
  content: ["./src/**/*.{svelte,js,ts}", "./packages/svelte-front-end/src/**/*.{svelte,js,ts}"],
  safelist: [
    ...cgFillClasses,
    "fill-primary",
    "fill-primary-foreground",
    "fill-cg-foreground",
    "group-hover:fill-accent",
    "stroke-secondary",
    "cursor-pointer",
  ],
  theme: {
    extend: {
      colors: {
        cg: {
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
    },
  },
  plugins: [],
}
