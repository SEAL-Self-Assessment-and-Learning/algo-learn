import type { Language } from "@shared/api/Language"
import type {
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
} from "@shared/question-generators/math/modularArithmetic/utils"
import Random from "@shared/utils/random"
import { t, tFunctional, type Translations } from "@shared/utils/translations"

const translations: Translations = {
  en: {
    name: "Modular Arithmetic Tricks",
    description: "Answer questions involving modular arithmetic.",
    inverseQuestion: "Find the modular inverse of ${{a}}$ modulo ${{n}}$.",
    expQuestion: "Calculate $x \\equiv {{a}}^{{{b}}} \\pmod{ {{n}} }$.",
    expQuestionSuccessiveSquaring: "Calculate $x \\equiv {{a}}^{{{b}}} \\pmod{ {{n}} }$.",
    bottomTextSuccessiveSquaring: "Try using successive squaring to simplify the calculation.",
    expQuestionFermat: "Calculate $x \\equiv {{a}}^{{{b}}} \\pmod{ {{n}} }$.",
    bottomTextFermat: "Try using Fermat's Little Theorem to reduce the exponent.",
    simpleQuestion: "Find an integer $x$ such that $x \\equiv {{a}} \\pmod{ {{b}} }$.",
    feedbackInvalid: "Your answer is not valid.",
    via: "Simplification:",
    feedbackIncomplete: "Incomplete or too complex",
  },
  de: {
    name: "Modulare Arithmetik Tricks",
    description: "Beantworte Fragen zur modularen Arithmetik.",
    inverseQuestion: "Finde das Inverse von ${{a}}$ modulo ${{n}}$.",
    expQuestion: "Berechne $x \\equiv {{a}}^{{{b}}} \\pmod{ {{n}} }$.",
    expQuestionSuccessiveSquaring: "Berechne $x \\equiv {{a}}^{{{b}}} \\pmod{ {{n}} }$.",
    bottomTextSuccessiveSquaring: "Sukzessives Quadrieren könnte die Berechnung vereinfachen.",
    successiveSquaringExplanation: "Sukzessives Quadrieren kann die Berechnung zu vereinfachen.",
    expQuestionFermat: "Berechne $x \\equiv {{a}}^{{{b}}} \\pmod{ {{n}} }$.",
    bottomTextFermat:
      "Der kleine Satz von Fermat kann verwendet werden um den Exponenten zu reduzieren.",
    simpleQuestion: "Finde eine ganze Zahl $x$, so dass $x \\equiv {{a}} \\pmod{ {{b}} }$.",
    feedbackInvalid: "Deine Antwort ist ungültig.",
    via: "Vereinfachung:",
    feedbackCorrect: "Richtig!",
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
      allowedValues: [
        "simple",
        "inverse",
        "exponentiation",
        "successiveSquaring",
        "fermatExponentiation",
      ],
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
    const variant = parameters.variant as
      | "simple"
      | "inverse"
      | "exponentiation"
      | "successiveSquaring"
      | "fermatExponentiation"

    let question
    let testing

    switch (variant) {
      case "simple":
        ;({ question, testing } = generateSimpleQuestion(lang, path, random))
        break
      case "inverse":
        ;({ question, testing } = generateInverseQuestion(lang, path, random))
        break
      case "exponentiation":
        ;({ question, testing } = generateExponentiationQuestion(lang, path, random))
        break
      case "successiveSquaring":
        ;({ question, testing } = generateSuccessiveSquaringQuestion(lang, path, random))
        break
      case "fermatExponentiation":
        ;({ question, testing } = generateFermatExponentiationQuestion(lang, path, random))
        break
      default:
        throw new Error("Unknown variant")
    }

    return {
      question,
      testing,
    }
  },
}

// Simple
function generateSimpleQuestion(lang: Language, path: string, random: Random) {
  let a, b
  // solutions should not be the same as the question
  do {
    a = random.int(3, 30)
    b = random.int(2, a - 1)
  } while (a % b === a)

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: ModTricks.name(lang),
    path: path,
    text: t(translations, lang, "simpleQuestion", { a: String(a), b: String(b) }),
    prompt: `$x \\equiv $`,
    feedback: getSimpleFeedbackFunction(lang, a, b),
  }

  return { question, testing: { a, b } }
}

// Inverse
function generateInverseQuestion(lang: Language, path: string, random: Random) {
  let a, n
  do {
    a = random.int(2, 15)
    n = random.int(2, 20)
  } while (gcd(a, n) !== 1)

  const inverse = calculateModularInverse(a, n)!

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: ModTricks.name(lang),
    path: path,
    text: t(translations, lang, "inverseQuestion", { a: String(a), n: String(n) }),
    feedback: getInverseFeedbackFunction(lang, inverse, n),
  }

  return { question, testing: { a, n, inverse } }
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
    prompt: `$x \\equiv $`,
    text: t(translations, lang, "expQuestion", { a: String(a), b: String(b), n: String(n) }),
    feedback: getExponentiationFeedbackFunction(lang, result, n),
  }

  return { question, testing: { a, b, n, result } }
}

