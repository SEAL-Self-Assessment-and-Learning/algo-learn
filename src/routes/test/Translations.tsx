/** Language type for supported languages */
export type Language = "de_DE" | "en_US"

/** Translations type for translations */
export type Translations = {
  [lang in Language]: {
    [key: string]: string
  }
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
  return (lang: Language) => translations[lang][key]
}

/**
 * Returns a t function that maps a key to a translation. The language is fixed
 * at the time of creation, the key can be changed.
 *
 * @param translations The translations to use
 * @param lang The language to translate to
 * @returns A function that maps a key to a translation
 */
export function tFunction(translations: Translations, lang: Language) {
  /**
   * The t function is given a key with optional parameters, and injects the
   * parameters into the translation text.
   *
   * @param key The key to translate
   * @param parameters The parameters to replace in the translation. Parameters
   *   can be either positional (such as {{0}}, {{1}}, etc. or named (such as
   *   {{name}}, {{age}}, etc.).
   * @returns The translated text
   */
  function t(
    key: string,
    parameters: string[] | Record<string, string> = []
  ): string {
    let text = translations[lang][key]
    if (text === undefined) {
      return key
    }
    if (!Array.isArray(parameters)) {
      for (const [key, value] of Object.entries(parameters)) {
        text = text.replace(`{{${key}}}`, value)
      }
    } else {
      for (let i = 0; i < parameters.length; i++) {
        text = text.replace(`{{${i}}}`, parameters[i])
      }
    }
    return text
  }

  return { t }
}
