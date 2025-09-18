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
