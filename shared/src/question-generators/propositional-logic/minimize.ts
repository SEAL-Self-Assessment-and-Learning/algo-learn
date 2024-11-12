import {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { minimizeExpressionDNF } from "@shared/question-generators/propositional-logic/minimizeDNF"
import {
  getTypingAids,
  getTypingAidsVars,
  variableNames,
} from "@shared/question-generators/propositional-logic/utils"
import { _ } from "@shared/utils/generics"
import {
  compareExpressions,
  generateRandomExpression,
  ParserError,
  PropositionalLogicParser,
  SyntaxTreeNodeType,
  tokenToLatex,
} from "@shared/utils/propositionalLogic"
import Random from "@shared/utils/random"
import { t, tFunctional, Translations } from "@shared/utils/translations"

const translations: Translations = {
  en: {
    name: "Minimize boolean expression",
    description: "Minimize the normal form of a boolean expression",
    param_size: "The maximal number of variables used",
    text: "Given the boolean expression \\[\\varPhi={{0}}\\] Let $\\varPhi^*$ be the minimized expression of $\\varPhi$ in **{{1}}**.",
    freetext_feedback_parse_error: "Your answer couldn't be parsed.",
    freetext_feedback_no_normal_form: "Your answer is not a {{0}}.",
    freetext_feedback_not_equivalent: "Your answer is **not** equivalent to $\\varPhi$.",
    freetext_feedback_not_minimal: "Your answer is equivalent to $\\varPhi$, but it is not minimal.",
    DNF: "DNF",
    CNF: "CNF",
  },
  de: {
    name: "Boolesche Ausdrücke minimieren",
    description: "Minimiere die Normalform eines booleschen Ausdruck",
    param_size: "Die maximale Anzahl der verwendeten Variablen",
    text: "Gegeben sei der boolesche Ausdruck \\[\\varPhi={{0}}\\] Sei $\\varPhi^*$ der minimierte Ausdruck von $\\varPhi$ in **{{1}}**.",
    freetext_feedback_parse_error: "Deine Antwort ist kein gültiger aussagenlogischer Ausdruck.",
    freetext_feedback_no_normal_form: "Deine Antwort ist keine {{0}}.",
    freetext_feedback_not_equivalent: "Deine Antwort ist **nicht** äquivalent zu $\\varPhi$.",
    freetext_feedback_not_minimal:
      "Deine Antwort is äquivalent zu $\\varPhi$, aber sie ist nicht minimal.",
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
      allowedValues: ["DNF"], // "CNF"
    },
    {
      name: "size",
      description: tFunctional(translations, "param_size"),
      type: "integer",
      min: 3,
      max: 4,
    },
  ],

  generate: (lang = "en", parameters, seed) => {
    const path = serializeGeneratorCall({
      generator: MinimizePropositionalLogic,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)

    const variant: "DNF" = parameters.variant as "DNF"
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
 * Todo: currently only **DNF** is supported
 *
 * @param solutionExpression - base expression
 * @param functionType - normal form type
 * @param lang
 */
function feedbackFunction(
  solutionExpression: SyntaxTreeNodeType,
  functionType: "DNF", // | "CNF"
  lang: "en" | "de",
): FreeTextFeedbackFunction {
  return ({ text }) => {
    const minExpressionDNF: SyntaxTreeNodeType = minimizeExpressionDNF(solutionExpression)
    const correctAnswer = "$" + minExpressionDNF.toString(true) + "$"

    const userExpression = PropositionalLogicParser.parse(text)
    if (userExpression instanceof ParserError) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "freetext_feedback_parse_error"),
        correctAnswer,
      }
    }

    const isCorrectForm = functionType === "DNF" ? userExpression.isDNF() : userExpression.isCNF()
    if (!isCorrectForm) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "freetext_feedback_no_normal_form", [
          t(translations, lang, functionType),
        ]),
        correctAnswer,
      }
    }

    if (!compareExpressions([minExpressionDNF, userExpression])) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "freetext_feedback_not_equivalent"),
        correctAnswer,
      }
    }

    if (minExpressionDNF.getNumLiterals() !== userExpression.getNumLiterals()) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "freetext_feedback_not_minimal"),
        correctAnswer,
      }
    }

    return { correct: true, correctAnswer }
  }
}
