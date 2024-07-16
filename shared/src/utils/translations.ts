import { Language } from "../api/Language"
import { format } from "./format"

/** Type for keys in translations objects */
export type TKey = string

/**
 * SingleTranslation stores the translations of an individual term
 *
 * Example:
 * const translation: SingleTranslation = { de: "translation1", en: "translation2" }
 */
export type SingleTranslation = Readonly<Partial<Record<Language, string>>>

/**
 * Translations store the translations for each language and key.
 *
 * Example:
 * const translations: Translations = {
 *  de: { key1: "translation1", key2: "translation2" },
 *  en: { key1: "translation1", key2: "translation2" },
 * }
 */
export type Translations = Readonly<Partial<Record<Language, Readonly<Record<TKey, string>>>>>

/**
 * DeepTranslation objects may contain strings or lists of strings
 *
 * Example:
 * const deepTranslations: DeepTranslations = {
 *   de: { key1: "translation1", key2: ["translation2", "translation3"] },
 *   en: { key1: "translation1", key2: ["translation2", "translation3"] },
 * }
 */
export type DeepTranslations = Readonly<
  Partial<Record<Language, Readonly<Record<TKey, string | string[]>>>>
>

/** Type for optional parameters of the t function */
export type TFunctionParameters = string[] | Readonly<Record<string, string>>

/**
 * The global t function is given a translation object, a language, a key, and
 * optional parameters. It looks up the translation text and formats the
 * parameters with the translation text.
 *
 * @param translations The translations to use
 * @param lang The language to translate to
 * @param key The key to translate
 * @param parameters The parameters to replace in the translation. Parameters
 *   can be either positional (such as {{0}}, {{1}}, etc. or named (such as
 *   {{name}}, {{age}}, etc.).
 * @returns The translated text
 */
export function t(
  translations: Translations | ReadonlyArray<Translations>,
  lang: Language,
  key: TKey,
  parameters?: TFunctionParameters,
): string
export function t(
  translations: DeepTranslations | ReadonlyArray<DeepTranslations>,
  lang: Language,
  key: TKey,
  parameters?: TFunctionParameters,
): string | string[]
export function t(
  translations: DeepTranslations | ReadonlyArray<DeepTranslations>,
  lang: Language,
  key: TKey,
  parameters?: TFunctionParameters,
): string | string[] {
  const translationsArray: ReadonlyArray<DeepTranslations> = Array.isArray(translations)
    ? translations
    : [translations]
  const fallback: Language = lang === "en" ? "de" : "en"
  for (const l of [lang, fallback]) {
    for (const tr of translationsArray) {
      const trl = tr[l]
      if (trl && trl[key] !== undefined) {
        return format(trl[key], parameters)
      }
    }
  }
  return key
}

/**
 * Returns a function that maps a key to a translation. The key is fixed at the
 * time of creation, the language can be changed.
 *
 * @param translations The translations to use
 * @param key The key to translate
 * @returns A function that maps a language to a translation
 */
export function tFunctional(translations: Translations, key: string) {
  return (lang: Language) => t(translations, lang, key)
}

/**
 * Returns a t function that maps a key to a translation. The language is fixed
 * at the time of creation, the key (and parameters) can be changed.
 *
 * @param translations The translations to use
 * @param lang The language to translate to
 * @returns A function that maps a key (and parameters) to a translation
 */
export function tFunction(
  translations: Translations | ReadonlyArray<Translations>,
  lang: Language,
): { t: (key: TKey, parameters?: TFunctionParameters) => string }
export function tFunction(
  translations: DeepTranslations | ReadonlyArray<DeepTranslations>,
  lang: Language,
): { t: (key: TKey, parameters?: TFunctionParameters) => string | string[] }
export function tFunction(
  translations: DeepTranslations | ReadonlyArray<DeepTranslations>,
  lang: Language,
) {
  return {
    t: (key: TKey, parameters?: TFunctionParameters) => t(translations, lang, key, parameters),
  }
}

/**
 * Checks if lang is supported by translations. If not it try the fallback languages "en" and "de" (in that order).
 * Throws an error if no supported language is found.

 * @param lang
 * @param translations
 * @returns A Language supported by the given translations object.
 */
export function getValidLanguage(
  lang: Language,
  translations: DeepTranslations,
): keyof typeof translations {
  for (const l of [lang, "en", "de"] as Language[]) {
    if (translations[l] !== undefined) {
      return l
    }
  }

  throw new Error(`No translation for language ${lang} and no valid fallback.`)
}
