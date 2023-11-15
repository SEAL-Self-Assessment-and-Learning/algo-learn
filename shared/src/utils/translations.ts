import { Language } from "../api/Language"
import { format } from "./format"

/** Type for keys in translations objects */
export type TKey = string

/** Translation objects are not nested */
export type Translations = Readonly<{
  [lang in Language]: {
    [key: TKey]: string
  }
}>

/** DeepTranslation objects may contain strings or lists of strings */
export type DeepTranslations = Readonly<{
  [lang in Language]: {
    [key: TKey]: string | string[]
  }
}>

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
function t(
  translations: Translations | ReadonlyArray<Translations>,
  lang: Language,
  key: TKey,
  parameters?: TFunctionParameters,
): string
function t(
  translations: DeepTranslations | ReadonlyArray<DeepTranslations>,
  lang: Language,
  key: TKey,
  parameters?: TFunctionParameters,
): string | string[]
function t(
  translations: DeepTranslations | ReadonlyArray<DeepTranslations>,
  lang: Language,
  key: TKey,
  parameters?: TFunctionParameters,
): string | string[] {
  const translationsArray: ReadonlyArray<DeepTranslations> = Array.isArray(
    translations,
  )
    ? translations
    : [translations]
  for (const tr of translationsArray) {
    if (lang in tr && key in tr[lang]) {
      return format(tr[lang][key], parameters)
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
 * at the time of creation, the key can be changed.
 *
 * @param translations The translations to use
 * @param lang The language to translate to
 * @returns A function that maps a key to a translation
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
    t: (key: TKey, parameters?: TFunctionParameters) =>
      t(translations, lang, key, parameters),
  }
}
