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
    expQuestionSuccessiveSquaring: "Calculate ${{a}}^{{{b}}} \\pmod{ {{n}} }$.",
    bottomTextSuccessiveSquaring: "Try using successive squaring to simplify the calculation.",
    expQuestionFermat: "Calculate ${{a}}^{{{b}}} \\pmod{ {{n}} }$.",
    bottomTextFermat: "Try using Fermat's Little Theorem to reduce the exponent.",
    simpleQuestion: "Find an integer $x$ such that $x \\equiv {{a}} \\pmod{ {{b}} }$.",
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
    expQuestionSuccessiveSquaring: "Berechne ${{a}}^{{{b}}} \\pmod{ {{n}} }$.",
    bottomTextSuccessiveSquaring: "Sukzessives Quadrieren könnte die Berechnung vereinfachen.",
    successiveSquaringExplanation: "Sukzessives Quadrieren kann die Berechnung zu vereinfachen.",
    expQuestionFermat: "Berechne ${{a}}^{{{b}}} \\pmod{ {{n}} }$.",
    bottomTextFermat:
      "Der kleine Satz von Fermat kann verwendet werden um den Exponenten zu reduzieren.",
    simpleQuestion: "Finde eine ganze Zahl $x$, so dass $x \\equiv {{a}} \\pmod{ {{b}} }$.",
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

// helper for feedback functions with normalization
function generateModularFeedback(
  lang: Language,
  userAnswerText: string,
  correctValue: number,
  modulus: number,
): FreeTextFeedback {
  const userAnswer = parseFloat(userAnswerText.trim())

  if (isNaN(userAnswer) || !Number.isInteger(userAnswer)) {
    return { correct: false, feedbackText: t(translations, lang, "feedbackInvalid") }
  }

  // ensure comparison in range [0, modulus-1]
  const normalizedCorrectAnswer = ((correctValue % modulus) + modulus) % modulus
  const normalizedUserAnswer = ((userAnswer % modulus) + modulus) % modulus

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
    bottomText: t(translations, lang, "bottomTextSuccessiveSquaring"),
    feedback: getSuccessiveSquaringFeedback(lang, base, exponent, modulus, result),
  }

  return { question, testing: { base, exponent, modulus, result } }
}

function getSuccessiveSquaringFeedback(
  lang: Language,
  base: number,
  exponent: number,
  modulus: number,
  correctValue: number,
): FreeTextFeedbackFunction {
  return ({ text }) => {
    const userFeedback = generateModularFeedback(lang, text, correctValue, modulus)

    if (!userFeedback.correct) {
      const calculation = generateCalc(base, exponent, modulus)
      userFeedback.feedbackText += ` ${calculation}`
    }

    return userFeedback
  }
}

function generateCalc(base: number, exponent: number, modulus: number): string {
  const binaryExponent = exponent.toString(2)
  let result = 1
  let currentBase = base % modulus
  let powers: string[] = []

  for (let i = 0; i < binaryExponent.length; i++) {
    const bit = binaryExponent[binaryExponent.length - 1 - i]
    if (bit === "1") {
      result = (result * currentBase) % modulus
      powers.unshift(`${base}^{${2 ** i}}`)
    }
    currentBase = (currentBase * currentBase) % modulus
  }

  return `$(${exponent})_2 = ${binaryExponent} \\leadsto ( (${powers.join("\\times")}) \\pmod{${modulus}}) \\equiv ${result}$`
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
    bottomText: t(translations, lang, "bottomTextFermat"),
    feedback: getFermatFeedbackFunction(lang, result, primeModulus, reducedExponent, exponent),
  }

  return { question, testing: { base, exponent, primeModulus, result, reducedExponent } }
}

function getFermatFeedbackFunction(
  lang: Language,
  correctValue: number,
  modulus: number,
  reducedExponent: number,
  originalExponent: number,
): FreeTextFeedbackFunction {
  return ({ text }) => {
    const feedback = generateModularFeedback(lang, text, correctValue, modulus)

    if (!feedback.correct) {
      feedback.feedbackText += `$ ${originalExponent} \\eqiv ${reducedExponent} \pmod{${modulus - 1}}$.`
    }

    return feedback
  }
}
