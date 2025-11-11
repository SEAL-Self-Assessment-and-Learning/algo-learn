import type { FreeTextQuestion, QuestionGenerator } from "@shared/api/QuestionGenerator.ts"
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
    text: "Evaluate the following term: \\[ {{0}} \\] with the assignments: {{1}}",
    roundNote: "If the result is a fraction, please round to the next integer.",
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
    } while (
      isNaN(result) ||
      !isFinite(result) ||
      Math.abs(result * 100 - Math.round(result * 100)) > 1e-8
    )
    console.log(`Result: ${result}`)

    const assignmentsTex = Object.entries(assignments)
      .map(([k, v]) => `\\[ ${k} = ${v.toTex()} \\]`)
      .join(" ")

    const question: FreeTextQuestion = {
      type: "FreeTextQuestion",
      name: EvaluatingTerms.name(lang),
      path: permaLink,
      text: t(translations, lang, "text", [exprTree.toTex(), assignmentsTex]),
      bottomText: t(translations, lang, "roundNote"),
    }

    return {
      question,
    }
  },
}
