import type { Language } from "../../../api/Language.ts"
import type {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "../../../api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "../../../api/QuestionRouter.ts"
import Random from "../../../utils/random.ts"
import { t, tFunctional, type Translations } from "../../../utils/translations.ts"
import { areCoprime, solveCRT } from "./utils.ts"

const translations: Translations = {
  en: {
    name: "Chinese Remainder Theorem",
    description: "Solve systems of congruences using the Chinese Remainder Theorem.",
    crtQuestion: "Solve the system of congruences: \\[ {{text}} \\text{.}\\]",
    crtBottomText: "Provide your answer in the form: $y\\pmod{z}$.",
    feedbackInvalid: "Your answer is not valid.",
    feedbackIncomplete: "Incomplete or too complex",
  },
  de: {
    name: "Chinesischer Restsatz",
    description: "Lösen Sie Systeme von Kongruenzen mit dem Chinesischen Restsatz.",
    crtQuestion: "Löse das System von Kongruenzen: \\[ {{text}} \\text{.}\\]",
    crtBottomText: "Gib deine Antwort in der Form $y\\pmod{z}$ an.",
    feedbackInvalid: "Deine Antwort ist ungültig.",
    feedbackIncomplete: "Nicht vollständig oder zu komplex",
  },
}

export const CRT: QuestionGenerator = {
  id: "crt",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["modular arithmetic", "Chinese Remainder Theorem", "crt"],
  languages: ["en", "de"],
  author: "Janette Welker",
  license: "MIT",
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["rand", "2", "3", "4"],
    },
  ],

  generate: (lang, parameters, seed) => {
    const path = serializeGeneratorCall({
      generator: CRT,
      lang,
      parameters,
      seed,
    })

    const random = new Random(seed)
    let numCongruences: number

    if (parameters.variant === "rand") {
      numCongruences = random.int(2, 4)
    } else if (parameters.variant === "2") {
      numCongruences = 2
    } else if (parameters.variant === "3") {
      numCongruences = 3
    } else if (parameters.variant === "4") {
      numCongruences = 4
    } else {
      throw new Error("Unknown variant")
    }

    return generateCRTQuestion(lang, path, random, numCongruences)
  },
}

function generateCRTQuestion(lang: Language, path: string, random: Random, numCongruences: number) {
  const congruences: { a: number; n: number }[] = []
  const text: string[] = []

  // generate system of congruences
  for (let i = 0; i < numCongruences; i++) {
    let a = random.int(1, 20)
    let n: number

    // find new modulus that is coprime to preceding moduli
    do {
      n = random.int(2, 20)
    } while (congruences.some(({ n: precedingModulus }) => !areCoprime(n, precedingModulus)))

    a = ((a % n) + n) % n // a should be within the range [0, n-1]
    congruences.push({ a, n })
    text.push(`x \\equiv ${a} \\pmod{ ${n} }`)
  }

  const crtValue = solveCRT(congruences)
  const commonModulus = congruences.reduce((acc, { n }) => acc * n, 1)

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: CRT.name(lang),
    path: path,
    text: t(translations, lang, "crtQuestion", { text: text.join(", \\\\") }),
    prompt: `$x \\equiv $`,
    bottomText: t(translations, lang, "crtBottomText"),
    feedback: getCRTFeedbackFunction(lang, crtValue, commonModulus),
    checkFormat: getCRTCheckFormatFunction(lang),
  }

  return { question, testing: { crtValue, commonModulus } }
}

function getCRTCheckFormatFunction(lang: Language): FreeTextFormatFunction {
  return ({ text }) => {
    if (text.trim() === "") {
      return { valid: false, message: t(translations, lang, "feedbackIncomplete") }
    }

    // ensure format "$value (mod $modulus)" and inform user
    const pattern = /^(\d+)\s*\(\s*mod\s*(\d+)\s*\)$/i
    const match = text.trim().match(pattern)
    return match
      ? { valid: true }
      : { valid: false, message: t(translations, lang, "feedbackIncomplete") }
  }
}

function getCRTFeedbackFunction(
  lang: Language,
  crtValue: number,
  commonModulus: number,
): FreeTextFeedbackFunction {
  return ({ text }) => {
    // match "y (mod z)" (optional whitespaces) and capture y and z
    const pattern = /^(\d+)\s*\(\s*mod\s*(\d+)\s*\)$/i
    const match = text.trim().match(pattern)

    // dismiss incorrectly formatted answers
    if (!match) {
      return { correct: false, feedbackText: t(translations, lang, "feedbackInvalid") }
    }

    // y: userValue and z: userModulus
    let userValue = parseInt(match[1], 10)
    const userModulus = parseInt(match[2], 10)

    // normalize to range [0, commonModulus]
    userValue = ((userValue % commonModulus) + commonModulus) % commonModulus
    crtValue = ((crtValue % commonModulus) + commonModulus) % commonModulus

    const isCorrect = userModulus === commonModulus && userValue === crtValue

    return {
      correct: isCorrect,
      correctAnswer: isCorrect ? "" : `$x \\equiv ${crtValue} \\pmod{ ${commonModulus} }$`,
    }
  }
}
