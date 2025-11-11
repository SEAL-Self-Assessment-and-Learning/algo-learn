import type { Language } from "@shared/api/Language.ts"
import type {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import {
  evalWithExprAssignments,
  randomAssignment,
  randomExpressionTree,
  type ExprNode,
} from "@shared/question-generators/math/basicMath/ArithmeticExpression.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, type Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Evaluating Terms",
    description: "Evaluate basic mathematical terms",
    text: "Difficulty: {{2}} \\[\\]Evaluate the following term: \\[ {{0}} \\] with the assignments: {{1}}",
    Validnumber: "Please enter a valid number. You entered: '{{0}}'.",
  },
  de: {
    name: "Terme auswerten",
    description: "Einfache mathematische Terme auswerten",
    text: "Werte den folgenden Term aus: ${{0}}$",
  },
}

export const EvaluatingTerms: QuestionGenerator = {
  id: "bmet",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["math", "basic-math"],
  languages: ["en", "de"],
  license: "MIT",
  expectedParameters: [
    {
      name: "difficulty",
      type: "integer",
      min: 1,
      max: 5,
    },
  ],

  generate(lang = "en", parameters, seed) {
    const permaLink = serializeGeneratorCall({
      generator: EvaluatingTerms,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)
    const difficulty = (parameters.difficulty as number) ?? 3

    const variables = ["x", "y", "z", "a", "b", "c"]

    let varExpression = false
    if (difficulty >= 4) {
      varExpression = random.bool(0.3)
    }

    let result = 0
    let assignments: Record<string, ExprNode> = {}
    let exprTree: ExprNode
    do {
      exprTree = randomExpressionTree(random, difficulty - (varExpression ? 2 : 0), 0, true, variables)
      const vars = Array.from(exprTree.getVariables())
      assignments = randomAssignment(random, varExpression, vars)
      result = evalWithExprAssignments(exprTree, assignments)
    } while (!isGoodResult(result))

    // exprTree.simplify()
    const assignmentsTex = Object.entries(assignments)
      .map(([k, v]) => `\\[ ${k} = ${v.toTex()} \\]`)
      .join(" ")

    const question: FreeTextQuestion = {
      type: "FreeTextQuestion",
      name: EvaluatingTerms.name(lang),
      path: permaLink,
      text: t(translations, lang, "text", [exprTree.toTex(), assignmentsTex, difficulty.toString()]),
      checkFormat: checkFormat(lang),
      feedback: getFeedback(result),
    }

    return {
      question,
    }
  },
}

function getFeedback(result: number): FreeTextFeedbackFunction {
  return ({ text }) => {
    const num = parseFloat(text.replace(",", "."))

    if (Math.abs(num - result) < 1e-8) {
      return {
        correct: true,
      }
    }
    return {
      correct: false,
      correctAnswer: result.toString(),
    }
  }
}

function checkFormat(lang: Language): FreeTextFormatFunction {
  return ({ text }) => {
    text = text.trim()
    if (text.length === 0) {
      return {
        valid: false,
      }
    }

    const num = parseFloat(text.replace(",", "."))
    // Check if the input is a valid number
    if (isNaN(num)) {
      return {
        valid: false,
        message: t(translations, lang, "Validnumber", [text]),
      }
    }

    return {
      valid: true,
      message: num.toString(),
    }
  }
}

const isGoodResult = (result: number) => {
  const abs = Math.abs(result)
  return (
    !isNaN(result) &&
    isFinite(result) &&
    abs >= 1 && // Not too small
    abs <= 100 && // Not too large (adjust based on grade level)
    Math.abs(result * 10 - Math.round(result * 10)) < 1e-8 // Integer or simple decimal
  )
}
