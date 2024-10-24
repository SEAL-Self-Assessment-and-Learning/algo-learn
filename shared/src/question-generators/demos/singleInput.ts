import { FreeTextQuestion, QuestionGenerator } from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import Random from "@shared/utils/random"
import { t, tFunctional, Translations } from "@shared/utils/translations"

/**
 * All displayed text goes into the translations object.
 * Include at least english and german.
 */
const translations: Translations = {
  en: {
    name: "Single Input Question",
    description: "Compute the sum of two integers",
    text: "Let ${{0}}$ and ${{1}}$ be two natural numbers. What is the **sum** ${{0}}+{{1}}$?",
  },
  de: {
    name: "Frage mit einem Eingabefeld",
    description: "Berechne die Summe zweier Zahlen",
    text: "Seien ${{0}}$ und ${{1}}$ zwei natürliche Zahlen. Was ist die **Summe** ${{0}}+{{1}}$?",
  },
}

/**
 * This question generator generates a simple multiple choice question.
 */
export const DemoSingleInput: QuestionGenerator = {
  id: "demosi",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["demo"],
  languages: ["en", "de"],
  license: "MIT",
  expectedParameters: [],

  /**
   * Generates a new MultipleChoiceQuestion question.
   *
   * @param lang The language of the question
   * @param parameters The parameters for the question. In this case none are used.
   * @param seed The seed for the random number generator
   * @returns A new MultipleChoiceQuestion question
   */
  generate: (lang = "en", parameters, seed) => {
    // initialize the RNG so the question can be generated again
    const random = new Random(seed)

    // generate the question values
    const a = random.int(5, 15)
    const b = random.int(5, 15)
    const correctAnswer = a + b

    // generate the question object
    const question: FreeTextQuestion = {
      type: "FreeTextQuestion",
      name: DemoSingleInput.name(lang),
      path: serializeGeneratorCall({
        generator: DemoSingleInput,
        lang,
        parameters,
        seed,
      }),
      text: t(translations, lang, "text", [`${a}`, `${b}`]),
      feedback: (answer) => {
        return { correct: parseInt(answer.text) === a + b, correctAnswer: `${correctAnswer}` }
      },
    }

    return {
      question,
      // allows for unit tests
      testing: {
        a,
        b,
        correctAnswer,
      },
    }
  },
}