// Successive Squaring
function generateSuccessiveSquaringQuestion(lang: Language, path: string, random: Random) {
  const base = random.int(2, 10)
  const modulus = random.choice([5, 7, 11, 13, 17, 19])
  const exponent = random.int(10, 100)
  const result = modularExponentiation(base, exponent, modulus)

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: ModTricks.name(lang),
    path: path,
    text: t(translations, lang, "expQuestionSuccessiveSquaring", {
      a: String(base),
      b: String(exponent),
      n: String(modulus),
    }),
    prompt: `$x \\equiv $`,
    bottomText: t(translations, lang, "bottomTextSuccessiveSquaring"),
    feedback: getSuccessiveSquaringFeedback(lang, base, exponent, modulus, result),
  }

  return { question, testing: { base, exponent, modulus, result } }
}

// Fermat Exponentiation
function generateFermatExponentiationQuestion(lang: Language, path: string, random: Random) {
  const base = random.int(2, 10)
  const primeModulus = random.choice([5, 7, 11, 13, 17, 19])
  const exponent = random.int(1, 100)
  const reducedExponent = exponent % (primeModulus - 1)
  const result = modularExponentiation(base, reducedExponent, primeModulus)

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: ModTricks.name(lang),
    path: path,
    text: t(translations, lang, "expQuestionFermat", {
      a: String(base),
      b: String(exponent),
      n: String(primeModulus),
    }),
    prompt: `$x \\equiv $`,
    bottomText: t(translations, lang, "bottomTextFermat"),
    feedback: getFermatFeedbackFunction(lang, result, primeModulus, reducedExponent, exponent),
  }

  return { question, testing: { base, exponent, primeModulus, result, reducedExponent } }
}

function generateModularFeedback(
  lang: Language,
  userAnswerText: string,
  correctValue: number,
  modulus: number,
  extraFeedback: string = "",
): FreeTextFeedback {
  const userAnswer = parseFloat(userAnswerText.trim())

  if (isNaN(userAnswer) || !Number.isInteger(userAnswer)) {
    return { correct: false, feedbackText: t(translations, lang, "feedbackInvalid") }
  }

  const normalizedCorrectAnswer = ((correctValue % modulus) + modulus) % modulus
  const normalizedUserAnswer = ((userAnswer % modulus) + modulus) % modulus

  const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer

  return {
    correct: isCorrect,
    correctAnswer: isCorrect ? "" : `$${normalizedCorrectAnswer}$ ${extraFeedback}`,
  }
}

// Simple Feedback
function getSimpleFeedbackFunction(lang: Language, a: number, b: number): FreeTextFeedbackFunction {
  return ({ text }) => generateModularFeedback(lang, text, a, b)
}

// Inverse Feedback
function getInverseFeedbackFunction(
  lang: Language,
  correctValue: number,
  modulus: number,
): FreeTextFeedbackFunction {
  return ({ text }) => generateModularFeedback(lang, text, correctValue, modulus)
}

// Exponentiation Feedback
function getExponentiationFeedbackFunction(
  lang: Language,
  correctValue: number,
  modulus: number,
): FreeTextFeedbackFunction {
  return ({ text }) => generateModularFeedback(lang, text, correctValue, modulus)
}

// Successive Squaring Feedback
function getSuccessiveSquaringFeedback(
  lang: Language,
  base: number,
  exponent: number,
  modulus: number,
  correctValue: number,
): FreeTextFeedbackFunction {
  return ({ text }) => {
    const calculation = generateCalc(base, exponent, modulus)
    const extraFeedback = ` ( ${t(translations, lang, "via")} ${calculation} )`
    return generateModularFeedback(lang, text, correctValue, modulus, extraFeedback)
  }
}

// for succSquare feedback
function generateCalc(base: number, exponent: number, modulus: number): string {
  const binaryExponent = exponent.toString(2)
  let result = 1
  let currentBase = base % modulus
  const powers: string[] = []

  for (let i = 0; i < binaryExponent.length; i++) {
    const bit = binaryExponent[binaryExponent.length - 1 - i]
    if (bit === "1") {
      result = (result * currentBase) % modulus
      powers.unshift(`${base}^{${2 ** i}}`)
    }
    currentBase = (currentBase * currentBase) % modulus
  }

  return `$(${exponent})_2 = ${binaryExponent} \\leadsto (${powers.join("\\cdot")}) \\pmod{${modulus}} \\equiv ${result}$`
}

// Fermat Exponentiation Feedback
function getFermatFeedbackFunction(
  lang: Language,
  correctValue: number,
  modulus: number,
  reducedExponent: number,
  originalExponent: number,
): FreeTextFeedbackFunction {
  const extraFeedback = ` ( ${t(translations, lang, "via")} $${originalExponent} \\equiv ${reducedExponent} \\pmod{${modulus - 1}}$ )`
  return ({ text }) => generateModularFeedback(lang, text, correctValue, modulus, extraFeedback)
}
