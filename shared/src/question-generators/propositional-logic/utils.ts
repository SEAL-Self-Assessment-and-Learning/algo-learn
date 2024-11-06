import { t, Translations } from "@shared/utils/translations"

/** Standard variable names for boolean expressions */
export const variableNames = [
  ["x_1", "x_2", "x_3", "x_4", "x_5"],
  ["A", "B", "C", "D", "E"],
  ["u", "v", "w", "x", "y"],
]

/**
 * Translations for typing aids for propositional logic
 */
const typingAidTranslations: Translations = {
  en: {
    "aria.left-parenthesis": "left parenthesis",
    "aria.right-parenthesis": "right parenthesis",
    "aria.or": "logical or",
    "aria.and": "logical and",
    "aria.not": "negation",
    "aria.variable": "variable {{0}}",
  },
  de: {
    "aria.left-parenthesis": "Klammer auf",
    "aria.right-parenthesis": "Klammer zu",
    "aria.or": "logisches Oder",
    "aria.and": "logisches Und",
    "aria.not": "Negation",
    "aria.variable": "Variable {{0}}",
  },
}

/**
 * Returns all possible typing aids for propositional logic
 * The necessary aids can be picked individual for each use-case
 * @param lang
 */
export function getTypingAids(lang: "en" | "de") {
  const leftParenthesis = {
    text: "$($",
    input: "(",
    label: t(typingAidTranslations, lang, "aria.left-parenthesis"),
  }
  const rightParenthesis = {
    text: "$)$",
    input: ")",
    label: t(typingAidTranslations, lang, "aria.right-parenthesis"),
  }
  const logicalOr = { text: "$\\vee$", input: "\\or", label: t(typingAidTranslations, lang, "aria.or") }
  const logicalAnd = {
    text: "$\\wedge$",
    input: "\\and",
    label: t(typingAidTranslations, lang, "aria.and"),
  }
  const logicalNot = {
    text: "$\\neg$",
    input: "\\not",
    label: t(typingAidTranslations, lang, "aria.not"),
  }

  return { leftParenthesis, rightParenthesis, logicalOr, logicalAnd, logicalNot }
}

/**
 * Returns the typing aids for the variable names
 * @param lang
 * @param varNames
 */
export function getTypingAidsVars(lang: "en" | "de", varNames: string[]) {
  return {
    typingAidVars: varNames.map((v) => {
      return {
        text: `$${v}$`,
        input: ` ${v}`,
        label: t(typingAidTranslations, lang, "aria.variable", [v]),
      }
    }),
  }
}
