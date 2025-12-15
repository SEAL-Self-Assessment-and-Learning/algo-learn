import { spawnSync } from "node:child_process"
import { resolve } from "path"
import { defineConfig } from "vite"
import devtoolsJson from "vite-plugin-devtools-json"
import { sveltekit } from "@sveltejs/kit/vite"
import tailwindcss from "@tailwindcss/vite"

function svelteKitSyncPlugin() {
  return {
    name: "svelte-kit-sync",
    async configResolved() {
      // Run svelte-kit sync before the build starts
      const result = spawnSync("svelte-kit", ["sync"], { stdio: "inherit" })
      if (result.status !== 0) {
        throw new Error(`svelte-kit sync failed with status ${result.status}`)
      }
    },
  }
}

export default defineConfig({
  plugins: [svelteKitSyncPlugin(), tailwindcss(), sveltekit(), devtoolsJson()],
  ssr: {
    noExternal: ["@lucide/svelte"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@settings": resolve(__dirname, "../settings"),
      "@shared": resolve(__dirname, "../shared/src"),
    },
  },
})
