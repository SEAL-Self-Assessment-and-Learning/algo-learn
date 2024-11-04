import {
  FreeTextFeedbackFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { minimizeExpressionDNF } from "@shared/utils/minimizeExpression.ts"
import {
  compareExpressions,
  generateRandomExpression,
  ParserError,
  PropositionalLogicParser,
  SyntaxTreeNodeType,
} from "@shared/utils/propositionalLogic.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Minimize boolean expression",
    description: "Minimize a given boolean expression",
    text: "Given the boolean expression \\[\\varPhi={{0}}\\] Let $\\varPhi^*$ be the minimized expression of $\\varPhi$ in **{{1}}**.",
    freetext_feedback_parse_error: "Your answer couldn't be parsed.",
    freetext_feedback_no_normal_form: "Your answer is not a {{0}}.",
    freetext_feedback_not_equivalent: "Your answer is **not** equivalent to $\\varPhi$.",
    freetext_feedback_not_minimal: "Your answer is equivalent to $\\varPhi$, but it is not minimal.",
  },
  de: {
    name: "Boolesche Ausdrücke minimieren",
    description: "Minimiere einen gegebenen booleschen Ausdruck",
    text: "Given the boolean expression \\[\\varPhi={{0}}\\] Let $\\varPhi^*$ be the minimized expression of $\\varPhi$ in **{{1}}**.",
    freetext_feedback_parse_error: "Deine Antwort ist kein gültiger aussagenlogischer Ausdruck.",
    freetext_feedback_no_normal_form: "Deine Antwort ist keine {{0}}.",
    freetext_feedback_not_equivalent: "Deine Antwort ist **nicht** äquivalent zu $\\varPhi$.",
    freetext_feedback_not_minimal:
      "Deine Antwoirt is äquivalent zu $\\varPhi$, aber sie ist nicht minimal.",
  },
}

const variableNames = [
  ["x_1", "x_2", "x_3", "x_4"],
  ["A", "B", "C", "D"],
  ["u", "v", "w", "x"],
]

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
      allowedValues: ["3"],
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

    const numLeaves = random.int(6, 7)
    const numVariables = random.int(4, 4)
    const varNames = random.choice(variableNames).slice(0, numVariables)

    let randExpression
    do {
      randExpression = generateRandomExpression(random, numLeaves, varNames)
    } while (!randExpression.getProperties().falsifiable || !randExpression.getProperties().satisfiable)

    const tmp = minimizeExpressionDNF(randExpression)
    console.log(tmp.toString(true))

    const question: FreeTextQuestion = {
      type: "FreeTextQuestion",
      name: MinimizePropositionalLogic.name(lang),
      path,
      prompt: "$\\varPhi^*=$",
      text: t(translations, lang, "text", [randExpression.toString(true), "DNF"]),
      feedback: feedbackFunction(randExpression, "DNF", lang),
      typingAid: [
        { text: "$($", input: "(", label: t(translations, lang, "aria.left-parenthesis") },
        { text: "$)$", input: ")", label: t(translations, lang, "aria.right-parenthesis") },
        { text: "$\\vee$", input: "\\or", label: t(translations, lang, "aria.or") },
        { text: "$\\wedge$", input: "\\and", label: t(translations, lang, "aria.and") },
        { text: "$\\neg$", input: "\\not", label: t(translations, lang, "aria.not") },
      ].concat(
        randExpression.getVariableNames().map((v) => {
          return { text: `$${v}$`, input: ` ${v}`, label: t(translations, lang, "aria.variable", [v]) }
        }),
      ),
    }

    return { question }
  },
}

/**
 * Feedback function to check if the user input is
 * - a boolean expression
 * - either a DNF or CNF
 * - equivalent to solutionExpression
 * - has the same size as the minDNF/CNF of solutionExpression
 *
 * Todo: currently only supported is **DNF**
 *
 * @param solutionExpression - base expression
 * @param functionType - normal form type
 * @param lang
 */
function feedbackFunction(
  solutionExpression: SyntaxTreeNodeType,
  functionType: "DNF" | "CNF",
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

    if (functionType === "DNF") {
      if (!userExpression.isDNF()) {
        return {
          correct: false,
          feedbackText: t(translations, lang, "freetext_feedback_no_normal_form", [functionType]),
          correctAnswer,
        }
      }
    } else {
      if (!userExpression.isCNF()) {
        return {
          correct: false,
          feedbackText: t(translations, lang, "freetext_feedback_no_normal_form", [functionType]),
          correctAnswer,
        }
      }
    }

    if (!compareExpressions([minExpressionDNF, userExpression])) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "freetext_feedback_not_equivalent"),
        correctAnswer,
      }
    }

    if (minExpressionDNF.getSize() !== userExpression.getSize()) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "freetext_feedback_not_minimal"),
        correctAnswer,
      }
    }

    return { correct: true, correctAnswer }
  }
}
