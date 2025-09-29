// tailwind.config.cjs
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{svelte,js,ts}", "./packages/svelte-front-end/src/**/*.{svelte,js,ts}"],
  safelist: [
    "fill-cg-0",
    "fill-cg-1",
    "fill-cg-2",
    "fill-cg-3",
    "fill-cg-4",
    "fill-cg-5",
    "fill-cg-6",
    "fill-cg-7",
    "fill-cg-foreground",
    "fill-primary",
    "fill-accent",
    "fill-primary-foreground",
    "fill-accent-foreground",
    "stroke-cg-0",
    "stroke-cg-1",
    "stroke-cg-2",
    "stroke-cg-3",
    "stroke-cg-4",
    "stroke-cg-5",
    "stroke-cg-6",
    "stroke-cg-7",
    "stroke-cg-foreground",
    "stroke-primary",
    "stroke-accent",
    "stroke-primary-foreground",
    "stroke-accent-foreground",
    "stroke-secondary",
    "cursor-pointer",
  ],
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      fill: ["group-hover", "dark"], // generates dark + group-hover combinations
    },
  },
  plugins: [],
}
