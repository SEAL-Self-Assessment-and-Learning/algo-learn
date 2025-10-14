import adapter from "@sveltejs/adapter-static"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"
import { BASENAME } from "./src/lib/config.js"

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    prerender: {
      entries: ["*", "/en/about", "/en/legal", "/de/about", "/de/legal"],
      handleHttpError: ({ path, referrer, message }) => {
        void referrer
        // Ignore favicon errors during prerender - they're handled by hooks
        if (path.includes("/favicon/")) {
          return
        }
        throw new Error(message)
      },
    },
    adapter: adapter({
      pages: "build",
      fallback: "index.html",
    }),
    paths: {
      base: BASENAME,
    },
    alias: {
      "@/*": "./src/*",
      "@shared/*": "./../shared/src/*",
      "@settings/*": "./../settings/*",
    },
  },
  build: {
    bundleStrategy: "single",
  },
}

export default config
