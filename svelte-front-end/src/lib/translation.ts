import { browser } from "$app/environment"
import { goto } from "$app/navigation"
import { type Language } from "@shared/api/Language"
import { tFunction, type Translations } from "@shared/utils/translations"
import { redirect } from "@sveltejs/kit"
import deJSON from "../../../front-end/src/locales/de.json"
import enJSON from "../../../front-end/src/locales/en.json"

export const SUPPORTED_LANGUAGES: ReadonlyArray<Language> = ["en", "de"]
export const DEFAULT_LANGUAGE: Language =
  browser && window.navigator.language.startsWith("de") ? "de" : "en"
export const NATIVE_NAME = {
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
  if ((SUPPORTED_LANGUAGES as string[]).includes(lang)) {
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
export function i18n(lang: string, additionalTranslations: ReadonlyArray<Translations> = []) {
  const l: Language = resolveLang(lang)
  return { lang: l, ...tFunction([globalTranslations, ...additionalTranslations], l) }
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

/**
 * The `loadI18n` function loads the translation for the given language.
 * If the language is not supported, it redirects to the default language.
 * @param lang The language to load the translation for.
 * @param url The URL object.
 * @returns The translation object.
 */
export function loadI18n(lang: string, url: URL) {
  const resolvedLang = resolveLang(lang)
  if (lang !== resolvedLang) {
    redirect(307, pathnameInLanguage(resolvedLang, url.pathname))
  }
  const setLang = (lang: Language) => {
    goto(pathnameInLanguage(lang, url.pathname))
  }
  return { ...i18n(resolvedLang), setLang, url }
}
