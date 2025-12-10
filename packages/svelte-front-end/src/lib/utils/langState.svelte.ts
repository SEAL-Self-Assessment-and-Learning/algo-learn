import { DEFAULT_LANGUAGE } from "$lib/translation.ts"
import type { Language } from "@shared/api/Language.ts"

export const langStateSvelte: { lang: Language } = $state({ lang: DEFAULT_LANGUAGE })

export function setLanguage(lang: Language) {
  langStateSvelte["lang"] = lang
}

/**
 * The `toggleLanguage` function toggles the language between "en" and "de".
 *
 * **Only works as long as there are only two supported languages.**
 */
export function toggleLanguage() {
  if (langStateSvelte.lang === "en") {
    langStateSvelte["lang"] = "de"
  } else {
    langStateSvelte["lang"] = "en"
  }
}

export function getLanguage(): Language {
  return langStateSvelte.lang
}
