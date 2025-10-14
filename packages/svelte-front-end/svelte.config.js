import adapter from "@sveltejs/adapter-static"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"
import { BASENAME } from "./src/lib/config.js"

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  kit: {
    prerender: {
      entries: ["*", "/en/about", "/en/legal", "/de/about", "/de/legal"],
      handleHttpError: "warn",
    },
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
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
