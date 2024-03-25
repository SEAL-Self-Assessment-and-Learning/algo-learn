import { useEffect } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import deQuestionGroupJSON from "../../../settings/question-group-locales/de.json"
import enQuestionGroupJSON from "../../../settings/question-group-locales/en.json"
import { Language } from "../../../shared/src/api/Language"
import { tFunction, Translations } from "../../../shared/src/utils/translations"
import deJSON from "../locales/de.json"
import enJSON from "../locales/en.json"

export const SUPPORTED_LANGUAGES: ReadonlyArray<Language> = ["en", "de"]
export const DEFAULT_LANGUAGE: Language = window.navigator.language.startsWith("de") ? "de" : "en"
export const NATIVE_NAME: Readonly<Record<Language, string>> = {
  en: "English",
  de: "Deutsch",
}

const globalTranslations: Translations = {
  en: { ...enJSON, ...enQuestionGroupJSON },
  de: { ...deJSON, ...deQuestionGroupJSON },
}

/**
 * The `useTranslation` hook detects the current language from the URL, returns the translation function, and allows to change the language.
 *
 * @param additionalTranslations If provided, Additional translations to use (they have priority)
 *
 * @returns An object containing the translation function, the current language, and functions to change the language.
 */
export function useTranslation(additionalTranslations?: Translations) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const lang: Language =
    params["lang"] && (SUPPORTED_LANGUAGES as Array<string>).includes(params["lang"])
      ? (params["lang"] as Language)
      : DEFAULT_LANGUAGE

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

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

  const translations: ReadonlyArray<Translations> = Array.isArray(additionalTranslations)
    ? [...additionalTranslations, globalTranslations]
    : additionalTranslations
      ? [additionalTranslations, globalTranslations]
      : [globalTranslations]
  const t = tFunction(translations, lang).t
  return { t, lang, setLang, nextLang }
}
