import { browser } from "$app/environment"
import { type Language } from "@shared/api/Language"
import { type Translations } from "@shared/utils/translations"
import deJSON from "../../../front-end/src/locales/de.json"
import enJSON from "../../../front-end/src/locales/en.json"

export const SUPPORTED_LANGUAGES: ReadonlyArray<Language> = ["en", "de"]
export const DEFAULT_LANGUAGE: Language =
  browser && window.navigator.language.startsWith("de") ? "de" : "en"
export const NATIVE_NAME = {
  en: "English",
  de: "Deutsch",
}

export const globalTranslations: Translations = {
  en: enJSON,
  de: deJSON,
}

/**
 * The `resolveLang` function resolves the language to use.
 * @param lang The language to use.
 * @returns The resolved language.
 */
export function resolveLang(lang: string) {
  if ((SUPPORTED_LANGUAGES as string[]).includes(lang)) {
    return lang as Language
  } else {
    return DEFAULT_LANGUAGE
  }
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

/**
 * The `pathnameInLanguage` function switches the language in the pathname.
 * @param lang The language to switch to.
 * @param pathname The pathname to switch the language in.
 * @returns The new pathname with the language switched.
 */
export function pathnameInLanguage(lang: Language, pathname: string) {
  const newPathname = pathname.replace(/^\/[a-zA-Z0-9]*(\/|$)/, "/")
  return `/${lang}${newPathname}`
}
