import { resolve } from "path"
import { defineConfig } from "vite"
import { sveltekit } from "@sveltejs/kit/vite"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@settings": resolve(__dirname, "../settings"),
      "@shared": resolve(__dirname, "../shared/src"),
    },
  },
})
