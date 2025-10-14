import type {Language} from "@shared/api/Language.ts"
import type {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "../../api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "../../api/QuestionRouter.ts"
import { _ } from "../../utils/generics.ts"
import { MinimalNormalForm } from "../../utils/propositionalLogic/minimize.ts"
import {
  compareExpressions,
  generateRandomExpression,
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
    name: "Minimize Propositional Logic Formula",
    description: "Minimize the normal form of a propositional logic formula",
    param_size: "The maximal number of variables used",
    text: "Given the propositional logic formula \\[\\varPhi={{0}}\\] Compute the minimized **{{1}}** of $\\varPhi$ labeled as $\\varPhi^*$.",
    ff_parse_error: "Your answer couldn't be parsed.",
    ff_no_normal_form: "Your answer is not a {{0}}.",
    ff_not_equivalent: "Your answer is **not** equivalent to $\\varPhi$.",
    ff_not_minimal: "Your answer is equivalent to $\\varPhi$, but it is not minimal.",
    DNF: "DNF",
    CNF: "CNF",
  },
  de: {
    name: "Aussagenlogische Formel minimieren",
    description: "Minimiere die Normalform einer aussagenlogischen Formel",
    param_size: "Die maximale Anzahl der verwendeten Variablen",
    text: "Gegeben sei die aussagenlogische Formel \\[\\varPhi={{0}}\\] Bestimme die minimierte **{{1}}** von $\\varPhi$, bezeichnet als $\\varPhi^*$",
    ff_parse_error: "Deine Antwort ist kein gültiger aussagenlogischer Ausdruck.",
    ff_no_normal_form: "Deine Antwort ist keine {{0}}.",
    ff_not_equivalent: "Deine Antwort ist **nicht** äquivalent zu $\\varPhi$.",
    ff_not_minimal: "Deine Antwort is äquivalent zu $\\varPhi$, aber sie ist nicht minimal.",
    DNF: "DNF",
    CNF: "KNF",
  },
}

/**
 * Question generator for "minimize a boolean expression"
 */
export const MinimizePropositionalLogic: QuestionGenerator = {
  id: "plminimize",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["boolean logic", "propositional logic", "propositional calculus", "normal forms", "CNF", "DNF"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      name: "variant",
      type: "string",
      allowedValues: ["DNF", "CNF"],
    },
    {
      name: "size",
      description: tFunctional(translations, "param_size"),
      type: "integer",
      min: 3,
      max: 4,
    },
  ],

  generate: (lang: Language = "en", parameters, seed) => {
    const path = serializeGeneratorCall({
      generator: MinimizePropositionalLogic,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)

    const variant: "DNF" | "CNF" = parameters.variant as "DNF" | "CNF"
    const numVariables = (parameters.size as number) ?? 3
    const numLeaves = random.int(numVariables + 2, numVariables + 4)
    const varNames = random.choice(variableNames).slice(0, numVariables)

    let randExpression
    do {
      randExpression = generateRandomExpression(random, numLeaves, varNames)
    } while (!randExpression.getProperties().falsifiable || !randExpression.getProperties().satisfiable)

    const typingsAids = getTypingAids(lang)
    const question: FreeTextQuestion = {
      type: "FreeTextQuestion",
      name: MinimizePropositionalLogic.name(lang),
      path,
      prompt: "$\\varPhi^*=$",
      text: t(translations, lang, "text", [
        randExpression.toString(true),
        t(translations, lang, variant),
      ]),
      feedback: feedbackFunction(randExpression, variant, lang),
      checkFormat: checkFormat(varNames),
      typingAid: [
        typingsAids.leftParenthesis,
        typingsAids.rightParenthesis,
        typingsAids.logicalOr,
        typingsAids.logicalAnd,
        typingsAids.logicalNot,
      ].concat(getTypingAidsVars(lang, randExpression.getVariableNames()).typingAidVars),
    }

    return { question }
  },
}

/**
 * Simple function to parse the user input
 * Catch ParsingError and show, it's not parsable
 * @param varNames
 */
function checkFormat(varNames: string[]): FreeTextFormatFunction {
  return ({ text }) => {
    const res = PropositionalLogicParser.parse(text)

    return {
      valid: !(res instanceof ParserError || _.difference(res.getVariableNames(), varNames).length > 0),
      message: `$ ${tokenToLatex(text)}$`,
    }
  }
}

/**
 * Feedback function to check if the user input is
 * - a boolean expression
 * - either a DNF or CNF
 * - equivalent to solutionExpression
 * - has the same size as the minDNF/CNF of solutionExpression
 *
 * @param solutionExpression - base expression
 * @param form - normal form type
 * @param lang
 */
function feedbackFunction(
  solutionExpression: SyntaxTreeNodeType,
  form: "DNF" | "CNF",
  lang: "en" | "de",
): FreeTextFeedbackFunction {
  return ({ text }) => {
    const correctMinNormalForm = new MinimalNormalForm(solutionExpression, form)
    const correctAnswer = "$" + correctMinNormalForm.get().toString(true) + "$"

    const userExpression = PropositionalLogicParser.parse(text)
    if (userExpression instanceof ParserError) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "ff_parse_error"),
        correctAnswer,
      }
    }

    const isCorrectForm = form === "DNF" ? userExpression.isDNF() : userExpression.isCNF()
    if (!isCorrectForm) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "ff_no_normal_form", [t(translations, lang, form)]),
        correctAnswer,
      }
    }

    if (!compareExpressions([correctMinNormalForm.get(), userExpression])) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "ff_not_equivalent"),
        correctAnswer,
      }
    }

    if (correctMinNormalForm.get().getNumLiterals() !== userExpression.getNumLiterals()) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "ff_not_minimal"),
        correctAnswer,
      }
    }

    return { correct: true }
  }
}
