import { browser } from "$app/environment"
import { type Language } from "@shared/api/Language"
import { tFunction, type Translations } from "@shared/utils/translations"
import deJSON from "../../../front-end/src/locales/de.json"
import enJSON from "../../../front-end/src/locales/en.json"

export const SUPPORTED_LANGUAGES: ReadonlyArray<Language> = ["en", "de"]
export const DEFAULT_LANGUAGE: Language =
  browser && window.navigator.language.startsWith("de") ? "de" : "en"
export const NATIVE_NAME: Readonly<Record<Language, string>> = {
  en: "English",
  de: "Deutsch",
}

const globalTranslations: Translations = {
  en: enJSON,
  de: deJSON,
}

/**
 * The `resolveLang` function resolves the language to use.
 * @param lang The language to use.
 * @returns The resolved language.
 */
export function resolveLang(lang: string) {
  if (SUPPORTED_LANGUAGES.includes(lang as Language)) {
    return lang as Language
  } else {
    return DEFAULT_LANGUAGE
  }
}

/**
 * The `i18n` function resolves the language to use and returns the translation function.
 *
 * @param lang The language to use.
 * @returns An object containing the translation function and the current language.
 */
export function i18n(lang: string) {
  const l: Language = resolveLang(lang)
  return { lang: l, ...tFunction(globalTranslations, l) }
}

/**
 * The `nextLang` function returns the next language in the list of supported languages.
 * @param lang The current language.
 * @returns The next language in the list of supported languages.
 */
export function nextLang(lang: Language) {
  const currentIndex = SUPPORTED_LANGUAGES.indexOf(lang)
  const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length
  return SUPPORTED_LANGUAGES[nextIndex]
}
