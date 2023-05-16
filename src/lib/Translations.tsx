import {
  cloneElement,
  Fragment,
  FunctionComponent,
  ReactElement,
  ReactNode,
} from "react"

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
  children: ReactNode
}

/**
 * I18n Text is written in XML-like syntax, such as
 *
 *     text: "Let {{0}} and {{1}} be two natural numbers. What is the <3>sum</3> {{2}}?"
 *
 * Here, {{0}} is a short-hand for <0></0>. The number in the tag is the index
 * of the child element that should be inserted at this position, or the index
 * of the positional parameter that should be inserted here. If the tag has
 * contents, such as <3>sum</3>, then the contents are used as the translation
 * for the tag. If the tag has no contents, then the child element is inserted
 * as-is. Thus, the Trans component might be called like this:
 *
 *     <Trans i18nkey="text">
 *       <TeX>a</TeX>
 *       <TeX>b</TeX>
 *       <Tex>a + b</TeX>
 *       <b></b>
 *     </Trans>
 *
 * The result would be rendered as a React component as: Let <TeX>a</TeX> and
 * <TeX>b</TeX> be two natural numbers. What is the <b>sum</b> <TeX>a+b</TeX>?
 *
 * We first parse the XML-like i18nText into a parse tree. To this end, we
 * define the following types:
 */
type TransTextTree = TransTextNode[]
type TransTextNode = string | { tagNumber: number; child: TransTextTree }

/**
 * The parseTransText function parses the i18nText into a parse tree.
 *
 * @param transText The i18nText to parse
 * @returns The parse tree
 */
function parseTransText(transText: string): TransTextTree {
  if (transText === "") return []
  const matches =
    transText.match(/{{\d+}}|<(\d+)>((?:(?!<\/\1>).)*)<\/\1>|[^{<]+/g) || []
  const tree: TransTextTree = []
  for (const match of matches) {
    const tagMatch = match.match(/<(\d+)>(.*?)<\/\1>|{{(\d+)}}/)
    if (tagMatch) {
      // This match is a tag with possible nested text
      const tagNumber = parseInt(tagMatch[1] ?? tagMatch[3], 10)
      const innerText = tagMatch[2] ?? ""
      tree.push({ tagNumber, child: parseTransText(innerText) })
    } else {
      tree.push(match)
    }
  }
  return tree
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
  /**
   * React component that recursively translates a tree with parameters given as
   * children
   *
   * @param tree The parsed i18n pseudo-XML text as a tree.
   * @param children The parameters to replace in the translation.
   * @returns The translated text as a React component.
   */
  function TransTree({
    tree,
    children,
  }: {
    tree: TransTextTree
    children: ReactNode
  }): ReactElement {
    if (tree.length === 0) {
      return <></>
    } else {
      return (
        <>
          {tree.map((c, index) => {
            if (typeof c === "string") {
              return <Fragment key={index}>{c}</Fragment>
            }
            if (!children || !Array.isArray(children) || !children[c.tagNumber])
              throw new Error(`No child with index ${c.tagNumber} found.`)
            if (c.child.length === 0) {
              // This match is a tag without nested text; in this case, we return the child as is
              return <Fragment key={index}>{children[c.tagNumber]}</Fragment>
            } else {
              // This match is a tag with nested text; in this case, we recursively translate the child.
              return (
                <Fragment key={index}>
                  {cloneElement(children[c.tagNumber] as ReactElement, {
                    children: (
                      <TransTree tree={c.child}>
                        {children[c.tagNumber]}
                      </TransTree>
                    ),
                  })}
                </Fragment>
              )
            }
          })}
        </>
      )
    }
  }

  /**
   * React component that recursively translates a tree with parameters given as
   * children
   *
   * @param tree The parsed i18n pseudo-XML text as a tree.
   * @param children The parameters to replace in the translation.
   * @returns The translated text as a React component.
   */
  function tTree({
    tree,
    parameters,
  }: {
    tree: TransTextTree
    parameters: string[]
  }): string {
    if (tree.length === 0) {
      return ""
    } else {
      return tree
        .map((c) => {
          if (typeof c === "string") {
            return c
          }
          if (c.child.length === 0) {
            // This match is a tag <i></i> or {{i}} without nested text; in this case, we return the given parameter
            if (c.tagNumber >= parameters.length)
              throw new Error(
                `No parameters with index ${c.tagNumber} was given.`
              )
            return parameters[c.tagNumber]
          } else {
            // This match is a tag <i>foo</i> **with** nested text; in this case, we ignore the tag (since this function offers no functionality for it) and print foo. Note that <2><5></5></2> does not and is not supposed to print parameters[5], so we set parameters to [].
            return tTree({ tree: c.child, parameters: [] })
          }
        })
        .join("")
    }
  }

  /**
   * React component that translates HTML-like text given via an i18n key with
   * parameters given as children
   *
   * @param i18nKey The key to translate
   * @param children The parameters to replace in the translation.
   * @returns The translated text as a React component
   */
  const Trans: FunctionComponent<TransProps> = ({ i18nKey, children }) => {
    const text = translations[lang][i18nKey]
    if (text === undefined) {
      return <>{i18nKey}</>
    }
    return TransTree({ tree: parseTransText(text), children })
  }

  /**
   * Returns a translation for a given key and parameters. For code
   * deduplication, this function uses the TransText component and converts the
   * generated React component to a string.
   *
   * @param key The key to translate
   * @param parameters The parameters to replace in the translation. Parameters
   *   can be either positional (such as {{0}}, {{1}}, etc.; or tags <0></0>,
   *   <1></1>, etc.) or named (such as {{name}}, {{age}}, etc.).
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
      return text
    } else {
      return tTree({ tree: parseTransText(text), parameters })
    }
  }

  return { t, Trans }
}
