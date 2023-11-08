import { use } from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import {
  initReactI18next,
  Trans as TransI18Next,
  useTranslation as useTranslationsI18Next,
} from "react-i18next"

import { Language } from "../../../shared/src/api/Language"
import de from "../locales/de.json"
import en from "../locales/en.json"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useEffect } from "react"

export const SUPPORTED_LANGUAGES: Array<Language> = ["en", "de"]
export const DEFAULT_LANGUAGE: Language = window.navigator.language.startsWith(
  "de",
)
  ? "de"
  : "en"
export const NATIVE_NAME: Record<Language, string> = {
  en: "English",
  de: "Deutsch",
}

void use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: SUPPORTED_LANGUAGES,
    debug: false,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
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
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const obj = useTranslationsI18Next()
  const params = useParams()
  const lang: Language =
    params["lang"] && (params["lang"] == "en" || params["lang"] == "de")
      ? params["lang"]
      : DEFAULT_LANGUAGE

  useEffect(() => {
    if (lang !== obj.i18n.resolvedLanguage) void obj.i18n.changeLanguage(lang)
  }, [lang, obj.i18n, obj.i18n.resolvedLanguage])

  function setLang(newLang: Language) {
    if (lang !== newLang) {
      const regex = new RegExp(`^/(${SUPPORTED_LANGUAGES.join("|")})`)
      const newPath = pathname.replace(regex, `/${newLang}`)
      navigate(newPath)
    }
  }
  function nextLang() {
    const currentIndex = SUPPORTED_LANGUAGES.indexOf(lang)
    const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length
    setLang(SUPPORTED_LANGUAGES[nextIndex])
  }
  return { ...obj, lang, setLang, nextLang }
}

export const Trans = TransI18Next
