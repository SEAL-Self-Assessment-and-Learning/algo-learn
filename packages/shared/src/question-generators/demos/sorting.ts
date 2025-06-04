import {
  minimalMultipleChoiceFeedback,
  type MultipleChoiceQuestion,
  type QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import Random from "@shared/utils/random"
import { t, tFunctional, type Translations } from "@shared/utils/translations"

/**
 * All displayed text goes into the translations object.
 * Include at least english and german.
 */
const translations: Translations = {
  en: {
    name: "Sorting Question",
    description: "Sort numbers",
    text: "Sort the following numbers in ascending order.",
  },
  de: {
    name: "Sortierfrage",
    description: "Zahlen sortieren",
    text: "Sortiere die folgenden Zahlen in aufsteigender Reihenfolge.",
  },
}

/**
 * This question generator generates a sorting choice question.
 */
export const DemoSortingChoice: QuestionGenerator = {
  id: "demos",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["demo"],
  languages: ["en", "de"],
  license: "MIT",
  expectedParameters: [],

  /**
   * Generates a new SortingQuestion question.
   *
   * @param lang The language of the question
   * @param parameters The parameters for the question. In this case none are used.
   * @param seed The seed for the random number generator
   * @returns A new Sorting question
   */
  generate: (lang = "en", parameters, seed) => {
    // initialize the RNG so the question can be generated again
    const random = new Random(seed)
    const uniqueNumbers = random.subset(
      Array.from({ length: 50 }, (_, i) => i + 1),
      5,
    )

    // generate the question object
    const question: MultipleChoiceQuestion = {
      type: "MultipleChoiceQuestion",
      name: DemoSortingChoice.name(lang),
      path: serializeGeneratorCall({
        generator: DemoSortingChoice,
        lang,
        parameters,
        seed,
      }),
      sorting: true,
      text: t(translations, lang, "text"),
      answers: uniqueNumbers.map((x) => `$${x}$`),
      feedback: minimalMultipleChoiceFeedback({
        correctAnswerIndex: uniqueNumbers
          .map((x, index) => ({ index, x }))
          .sort((a, b) => a.x - b.x)
          .map(({ index }) => index),
        sorting: true,
      }),
    }

    return {
      question,
    }
  },
}
