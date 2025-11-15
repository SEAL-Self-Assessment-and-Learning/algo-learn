import type {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "../../api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "../../api/QuestionRouter.ts"
import { _ } from "../../utils/generics.ts"
import math from "../../utils/math/math.ts"
import {
  generateRandomExpression,
  getMdTruthTable,
  numToVariableValues,
  ParserError,
  PropositionalLogicParser,
  tokenToLatex,
  type SyntaxTreeNodeType,
} from "../../utils/propositionalLogic/propositionalLogic.ts"
import Random from "../../utils/random.ts"
import { t, tFunctional, type Translations } from "../../utils/translations.ts"
import { getTypingAids, getTypingAidsVars, variableNames } from "./utils.ts"

const translations: Translations = {
  en: {
    name: "Reading Truth Tables",
    description: "Correctly interpret truth tables",
    anyForm:
      "Given the following truth table: \n{{0}} Provide a corresponding expression for $\\varPhi$.",
    dcnf: "Given the following truth table: \n{{0}} Provide a corresponding expression in **{{1}}** for $\\varPhi$.",
    freetext_bottom_text: "Use the following buttons for easier input",
    freetext_feedback_no_normal_form: "Your answer is not a {{0}}.",
  },
  de: {
    name: "Wahrheitstabellen lesen",
    description: "Korrektes interpretieren von Wahrheitstabellen",
    anyForm:
      "Gegeben sei die folgende Wahrheitstabelle: \n{{0}} Gib einen passenden Ausdruck für $\\varPhi$ an.",
    dcnf: "Gegeben sei die folgende Wahrheitstabelle: \n{{0}} Gib einen passenden Ausdruck in **{{1}}** für $\\varPhi$ an.",
    freetext_bottom_text: "Verwende die folgenden Buttons als Eingabehilfe.",
    freetext_feedback_no_normal_form: "Deine Antwort ist keine {{0}}.",
  },
}

export const TruthTableReadingGenerator: QuestionGenerator = {
  id: "ttr",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: [
    "boolean logic",
    "propositional logic",
    "propositional calculus",
    "normal forms",
    "CNF",
    "DNF",
    "truth table",
  ],
  languages: ["de", "en"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["any", "dnf", "cnf"],
    },
  ],

  generate: (lang = "en", parameters, seed) => {
    const permalink = serializeGeneratorCall({
      generator: TruthTableReadingGenerator,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)
    const variant = parameters.variant as "any" | "dnf" | "cnf"

    if (variant === "any") {
      return generateVariantAny(random, lang, permalink)
    } else if (variant === "dnf" || variant === "cnf") {
      return generateVariantCDnf(variant, random, lang, permalink)
    } else {
      throw new Error("Unknown variant")
    }
  },
}

/**
 * Creates the questions for variant any.
 * User has to create an expression based on the truth table,
 * the expression can be in any format.
 * @param random
 * @param lang
 * @param permalink
 */
function generateVariantAny(random: Random, lang: "de" | "en", permalink: string) {
  const numVariables = random.int(2, 3)
  const vars = random.choice(variableNames).slice(0, numVariables)
  const numLeaves = random.int(3, 7)
  const randomExpression = generateRandomExpression(random, numLeaves, vars)

  const truthTable = getMdTruthTable([{ formula: randomExpression, shortName: "$\\varPhi$" }]).mdTable

  const typingsAids = getTypingAids(lang)
  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: TruthTableReadingGenerator.name(lang),
    path: permalink,
    text: t(translations, lang, "anyForm", [truthTable]),
    prompt: "$\\varPhi =$",
    bottomText: t(translations, lang, "freetext_bottom_text"),
    typingAid: [
      typingsAids.leftParenthesis,
      typingsAids.rightParenthesis,
      typingsAids.logicalOr,
      typingsAids.logicalAnd,
      typingsAids.logicalNot,
      typingsAids.logicalXor,
      typingsAids.logicalImpl,
      typingsAids.logicalEquivalence,
    ].concat(getTypingAidsVars(lang, randomExpression.getVariableNames()).typingAidVars),
    checkFormat: getCheckFormat(vars),
    feedback: getFeedback(randomExpression, "any", lang),
  }

  return { question }
}

