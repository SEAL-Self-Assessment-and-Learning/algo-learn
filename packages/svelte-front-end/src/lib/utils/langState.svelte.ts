import type { Language } from "@shared/api/Language.ts"

export const langStateSvelte: { lang: Language } = $state({ lang: "en" })

export function setLanguage(lang: Language) {
  langStateSvelte["lang"] = lang
}

export function getLanguage(): Language {
  return langStateSvelte.lang
}
