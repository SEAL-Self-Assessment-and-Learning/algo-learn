import { FunctionComponent, ReactNode } from "react"

export type Translations = {
  [lang in Language]: {
    [key: string]: string
  }
}

// Language type for supported languages
export type Language = "de_DE" | "en_US"

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

export type TransProps = {
  i18nKey: string
  children: ReactNode[]
}

/**
 * Returns a t function that maps a key to a translation. The language is fixed
 * at the time of creation, the key can be changed.
 *
 * @param translations The translations to use
 * @param lang The language to translate to
 * @returns A function that maps a key to a translation
 */
export function tFunctions(translations: Translations, lang: Language) {
  const t = (key: string, parameters: string[] = []) => {
    let text = translations[lang][key]
    if (text === undefined) {
      return key
    }
    for (let i = 0; i < parameters.length; i++) {
      text = text.replace(`<${i}></${i}>`, parameters[i])
    }
    return text
  }

  const Trans: FunctionComponent<TransProps> = ({ i18nKey, children }) => {
    const text = translations[lang][i18nKey]
    if (text === undefined) {
      return <>i18nKey</>
    }
    const matches = text.match(/<\d+><\/\d+>|[^<]+|<[^/]+>/g) || []

    const newText: ReactNode[] = matches.map((part) => {
      const match = part.match(/<(\d+)><\/\d+>/)
      if (match) {
        const index = parseInt(match[1])
        return children[index]
      }
      return part
    })
    return <>{newText}</>
  }
  return { t, Trans }
}
