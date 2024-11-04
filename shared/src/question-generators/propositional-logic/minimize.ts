import {
  FreeTextFeedbackFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { minimizeExpressionDNF } from "@shared/utils/minimizeExpression.ts"
import { generateRandomExpression, SyntaxTreeNodeType } from "@shared/utils/propositionalLogic.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Minimize boolean expression",
    description: "Minimize a given boolean expression",
    text: "Given the boolean expression \\[\\varPhi={{0}}\\] Let $\\varPhi^*$ be the minimized expression of $\\varPhi$ in **{{1}}**.",
  },
  de: {
    name: "Boolesche Ausdrücke minimieren",
    description: "Minimiere einen gegebenen booleschen Ausdruck",
    text: "Given the boolean expression \\[\\varPhi={{0}}\\] Let $\\varPhi^*$ be the minimized expression of $\\varPhi$ in **{{1}}**.",
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

    const question: FreeTextQuestion = {
      type: "FreeTextQuestion",
      name: MinimizePropositionalLogic.name(lang),
      path,
      prompt: "$\\varPhi^*=$",
      text: t(translations, lang, "text", [randExpression.toString(true), "DNF"]),
      feedback: feedbackFunction(randExpression, "DNF"),
      typingAid: [
        { text: "$($", input: "(", label: t(translations, lang, "aria.left-parenthesis") },
        { text: "$)$", input: ")", label: t(translations, lang, "aria.right-parenthesis") },
        { text: "$\\vee$", input: "\\or", label: t(translations, lang, "aria.or") },
        { text: "$\\wedge$", input: "\\and", label: t(translations, lang, "aria.and") },
        { text: "$\\neg$", input: "\\not", label: t(translations, lang, "aria.not") },
      ].concat(
        varNames.map((v) => {
          return { text: `$${v}$`, input: ` ${v}`, label: t(translations, lang, "aria.variable", [v]) }
        }),
      ),
    }

    return { question }
  },
}

function feedbackFunction(
  randExpression: SyntaxTreeNodeType,
  functionType: "DNF",
): FreeTextFeedbackFunction {
  const minFunction = minimizeExpressionDNF(randExpression)
  return ({ text }) => {
    if (text === "abc" && functionType === "DNF") return { correct: true }
    return { correct: false, correctAnswer: "$" + minFunction.toString(true) + "$" }
  }
}
