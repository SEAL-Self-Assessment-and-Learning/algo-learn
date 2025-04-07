import { setLanguage } from "$lib/utils/langState.svelte.ts"
import { redirect } from "@sveltejs/kit"
import { pathnameInLanguage, resolveLang } from "@/lib/translation"
import type { LayoutLoad } from "./$types"

/**
 * Loader for the layout.
 * @param params - The route params. Here: [lang].
 * @param url - The URL object.
 * @returns Data for the current route, mostly:
 * - lang: The language of the current route.
 * - t: The translation function for the current language.
 * - setLang: A function to change the language.
 * - url: The URL object.
 */
export const load: LayoutLoad = ({ params, url }) => {
  let pathname = url.pathname
  if (pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1)
  }
  const lang = params.lang
  const resolvedLang = resolveLang(lang)
  if (lang !== resolvedLang) {
    redirect(307, pathnameInLanguage(resolvedLang, pathname))
  }
  setLanguage(lang)
  return { url }
}
