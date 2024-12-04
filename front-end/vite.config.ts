import { resolve } from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@settings": resolve(__dirname, "../settings"),
      "@shared": resolve(__dirname, "../shared/src"),
    },
  },
})
