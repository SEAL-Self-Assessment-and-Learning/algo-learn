import {
  initReactI18next,
  useTranslation as useTranslationsI18Next,
  Trans as TransI18Next,
} from "react-i18next"
import { Language } from "../../../shared/src/api/QuestionGenerator"
import { use } from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import de from "../locales/de.json"
import en from "../locales/en.json"

void use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: { translation: en },
      de: { translation: de },
    },
  })

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

export const Trans = TransI18Next
