import type { MathNode } from "mathjs"
import type { Language } from "@shared/api/Language.ts"
import type {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import {
  mathNodeToSumProductTerm,
  type ProductTerm,
  type SumProductTerm,
} from "@shared/question-generators/asymptotics/asymptoticsUtils.ts"
import { getLoopLinearTime } from "@shared/question-generators/time/utilsAsymptotic/linear.ts"
import { getLoopSquareTime } from "@shared/question-generators/time/utilsAsymptotic/square.ts"
import math, { getVars } from "@shared/utils/math.ts"
import { stringifyPseudoCode } from "@shared/utils/pseudoCodeUtils"
import Random from "@shared/utils/random"
import { t, tFunctional, type Translations } from "@shared/utils/translations"

const translations: Translations = {
  en: {
    name: "Loops (Asymptotic)",
    description: "Determine the runtime of a loop",
    text: "{{0}} Let $f(n)$ be the runtime of loop above. Determine the function $f(n)$ in $\\Theta$-Notation.",
    feedbackUnknownVariable: "Unknown variable",
    feedbackExpected: "Expected",
    feedbackInvalidExpression: "invalid formula",
    feedbackIncomplete: "Incomplete or too complex",
  },
  de: {
    name: "Schleifen (Asymptotisch)",
    description: "Bestimme die Laufzeit einer Schleife",
    text: "{{0}} Sei $f(n)$ die Laufzeit der Schleife oben. Bestimme die Funktion $f(n)$ in $\\BigTheta$-Notation.",
  },
}

export const LoopsAsymptotic: QuestionGenerator = {
  id: "loopsa",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["simpleExact"],
    },
  ],
  generate(lang, parameters, seed) {
    const permalink = serializeGeneratorCall({
      generator: LoopsAsymptotic,
      lang,
      parameters,
      seed,
    })

    const random = new Random(seed)
    const { code, runtime } = random.choice([getLoopLinearTime, getLoopSquareTime])(random)

    const question: FreeTextQuestion = {
      type: "FreeTextQuestion",
      name: LoopsAsymptotic.name(lang),
      prompt: "$f(n)=$",
      text: t(translations, lang, "text", [stringifyPseudoCode(code)]),
      path: permalink,
      checkFormat: getCheckFormat(lang),
      feedback: getFeedback(runtime, lang),
    }
    return { question }
  },
}

function getFeedback(solution: ProductTerm, lang: Language): FreeTextFeedbackFunction {
  const correctAnswer = `$${solution.toLatex("n")}$`
  return ({ text }) => {
    let mathNode: MathNode
    try {
      mathNode = math.parse(text)
    } catch {
      return {
        correct: false,
        correctAnswer,
        message: t(translations, lang, "feedbackInvalidExpression"),
      }
    }

    const unknownVars = getVars(mathNode).filter((v) => v !== "n")
    const unknownVar: string | null = unknownVars.length > 0 ? unknownVars[0] : null
    if (unknownVar) {
      return {
        correct: false,
        correctAnswer,
        feedbackText: `${t(
          translations,
          lang,
          "feedbackUnknownVariable",
        )}: $${unknownVar}$. ${t(translations, lang, "feedbackExpected")}: $n$.`,
      }
    }

    let sumProductTerm: SumProductTerm
    try {
      sumProductTerm = mathNodeToSumProductTerm(math.parse(text))
    } catch {
      return {
        correct: false,
        correctAnswer,
        feedbackText: t(translations, lang, "feedbackIncomplete"),
      }
    }

    return {
      correct: solution.bigTheta(sumProductTerm.dominantTerm()),
      correctAnswer,
      feedbackText:
        "$" +
        mathNode.toTex({
          parenthesis: "auto",
          implicit: "show",
        }) +
        "$",
    }
  }
}

function getCheckFormat(lang: Language): FreeTextFormatFunction {
  return ({ text }) => {
    if (text.trim() === "") {
      return {
        valid: false,
      }
    }
    let mathNode: MathNode | undefined
    let valid = true
    try {
      mathNode = math.parse(text)
    } catch {
      valid = false
    }
    if (
      !valid ||
      mathNode === undefined ||
      (mathNode instanceof math.ConstantNode && mathNode.value === undefined)
    ) {
      return {
        valid: false,
        message: t(translations, lang, "feedbackInvalidExpression"),
      }
    }

    const unknownVars = getVars(mathNode).filter((v) => v !== "n")
    const unknownVar: string | null = unknownVars.length > 0 ? unknownVars[0] : null
    if (unknownVar) {
      return {
        valid: false,
        message: `${t(translations, lang, "feedbackUnknownVariable")}: $${unknownVar}$. ${t(translations, lang, "feedbackExpected")}: $n$.`,
      }
    }

    return {
      valid: true,
      message:
        "$" +
        mathNode.toTex({
          parenthesis: "auto",
          implicit: "show",
        }) +
        "$",
    }
  }
}