/**
 * Creates a question for variant dnf/cnf.
 * User has to create an expression based on the truth table,
 * the expression can be in either **cnf** or **dnf**.
 * @param format
 * @param random
 * @param lang
 * @param permalink
 */
function generateVariantCDnf(
  format: "dnf" | "cnf",
  random: Random,
  lang: "de" | "en",
  permalink: string,
) {
  const numVariables = random.int(2, 3)
  const vars = random.choice(variableNames).slice(0, numVariables)
  const numLeaves = random.int(3, 5)
  let randomExpression: SyntaxTreeNodeType
  // don't get a not satisfiable or not falsifiable solution
  // also not to many 1's so input won't be too long
  do {
    randomExpression = generateRandomExpression(random, numLeaves, vars)
  } while (
    !randomExpression.getProperties().satisfiable ||
    !randomExpression.getProperties().falsifiable ||
    randomExpression.getTruthTable().truthTable.filter((value) => (format === "dnf" ? value : !value))
      .length >
      (math.pow(2, numVariables) as number) * 0.75
  )

  randomExpression = format === "dnf" ? randomExpression.toDNF() : randomExpression.toCNF()

  const truthTable = getMdTruthTable([{ formula: randomExpression, shortName: "$\\varPhi$" }]).mdTable

  const typingsAids = getTypingAids(lang)
  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: TruthTableReadingGenerator.name(lang),
    path: permalink,
    text: t(translations, lang, "dcnf", [truthTable, format.toUpperCase()]),
    prompt: "$\\varPhi =$",
    bottomText: t(translations, lang, "freetext_bottom_text"),
    typingAid: [
      typingsAids.leftParenthesis,
      typingsAids.rightParenthesis,
      typingsAids.logicalOr,
      typingsAids.logicalAnd,
      typingsAids.logicalNot,
    ].concat(getTypingAidsVars(lang, randomExpression.getVariableNames()).typingAidVars),
    checkFormat: getCheckFormat(vars),
    feedback: getFeedback(randomExpression, format, lang),
  }

  return { question }
}

/**
 * Returns the checkFormat function if the user is allowed to enter the
 * logical expression in any format
 */
function getCheckFormat(vars: string[]): FreeTextFormatFunction {
  return ({ text }) => {
    const answer = PropositionalLogicParser.parse(text)

    return {
      valid: !(
        answer instanceof ParserError || _.difference(answer.getProperties().variables, vars).length > 0
      ),
      message: `$ ${tokenToLatex(text)}$`,
    }
  }
}

/**
 * Returns a feedback function, which does:
 * - check if parsing possible
 * - if dnf/cnf, it checks for correct form
 * - checks if user expression equals truth table
 * @param solExpression - expression the truth table (provided to the user) is based on
 * @param format - dnf / cnf
 * @param lang
 */
function getFeedback(
  solExpression: SyntaxTreeNodeType,
  format: "any" | "dnf" | "cnf",
  lang: "en" | "de",
): FreeTextFeedbackFunction {
  const standardFalseReturn = {
    correct: false,
    correctAnswer: "$" + solExpression.toString(true) + "$",
  }

  return ({ text }) => {
    const answer = PropositionalLogicParser.parse(text)

    if (answer instanceof ParserError) {
      return standardFalseReturn
    }

    if (format !== "any") {
      if (format === "dnf" ? !answer.isDNF() : !answer.isCNF()) {
        return {
          correct: false,
          feedbackText: t(translations, lang, "freetext_feedback_no_normal_form", [format]),
          correctAnswer: "$" + solExpression.toString(true) + "$",
        }
      }
    }
    // evaluates the user expression for every row, using all variables
    // even if the user hasn't used all
    if (
      solExpression
        .getTruthTable()
        .truthTable.some(
          (expResult, index) =>
            answer.eval(numToVariableValues(index, solExpression.getVariableNames())) !== expResult,
        )
    ) {
      return standardFalseReturn
    }

    return {
      correct: true,
    }
  }
}
