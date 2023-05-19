import { useTranslation as useTranslationsI18Next } from "react-i18next"
import { Language } from "../utils/translations"

/**
 * API-compatible shim for `useTranslation` that also returns the language.
 *
 * @returns The translation functions
 */
export function useTranslation() {
  const obj = useTranslationsI18Next()
  const lang: Language = obj.i18n.language === "de" ? "de_DE" : "en_US"
  return { ...obj, lang }
}
