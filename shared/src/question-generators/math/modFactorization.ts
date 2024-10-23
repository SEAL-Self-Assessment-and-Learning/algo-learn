import { Language } from "@shared/api/Language"
import {
  FreeTextFeedbackFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { generateFactors, modularExponentiation } from "@shared/question-generators/math/utils"
import Random from "@shared/utils/random"
import { t, tFunctional, Translations } from "@shared/utils/translations"

const translations: Translations = {
  en: {
    name: "Modular Arithmetic with Factorization",
    description: "Answer modular arithmetic questions with large numbers using factorization.",
    factorLargeNumberQuestion: "Find $x \\equiv {{x}} \\pmod{{{n}}}$ using the factors of $x$.",
    factorMultiplicationQuestion: "Simplify ${{a}} \\times {{b}} \\pmod{{{n}}}$ using factorization.",
    factorLargeExponentQuestion:
      "Simplify ${{base}}^{{{exp}}} \\pmod{{{n}}}$ by breaking the exponent into factors.",
    bottomText: "Give $x$ such that $0\\leq x < {{n}}$ and $x\\in\\mathbb{N}$.",
    feedbackInvalid: "Your answer is not valid.",
    feedbackCorrect: "Correct!",
    feedbackIncorrect:
      "Incorrect. The correct answer is: ${{correctAnswer}}$. Possible Simplification: ${{calculation}}$.",
  },
  de: {
    name: "Modulare Arithmetik mit Faktorisierung",
    description:
      "Beantworte Fragen zur modularen Arithmetik mit großen Zahlen mit Hilfe von Faktorisierung.",
    factorLargeNumberQuestion:
      "Finde $x \\equiv {{x}} \\pmod{{{n}}}$ indem du die Faktoren von $x$ verwendest.",
    factorMultiplicationQuestion:
      "Vereinfache ${{a}} \\times {{b}} \\pmod{{{n}}}$ durch Faktorisierung.",
    factorLargeExponentQuestion:
      "Vereinfache ${{base}}^{{{exp}}} \\pmod{{{n}}}$ durch Faktorisierung des Exponenten.",
    bottomText: "Gib $x$ so an, dass $0 \\leq x < {{n}}$ und $x \\in \\mathbb{N}$.",
    feedbackInvalid: "Deine Antwort ist ungültig.",
    feedbackCorrect: "Richtig!",
    feedbackIncorrect:
      "Falsch. Die richtige Antwort ist: ${{correctAnswer}}$. Mögliche Vereinfachung: ${{calculation}}$.",
  },
}

export const modFactor: QuestionGenerator = {
  id: "modfactor",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["factorization", "modulus", "arithmetic"],
  languages: ["en", "de"],
  author: "Janette Welker",
  license: "MIT",
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["large_number", "large_exponent", "multiplication"],
    },
  ],

  generate: (lang, parameters, seed) => {
    const path = serializeGeneratorCall({
      generator: modFactor,
      lang,
      parameters,
      seed,
    })

    const random = new Random(seed)
    const variant = parameters.variant as "large_number" | "large_exponent" | "multiplication"

    switch (variant) {
      case "large_number":
        return generateFactorLargeNumberQuestion(lang, path, random)
      case "multiplication":
        return generateFactorMultiplicationQuestion(lang, path, random)
      case "large_exponent":
        return generateFactorLargeExponentQuestion(lang, path, random)
      default:
        throw new Error("Unknown variant")
    }
  },
}

// Large number
function generateFactorLargeNumberQuestion(lang: Language, path: string, random: Random) {
  const n = random.int(2, 20)
  const factors = generateFactors(random, 2, 3, 10, 50)
  const x = factors.reduce((acc, factor) => acc * factor, 1)
  const calculation =
    factors.map((factor) => `(${factor} \\pmod{${n}})`).join(" \\times ") + ` \\equiv ${x % n}`

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: modFactor.name(lang),
    path: path,
    text: t(translations, lang, "factorLargeNumberQuestion", { x: String(x), n: String(n) }),
    prompt: `$x \\equiv $`,
    bottomText: t(translations, lang, "bottomText"),
    feedback: generateModularFeedback(lang, x, n, calculation),
  }

  return { question, testing: { x, n, calculation } }
}

