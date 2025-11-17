import type { Language } from "@shared/api/Language.ts"
import type {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import {
  evaluateExpression,
  parseArithmeticExpression,
  type ExprNode,
} from "@shared/utils/math/ArithmeticExpression.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, type Translations } from "@shared/utils/translations.ts"
import { generateExpressionScenario, type ExpressionScenario } from "./randomExpression"

const translations: Translations = {
  en: {
    name: "Evaluating Terms",
    description: "Evaluate basic mathematical terms",
    textNumeric:
      "Difficulty: {{2}} \\[\\]Evaluate the expression: \\[ {{0}} \\] with the assignments: {{1}}",
    textSymbolic:
      "Difficulty: {{2}} \\[\\]Apply the assignments to simplify the expression: \\[ {{0}} \\] and provide the resulting expression. Assignments: {{1}}",
    ValidNumber: "Please enter a valid number. You entered: '{{0}}'.",
    ValidExpression: "Please enter a valid expression. {{0}}",
  },
  de: {
    name: "Terme auswerten",
    description: "Einfache mathematische Terme auswerten",
    textNumeric:
      "Schwierigkeitsgrad: {{2}} \\[\\]Berechne den Ausdruck: \\[ {{0}} \\] mit den Zuordnungen: {{1}}",
    textSymbolic:
      "Schwierigkeitsgrad: {{2}} \\[\\]Wende die Zuordnungen auf den Ausdruck an und vereinfache: \\[ {{0}} \\] . Gib den resultierenden Term an. Zuordnungen: {{1}}",
    ValidNumber: "Bitte gib eine gültige Zahl ein. Deine Eingabe: '{{0}}'.",
    ValidExpression: "Bitte gib einen gültigen Term ein. {{0}}",
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
      max: 9,
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
    const difficulty = Math.max(1, Math.min(9, (parameters.difficulty as number) ?? 3))

    const variables = ["x", "y", "z", "a", "b", "c"]

    let scenario: ExpressionScenario | undefined
    const maxAttempts = 50

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const candidate = generateExpressionScenario(random, difficulty, variables)
        if (isValidScenario(candidate)) {
          scenario = candidate
          break
        }
      } catch {
        // ignore & retry
      }
    }

    if (!scenario) {
      throw new Error("Unable to generate a valid exercise for the requested difficulty level.")
    }

    const assignmentsTex = formatAssignments(scenario.assignments)
    const expressionTex = scenario.expression.toTex()
    const textKey = scenario.expectsNumeric ? "textNumeric" : "textSymbolic"
    const questionText = t(translations, lang, textKey, [
      expressionTex,
      assignmentsTex,
      difficulty.toString(),
    ])

    const question: FreeTextQuestion = {
      type: "FreeTextQuestion",
      name: EvaluatingTerms.name(lang),
      path: permaLink,
      text: questionText,
      checkFormat: scenario.expectsNumeric ? checkNumericFormat(lang) : checkExpressionFormat(lang),
      feedback: scenario.expectsNumeric
        ? getNumericFeedback(scenario.expected as number)
        : getSymbolicFeedback((scenario.expected as ExprNode).clone()),
    }

    return {
      question,
    }
  },
}

function isValidScenario(candidate: ExpressionScenario): boolean {
  // Check that the expression itself evaluates and simplifies
  evaluateExpression(candidate.expression)
  candidate.expression.clone().simplify()

  // If it’s symbolic, ensure expected expression also simplifies
  if (!candidate.expectsNumeric) {
    const expectedExpr = candidate.expected as ExprNode
    expectedExpr.clone().simplify()
    return true
  }

  // Otherwise: numeric result -> check its quality
  return typeof candidate.expected === "number" && isGoodResult(candidate.expected)
}

function formatAssignments(assignments: Record<string, ExprNode>): string {
  return Object.entries(assignments)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([symbol, expr]) => `\\[ ${symbol} = ${expr.toTex()} \\]`)
    .join(" ")
}

function getNumericFeedback(expected: number): FreeTextFeedbackFunction {
  return ({ text }) => {
    const num = Number.parseFloat(text.replace(",", "."))

    if (Number.isFinite(num) && Math.abs(num - expected) < 1e-8) {
      return { correct: true }
    }

    return {
      correct: false,
      correctAnswer: expected.toString(),
    }
  }
}

// TODO
function getSymbolicFeedback(expected: ExprNode): FreeTextFeedbackFunction {
  const canonical = expected.simplify()
  const canonicalKey = canonical.toCanonicalKey()

  return ({ text }) => {
    try {
      const parsed = parseArithmeticExpression(text, { simplify: true })
      if (parsed.toCanonicalKey() === canonicalKey) {
        return { correct: true }
      }
      return {
        correct: false,
        correctAnswer: "$" + expected.toTex() + "$",
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        correct: false,
        message,
        correctAnswer: "$" + expected.toTex() + "$",
      }
    }
  }
}

function checkNumericFormat(lang: Language): FreeTextFormatFunction {
  return ({ text }) => {
    const trimmed = text.trim()
    if (trimmed.length === 0) {
      return { valid: false }
    }

    const num = Number.parseFloat(trimmed.replace(",", "."))
    if (!Number.isFinite(num)) {
      return {
        valid: false,
        message: t(translations, lang, "ValidNumber", [trimmed]),
      }
    }

    return {
      valid: true,
      message: num.toString(),
    }
  }
}

function checkExpressionFormat(lang: Language): FreeTextFormatFunction {
  return ({ text }) => {
    const trimmed = text.trim()
    if (trimmed.length === 0) {
      return { valid: false }
    }

    try {
      parseArithmeticExpression(trimmed, { simplify: false })
      return {
        valid: true,
        message: trimmed,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        valid: false,
        message: t(translations, lang, "ValidExpression", [message]),
      }
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
