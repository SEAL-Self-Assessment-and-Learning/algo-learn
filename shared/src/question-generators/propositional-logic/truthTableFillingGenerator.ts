import {
  MultiFreeTextFeedbackFunction,
  MultiFreeTextFormatFunction,
  MultiFreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { getCellValues } from "@shared/question-generators/propositional-logic/utils.ts"
import {
  generateRandomExpression,
  numToVariableValues,
  SyntaxTreeNodeType,
} from "@shared/utils/propositionalLogic.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, Translations } from "@shared/utils/translations.ts"
import { createTruthTableInputFields, createTruthTableProps } from "@shared/utils/truthTableBlock.ts"

const translations: Translations = {
  en: {
    name: "Filling Truth Tables",
    description: "Correct filling of truth table",
    fillOut:
      "You are given the following function: \\[\\varPhi={{0}}\\] Please fill out the corresponding truth table: {{1}}",
  },
  de: {
    name: "Wahrheitstabellen ausfüllen",
    description: "Korrektes Ausfüllen von Wahrheitstabellen",
    fillOut:
      "Du erhältst folgende Formel: \\[\\varPhi={{0}}\\] Bitte fülle die entsprechende Wahrheitstabelle aus: {{1}}",
  },
}

export const TruthTableFillingGenerator: QuestionGenerator = {
  id: "ttf",
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
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["start"],
    },
  ],

  generate: (lang = "en", parameters, seed) => {
    const permalink = serializeGeneratorCall({
      generator: TruthTableFillingGenerator,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)
    const variant = parameters.variant as "start"

    if (variant === "start") {
      return generateVariantStart(random, permalink, lang)
    } else {
      throw new Error("Unknown variant")
    }
  },
}

function generateVariantStart(random: Random, permalink: string, lang: "en" | "de") {
  const numberOfVariables = random.int(2, 3)
  const varNames = random.subset(["x", "y", "z"], numberOfVariables)
  const numLeaves = random.int(3, 6)
  const randomFormula = generateRandomExpression(random, numLeaves, varNames)
  const truthTableText = createTruthTableProps({
    variables: randomFormula.getVariableNames(),
    valuesHeader: ["$\\varPhi$"],
    values: createTruthTableInputFields(Math.pow(2, numberOfVariables)).inputFields.map((value) => [
      value,
    ]),
  })

  const question: MultiFreeTextQuestion = {
    type: "MultiFreeTextQuestion",
    name: TruthTableFillingGenerator.name(lang),
    path: permalink,
    fillOutAll: true,
    text: t(translations, lang, "fillOut", [randomFormula.toString(true), truthTableText]),
    checkFormat: dumbCheckFormat(),
    feedback: feedbackVariantStart(randomFormula),
  }
  return { question }
}

/**
 * Just a workaround s.t. fillOutAll works properly until fixed in ExerciseMultiTextInput
 */
function dumbCheckFormat(): MultiFreeTextFormatFunction {
  return ({ text }, fieldID) => {
    if (text[fieldID].trim().length === 0) {
      return {
        valid: false,
      }
    }
    return {
      valid: true,
    }
  }
}

function feedbackVariantStart(formula: SyntaxTreeNodeType): MultiFreeTextFeedbackFunction {
  return ({ text }) => {
    for (let i = 0; i < formula.getTruthTable().truthTable.length; i++) {
      const userAnswer = text["truthInput-" + i] === "1"
      if (
        userAnswer !==
        formula.eval(numToVariableValues(i, formula.getProperties().variables.sort().reverse()))
      ) {
        return {
          correct: false,
          correctAnswer: createTruthTableProps({
            variables: formula.getVariableNames(),
            valuesHeader: ["$\\varPhi$"],
            values: getCellValues(formula, formula.getVariableNames()),
            inFeedbackPart: true,
          }),
        }
      }
    }
    return {
      correct: true,
    }
  }
}
