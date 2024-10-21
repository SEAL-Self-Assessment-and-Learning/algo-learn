import { Language } from "@shared/api/Language"
import {
  FreeTextFeedback,
  FreeTextFeedbackFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import {
  calculateModularInverse,
  gcd,
  modularExponentiation,
} from "@shared/question-generators/math/utils"
import Random from "@shared/utils/random"
import { t, tFunctional, Translations } from "@shared/utils/translations"

const translations: Translations = {
  en: {
    name: "Modular Arithmetic Tricks",
    description: "Answer questions involving modular arithmetic.",
    reductionQuestion: "Reduce ${{x}}$ modulo ${{n}}$.",
    inverseQuestion: "Find the modular inverse of ${{a}}$ modulo ${{n}}$.",
    expQuestion: "Calculate ${{a}}^{{{b}}} \\pmod{ {{n}} }$.",
    simpleQuestion: "Find an integer $x$ such that $x \\equiv {{a}} \\pmod{ {{b}} }$.",
    crtQuestion: "Solve the system of congruences: \\[ {{text}} \\text{.}\\]",
    crtBottomText: "Provide your answer in the form: $y\\pmod{z}$.",
    feedbackInvalid: "Your answer is not valid.",
    feedbackCorrect: "Correct!",
    feedbackIncorrect: "Incorrect. The correct answer is: ${{correctAnswer}}$.",
    feedbackIncomplete: "Incomplete or too complex",
  },
  de: {
    name: "Modulare Arithmetik Tricks",
    description: "Beantworte Fragen zur modularen Arithmetik.",
    reductionQuestion: "Reduziere ${{x}}$ modulo ${{n}}$.",
    inverseQuestion: "Finde das Inverse von ${{a}}$ modulo ${{n}}$.",
    expQuestion: "Berechne ${{a}}^{{{b}}} \\pmod{ {{n}} }$.",
    simpleQuestion: "Finde eine ganze Zahl $x$, so dass $x \\equiv {{a}} \\pmod{ {{b}} }$.",
    crtQuestion: "Löse das System von Kongruenzen: \\[ {{text}} \\text{.}\\]",
    crtBottomText: "Gib deine Antwort in der Form $y\\pmod{z}$ an.",
    feedbackInvalid: "Deine Antwort ist ungültig.",
    feedbackCorrect: "Richtig!",
    feedbackIncorrect: "Falsch. Die richtige Antwort ist: ${{correctAnswer}}$.",
    feedbackIncomplete: "Nicht vollständig oder zu komplex",
  },
}

export const ModTricks: QuestionGenerator = {
  id: "modtricks",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["basic math", "modular arithmetic", "modulus", "mod", "arithmetic"],
  languages: ["en", "de"],
  author: "Janette Welker",
  license: "MIT",
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["simple", "reduction", "inverse", "exponentiation"],
    },
  ],

  generate: (lang, parameters, seed) => {
    const path = serializeGeneratorCall({
      generator: ModTricks,
      lang,
      parameters,
      seed,
    })

    const random = new Random(seed)
    const variant = parameters.variant as "simple" | "reduction" | "inverse" | "exponentiation"

    let question
    let testing

    switch (variant) {
      case "simple":
        ;({ question, testing } = generateSimpleQuestion(lang, path, random))
        break
      case "reduction":
        ;({ question, testing } = generateReductionQuestion(lang, path, random))
        break
      case "inverse":
        ;({ question, testing } = generateInverseQuestion(lang, path, random))
        break
      case "exponentiation":
        ;({ question, testing } = generateExponentiationQuestion(lang, path, random))
        break
      default:
        throw new Error("Unknown variant")
    }

    return {
      question,
      testing, // allows for unit tests
    }
  },
}

