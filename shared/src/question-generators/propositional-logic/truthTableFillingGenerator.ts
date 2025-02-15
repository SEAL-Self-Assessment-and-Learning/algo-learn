import type {
  MultiFreeTextFeedbackFunction,
  MultiFreeTextFormatFunction,
  MultiFreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { variableNames } from "@shared/question-generators/propositional-logic/utils.ts"
import {
  generateRandomExpression,
  getMdTruthTable,
  numToVariableValues,
  type SyntaxTreeNodeType,
} from "@shared/utils/propositionalLogic.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, type Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Filling Truth Tables",
    description: "Correctly fill truth tables",
    fillOut: "Given the function: \\[\\varPhi={{0}}\\] Fill out the corresponding truth table: \n{{1}}",
  },
  de: {
    name: "Wahrheitstabellen ausfüllen",
    description: "Korrektes Ausfüllen von Wahrheitstabellen",
    fillOut:
      "Gegeben sei die Formel: \\[\\varPhi={{0}}\\] Fülle die entsprechende Wahrheitstabelle aus: \n{{1}}",
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
  expectedParameters: [],

  generate: (lang = "en", parameters, seed) => {
    const permalink = serializeGeneratorCall({
      generator: TruthTableFillingGenerator,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)

    const numberOfVariables = random.int(2, 3)
    const varNames = random.choice(variableNames).slice(0, numberOfVariables)
    const numLeaves = random.int(3, 6)
    const randomFormula = generateRandomExpression(random, numLeaves, varNames)
    const truthTableMd = getMdTruthTable([
      { formula: randomFormula, shortName: "$\\varPhi$", input: true },
    ]).mdTable

    const question: MultiFreeTextQuestion = {
      type: "MultiFreeTextQuestion",
      name: TruthTableFillingGenerator.name(lang),
      path: permalink,
      fillOutAll: true,
      text: t(translations, lang, "fillOut", [randomFormula.toString(true), truthTableMd]),
      checkFormat: dumbCheckFormat(),
      feedback: getFeedback(randomFormula),
    }
    return { question }
  },
}

/**
 * Just a workaround such that fillOutAll works until fixed in ExerciseMultiTextInput
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

function getFeedback(formula: SyntaxTreeNodeType): MultiFreeTextFeedbackFunction {
  return ({ text }) => {
    for (let i = 0; i < formula.getTruthTable().truthTable.length; i++) {
      const userAnswer = text["ti-" + i + "-0"] === "1"
      if (userAnswer !== formula.eval(numToVariableValues(i, formula.getVariableNames().sort()))) {
        return {
          correct: false,
          correctAnswer: getMdTruthTable([{ formula, shortName: "$\\varPhi$" }]).mdTable,
        }
      }
    }
    return {
      correct: true,
    }
  }
}
