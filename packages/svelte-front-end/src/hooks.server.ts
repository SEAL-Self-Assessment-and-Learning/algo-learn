import { readFileSync } from "fs"
import { join } from "path"
import type { Handle } from "@sveltejs/kit"

/**
 * The `handle` function handles the request to the server and during SSR. It sets the lang attribute in the HTML.
 */
export const handle: Handle = async ({ event, resolve }) => {
  const pathname = event.url.pathname

  // Check if the request is for a favicon - handle multiple possible patterns
  // Pattern 1: /favicon/... (direct)
  // Pattern 2: /en/favicon/... or /de/favicon/... (caught by lang route)
  // Pattern 3: /base-path/favicon/... (with base path)
  if (pathname.includes("/favicon/")) {
    // Extract the favicon filename - everything after the last /favicon/
    const faviconMatch = pathname.match(/\/favicon\/([^/]+)\/?$/)

    if (faviconMatch) {
      const filename = faviconMatch[1]
      const filePath = join(process.cwd(), "static", "favicon", filename)

      try {
        const file = readFileSync(filePath)
        const ext = filename.split(".").pop()
        const contentTypes: Record<string, string> = {
          png: "image/png",
          svg: "image/svg+xml",
          ico: "image/x-icon",
          webmanifest: "application/manifest+json",
        }

        return new Response(file, {
          headers: {
            "Content-Type": contentTypes[ext || ""] || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000",
          },
        })
      } catch (e) {
        console.error(`Failed to load favicon: ${filename}`, e)
        // Return 404
        return new Response("Not found", { status: 404 })
      }
    }
  }

  // Handle language
  const lang = pathname.startsWith("/de") ? "de" : "en"
  return resolve(event, { transformPageChunk: ({ html }) => html.replace("%lang%", lang) })
}
