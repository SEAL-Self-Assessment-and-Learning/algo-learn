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
    description: "Sorting the equations based on their values.",
    text: "Sort the following sums in ascending order.",
  },
}

/**
 * Generates a list of number pairs that need to be sorted based on their sum.
 * Each pair's sum determines its correct order, ensuring that:
 * - No two pairs have the same sum.
 * - The sorting is uniquely defined by the sums.
 *
 * @returns A list of unique number pairs.
 */
function generateAdditionEquations(random: Random): [number, number][] {
  const pairs: [number, number][] = []
  const sums = new Set<number>()

  while (pairs.length < 5) {
    const a = random.int(1, 20)
    const b = random.int(1, 20)
    const sum = a + b
    if (!sums.has(sum)) {
      pairs.push([a, b])
      sums.add(sum)
    }
  }

  return pairs
}

/**
 * This question generator generates a simple multiple choice question.
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
    const pairs = generateAdditionEquations(random)

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
      answers: pairs.map(([a, b]) => `$${a} + ${b}$`),
      feedback: minimalMultipleChoiceFeedback({
        correctAnswerIndex: pairs
          .map((pair, index) => ({ index, sum: pair[0] + pair[1] }))
          .sort((a, b) => a.sum - b.sum)
          .map(({ index }) => index),
        sorting: true,
      }),
    }

    return {
      question,
    }
  },
}
