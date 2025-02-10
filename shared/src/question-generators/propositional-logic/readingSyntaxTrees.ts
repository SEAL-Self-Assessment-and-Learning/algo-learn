import type { QuestionGenerator } from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import {
  generateRandomExpression,
  numToVariableValues,
  type ExpressionProperties,
  type SyntaxTreeNodeType,
} from "@shared/utils/propositionalLogic.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, type Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Reading Syntax Trees",
    description: "Read and evaluate a given syntax tree.",
    param_size: "The size of the syntax tree.",
    freetext_question: `Given the following propositional logic formula as syntax tree, compute a variable assignment such that the formula is **{{t}}**. {{g}}`,
    target_satisfied: "satisfied",
    target_falsified: "falsified",
    check_invalid: "Input invalid",
    feedback_wrong: "The provided values evaluate the formula to **{{0}}** instead of **{{1}}**.",
  },
  de: {
    name: "Syntaxbäume lesen",
    description: "Lesen und auswerten von Syntaxbäumen.",
    param_size: "Die Größe des Syntaxbaums",
    freetext_question: `Gegeben sei die folgende aussagenlogische Formel als Syntaxbaum. Gib eine Variablenbelegung an, sodass die Formel **{{t}}** ist. {{g}}`,
    target_satisfied: "erfüllt",
    target_falsified: "widerlegt",
    check_invalid: "Eingabe ungültig",
    feedback_wrong:
      "Mit der angegebenen Lösung wertet die Formel zu **{{0}}** aus anstatt zu **{{1}}**.",
  },
}

const variableNames = [
  ["A", "B", "C"],
  ["u", "v", "w"],
  ["x", "y", "z"],
]

const truthy = ["1", "true"]
const falsy = ["0", "false"]

export const ReadingSyntaxTrees: QuestionGenerator = {
  id: "rst",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["boolean logic", "propositional logic", "propositional calculus", "syntax trees"],
  languages: ["en", "de"],
  author: "Alex Schickedanz",
  license: "MIT",
  expectedParameters: [
    {
      name: "size",
      description: tFunctional(translations, "param_size"),
      type: "integer",
      min: 2,
      max: 3,
    },
  ],

  /**
   * Generates a new MultipleChoiceQuestion question.
   *
   * @param lang The language of the question
   * @param parameters The parameters for the question.
   * @param seed The seed for the random number generator
   * @returns A new MultipleChoiceQuestion question
   */
  generate: (lang = "en", parameters, seed) => {
    // initialize the RNG so the question can be generated again
    const random = new Random(seed)

    // casting necessary since Typescript cannot deduce the type of the parameter object
    const parSize = (parameters.size as number) ?? 2

    const varNames = random.choice(variableNames).slice(0, parSize)
    const numLeaves = parSize * 2

    let expression: SyntaxTreeNodeType
    let satisfiabilityProperties: ExpressionProperties

    do {
      expression = generateRandomExpression(random, numLeaves, varNames)
      satisfiabilityProperties = expression.getProperties()
    } while (!satisfiabilityProperties.satisfiable || !satisfiabilityProperties.falsifiable)

    const vars = expression.getVariableNames()
    const targetSatisfied = random.bool()

    const tree = expression.toRootedTree().toGraph()
    tree.nodeDraggable = false

    return {
      question: {
        type: "MultiFreeTextQuestion",
        name: ReadingSyntaxTrees.name(lang),
        path: serializeGeneratorCall({
          generator: ReadingSyntaxTrees,
          lang,
          parameters,
          seed,
        }),
        fillOutAll: true,
        text:
          t(translations, lang, "freetext_question", {
            g: tree.toMarkdown(),
            t: t(translations, lang, targetSatisfied ? "target_satisfied" : "target_falsified"),
          }) +
          vars.reduce((acc: string, v: string, i: number) => {
            return `${acc}{{var${i}#-#${v} = #0 | 1 | true | false}}\n`
          }, ""),
        feedback: ({ text }) => {
          const varValues: Record<string, boolean> = {}
          let validInput = true
          for (let i = 0; i < vars.length; i++) {
            validInput &&= truthy.includes(text[`var${i}`]) || falsy.includes(text[`var${i}`])
            varValues[vars[i]] = truthy.includes(text[`var${i}`])
          }

          const truthTableIndex = expression.getTruthTable().truthTable.indexOf(targetSatisfied)
          const validValues = numToVariableValues(truthTableIndex, vars)
          const correctAnswer = vars.map((v) => `${v} = ${validValues[v]}`).join(", ")

          if (!validInput) {
            return {
              correct: false,
              correctAnswer: correctAnswer,
              feedbackText: t(translations, lang, "check_invalid"),
            }
          }

          const evalVal = expression.eval(varValues)

          if (evalVal === targetSatisfied) {
            return {
              correct: true,
            }
          }

          return {
            correct: false,
            correctAnswer: correctAnswer,
            feedbackText: t(translations, lang, "feedback_wrong", [
              evalVal.toString(),
              targetSatisfied.toString(),
            ]),
          }
        },
        checkFormat: ({ text }, fieldID) => {
          const val = text[fieldID].toLowerCase()
          const valid = falsy.includes(val) || truthy.includes(val)
          return {
            valid,
            message: valid ? `${truthy.includes(val)}` : t(translations, lang, "check_invalid"),
          }
        },
      },
    }
  },
}