// helper for feedback funtions with normalization
function generateModularFeedback(
  lang: Language,
  userAnswerText: string,
  correctValue: number,
  modulus: number,
): FreeTextFeedback {
  const userAnswer = parseFloat(userAnswerText.trim())

  // If input is invalid, return invalid feedback
  if (isNaN(userAnswer) || !Number.isInteger(userAnswer)) {
    return { correct: false, feedbackText: t(translations, lang, "feedbackInvalid") }
  }

  // Normalize the correct answer and user answer within the range [0, modulus-1]
  const normalizedCorrectAnswer = ((correctValue % modulus) + modulus) % modulus
  const normalizedUserAnswer = ((userAnswer % modulus) + modulus) % modulus

  // Check if the normalized answers match
  if (normalizedUserAnswer === normalizedCorrectAnswer) {
    return { correct: true, feedbackText: t(translations, lang, "feedbackCorrect") }
  } else {
    return {
      correct: false,
      feedbackText: t(translations, lang, "feedbackIncorrect", {
        correctAnswer: normalizedCorrectAnswer.toString(),
      }),
    }
  }
}

// Simple
function generateSimpleQuestion(lang: Language, path: string, random: Random) {
  const a = random.int(0, 19)
  const b = random.int(2, 20)

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: ModTricks.name(lang),
    path: path,
    text: t(translations, lang, "simpleQuestion", { a: String(a), b: String(b) }),
    feedback: getSimpleFeedbackFunction(lang, a, b),
  }

  const testing = { a, b }
  return { question, testing }
}

function getSimpleFeedbackFunction(lang: Language, a: number, b: number): FreeTextFeedbackFunction {
  return ({ text }) => generateModularFeedback(lang, text, a, b)
}

// Reduction
function generateReductionQuestion(lang: Language, path: string, random: Random) {
  const x = random.int(100, 999)
  const n = random.int(2, 20)

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: ModTricks.name(lang),
    path: path,
    text: t(translations, lang, "reductionQuestion", { x: String(x), n: String(n) }),
    feedback: getReductionFeedbackFunction(lang, x, n),
  }

  const testing = { x, n }
  return { question, testing }
}

function getReductionFeedbackFunction(lang: Language, x: number, n: number): FreeTextFeedbackFunction {
  return ({ text }) => generateModularFeedback(lang, text, x, n)
}

// Inverse
function generateInverseQuestion(lang: Language, path: string, random: Random) {
  let a, n
  do {
    a = random.int(2, 15)
    n = random.int(2, 20)
  } while (gcd(a, n) !== 1)

  const inverse = calculateModularInverse(a, n)

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: ModTricks.name(lang),
    path: path,
    text: t(translations, lang, "inverseQuestion", { a: String(a), n: String(n) }),
    feedback: getInverseFeedbackFunction(lang, inverse),
  }

  const testing = { a, n, inverse }
  return { question, testing }
}

function getInverseFeedbackFunction(
  lang: Language,
  correctAnswer: number | null,
): FreeTextFeedbackFunction {
  return ({ text }) => {
    const userAnswer = parseFloat(text.trim())

    if (isNaN(userAnswer) || !Number.isInteger(userAnswer)) {
      return { correct: false, feedbackText: t(translations, lang, "feedbackInvalid") }
    }

    if (userAnswer === correctAnswer) {
      return { correct: true, feedbackText: t(translations, lang, "feedbackCorrect") }
    } else {
      const answerText = correctAnswer !== null ? correctAnswer.toString() : "N/A"

      return {
        correct: false,
        feedbackText: t(translations, lang, "feedbackIncorrect", {
          correctAnswer: answerText,
        }),
      }
    }
  }
}

// Exponentiation
function generateExponentiationQuestion(lang: Language, path: string, random: Random) {
  const a = random.int(2, 10)
  const b = random.int(2, 10)
  const n = random.int(2, 20)
  const result = modularExponentiation(a, b, n)

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: ModTricks.name(lang),
    path: path,
    text: t(translations, lang, "expQuestion", { a: String(a), b: String(b), n: String(n) }),
    feedback: getExponentiationFeedbackFunction(lang, result, n),
  }

  const testing = { a, b, n, result }
  return { question, testing }
}

function getExponentiationFeedbackFunction(
  lang: Language,
  result: number,
  modulus: number,
): FreeTextFeedbackFunction {
  return ({ text }) => generateModularFeedback(lang, text, result, modulus)
}
