import { Language } from "../../api/Language"
import { 
  FreeTextFeedbackFunction, 
  FreeTextQuestion, 
  QuestionGenerator } from "../../api/QuestionGenerator"
import { serializeGeneratorCall } from "../../api/QuestionRouter"
import Random from "../../utils/random"
import { t, tFunctional, Translations } from "../../utils/translations"

const translations: Translations = {
  en: {
    name: "Modular Arithmetic",
    description: "Find an integer that satisfies a given modular arithmetic equation.",
    question: "Find an integer $x$ such that $x ≡ {{a}} \\pmod{ {{b}} }$.",
    prompt: "Enter your answer here:",
    bottomText: "Remember, $x$ must satisfy the equation $x ≡ a \\pmod{ b }$.",
    feedback_invalid: "Your answer is not a valid number.",
    feedback_correct: "Correct! ${{x}}$ satisfies the equation $x ≡ {{a}} \\pmod{ {{b}} }$.",
    feedback_incorrect: "Incorrect. The answer must satisfy: $x ≡ {{a}} \\pmod{ {{b}} }$.",
  },
  de: {
    name: "Modulare Arithmetik",
    description: "Finde eine ganze Zahl, die eine gegebene Modulare Gleichung erfüllt.",
    question: "Finde eine ganze Zahl $x$, so dass $x ≡ {{a}} \\pmod{ {{b}} }$.",
    prompt: "Geben Sie Ihre Antwort hier ein:",
    bottomText: "Erinnern Sie sich, dass $x$ die Gleichung $x ≡ a \\pmod{ b }$ erfüllen muss.",
    feedback_invalid: "Ihre Antwort ist keine gültige Zahl.",
    feedback_correct: "Richtig! ${{x}}$ erfüllt die Gleichung $x ≡ {{a}} \\pmod{ {{b}} }$.",
    feedback_incorrect: "Falsch. Die Antwort muss die Gleichung $x ≡ {{a}} \\pmod{ {{b}} }$ erfüllen.",
  },
}

/**
 * This question generator generates a modular arithmetic question with free-text input field.
 */
export const ModularArithmetic: QuestionGenerator = {
  id: "modarith",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["basic math", "modular arithmetic", "modulus", "mod", "arithmetic"],
  languages: ["en", "de"],
  author: "Janette Welker",
  license: "MIT",
  expectedParameters: [],

  /**
   * Generates a new Modular Arithmetic free-text question.
   *
   * @param lang The language of the question
   * @param parameters The parameters for the question
   * @param seed The random seed
   * @returns A new free-text question
   */
  generate: (lang = "en", parameters, seed) => {
    const path = serializeGeneratorCall({
      generator: ModularArithmetic,
      lang,
      parameters,
      seed,
    })

    const random = new Random(seed)
    const a = random.int(0, 19)
    const b = random.int(2, 20)

    return {
      question: makeModularArithmeticQuestion(lang, path, a, b),
      testing: {
        a,
        b,
      },
    }
  },
}

function makeModularArithmeticQuestion(
  lang: Language,
  path: string,
  a: number,
  b: number,
): FreeTextQuestion {
  return {
    type: "FreeTextQuestion",
    name: ModularArithmetic.name(lang),
    path: path,
    text: t(translations, lang, "question", { a: String(a), b: String(b) }),
    prompt: t(translations, lang, "prompt"),
    bottomText: t(translations, lang, "bottomText"),
    feedback: getModularFeedbackFunction(lang,a,b),
  }
}

function getModularFeedbackFunction(
  lang: Language,
  a: number, 
  b: number
): FreeTextFeedbackFunction {
  return ({ text }) => {
    // parse to Float to correctly recognize non-integer numbers
    const userAnswer = parseFloat(text.trim())

    if (isNaN(userAnswer) || !Number.isInteger(userAnswer)) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "feedback_invalid"),
      }
    }

    if ((userAnswer - a) % b === 0) {
      return {
        correct: true,
        feedbackText: t(translations, lang, "feedback_correct", { x: String(userAnswer), a: String(a), b: String(b) }),
      }
    } else {
      return {
        correct: false,
        feedbackText: t(translations, lang, "feedback_incorrect", { a: String(a), b: String(b) }),
      }
    }
  }
}
