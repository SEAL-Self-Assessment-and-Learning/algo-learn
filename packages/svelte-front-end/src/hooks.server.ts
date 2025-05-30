import type { Handle } from "@sveltejs/kit"

/**
 * The `handle` function handles the request to the server and during SSR. It sets the lang attribute in the HTML.
 */
export const handle: Handle = async ({ event, resolve }) => {
  const lang = event.url.pathname.startsWith("/de") ? "de" : "en"
  return resolve(event, { transformPageChunk: ({ html }) => html.replace("%lang%", lang) })
}