// Modular multiplication
function generateFactorMultiplicationQuestion(lang: Language, path: string, random: Random) {
  // sample desired result between (0,n-1) for less repetitive solutions
  const n = random.int(2, 20)
  const result = random.int(0, n - 1)

  let a, b
  let factorsA, factorsB

  // try generating factors until desired result is achieved
  let attempts = 0
  const maxAttempts = 1000
  let allowOneAsFactor = false

  do {
    factorsA = generateFactors(random, 2, 3, allowOneAsFactor ? 1 : 2, 50)
    factorsB = generateFactors(random, 2, 3, allowOneAsFactor ? 1 : 2, 50)
    a = factorsA.reduce((acc, factor) => acc * factor, 1)
    b = factorsB.reduce((acc, factor) => acc * factor, 1)
    attempts++

    if (attempts >= maxAttempts) {
      allowOneAsFactor = true
    }
  } while ((a * b) % n !== result && attempts < maxAttempts + 1000)
  if ((a * b) % n !== result) {
    throw new Error(
      `Timeout at factor generation after ${maxAttempts + 1000} attempts`,
    )
  }

  const calculationA = factorsA
    .filter((factor) => factor !== 1)
    .map((factor) => `${factor}`)
    .join(" \\cdot ")
  const calculationB = factorsB
    .filter((factor) => factor !== 1)
    .map((factor) => `${factor}`)
    .join(" \\cdot ")
  const calculation = `(${calculationA}) \\cdot (${calculationB}) \\pmod{${n}} \\equiv ${result}`

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: modFactor.name(lang),
    path: path,
    text: t(translations, lang, "factorMultiplicationQuestion", {
      a: String(a),
      b: String(b),
      n: String(n),
    }),
    prompt: `$x \\equiv $`,
    bottomText: t(translations, lang, "bottomText"),
    feedback: generateModularFeedback(lang, result, n, calculation),
  }

  return { question, testing: { a, b, n, calculation, result } }
}

// Large exponent
function generateFactorLargeExponentQuestion(lang: Language, path: string, random: Random) {
  const base = random.int(2, 10)
  const n = random.int(2, 20)
  const factors = generateFactors(random)
  const exp = factors.reduce((acc, factor) => acc * factor, 1)
  const result = ((modularExponentiation(base, exp, n) % n) + n) % n
  const calculation =
    factors.map((factor) => `(${base}^${factor} \\pmod{${n}})`).join(" \\times ") + ` \\equiv ${result}`

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: modFactor.name(lang),
    path: path,
    text: t(translations, lang, "factorLargeExponentQuestion", {
      base: String(base),
      exp: String(exp),
      n: String(n),
    }),
    prompt: `$x \\equiv $`,
    bottomText: t(translations, lang, "bottomText"),
    feedback: generateModularFeedback(lang, result, n, calculation),
  }

  return { question, testing: { base, exp, n, factors, result } }
}

// Modular feedback
function generateModularFeedback(
  lang: Language,
  value: number,
  modulus: number,
  calculation: string,
): FreeTextFeedbackFunction {
  return ({ text }) => {
    const userAnswer = parseFloat(text.trim())

    if (isNaN(userAnswer) || !Number.isInteger(userAnswer)) {
      return { correct: false, feedbackText: t(translations, lang, "feedbackInvalid") }
    }

    const normalizedCorrectAnswer = ((value % modulus) + modulus) % modulus
    const normalizedUserAnswer = ((userAnswer % modulus) + modulus) % modulus

    if (normalizedUserAnswer === normalizedCorrectAnswer) {
      return { correct: true, feedbackText: t(translations, lang, "feedbackCorrect") }
    } else {
      return {
        correct: false,
        feedbackText: t(translations, lang, "feedbackIncorrect", {
          correctAnswer: normalizedCorrectAnswer.toString(),
          calculation: calculation,
        }),
      }
    }
  }
}
