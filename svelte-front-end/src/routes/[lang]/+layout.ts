import { goto } from "$app/navigation"
import type { Language } from "@shared/api/Language"
import { tFunction } from "@shared/utils/translations"
import { redirect } from "@sveltejs/kit"
import { globalTranslations, pathnameInLanguage, resolveLang } from "@/lib/translation"
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
  const lang = params.lang
  const resolvedLang = resolveLang(lang)
  if (lang !== resolvedLang) {
    redirect(307, pathnameInLanguage(resolvedLang, url.pathname))
  }
  const setLang = (lang: Language) => {
    goto(pathnameInLanguage(resolveLang(lang), url.pathname))
  }
  return {
    lang,
    t: tFunction(globalTranslations, lang).t,
    setLang,
    url,
  }
}
