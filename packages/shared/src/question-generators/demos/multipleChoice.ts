import {
  minimalMultipleChoiceFeedback,
  type MultipleChoiceQuestion,
  type QuestionGenerator,
} from "../../api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "../../api/QuestionRouter.ts"
import Random from "../../utils/random.ts"
import { t, tFunctional, type Translations } from "../../utils/translations.ts"

/**
 * All displayed text goes into the translations object.
 * Include at least english and german.
 */
const translations: Translations = {
  en: {
    name: "Multiple Choice Question",
    description: "Compute the sum of two integers",
    text: "Let ${{0}}$ and ${{1}}$ be two natural numbers. What is the **sum** ${{0}}+{{1}}$?",
  },
  de: {
    name: "Multiple Choice Frage",
    description: "Berechne die Summe zweier Zahlen",
    text: "Seien ${{0}}$ und ${{1}}$ zwei natürliche Zahlen. Was ist die **Summe** ${{0}}+{{1}}$?",
  },
}

function generateWrongAnswers(random: Random, correctAnswer: number): Array<string> {
  const wrongAnswers = [
    `$${correctAnswer + 3}$`,
    `$${correctAnswer + 2}$`,
    `$${correctAnswer + 1}$`,
    `$${correctAnswer - 1}$`,
    `$${correctAnswer - 2}$`,
    `$${correctAnswer - 3}$`,
  ]

  return random.subset(wrongAnswers, 3)
}

/**
 * This question generator generates a simple multiple choice question.
 */
export const DemoMultipleChoice: QuestionGenerator = {
  id: "demomc",
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

    // get a set of wrong answers
    const answers = generateWrongAnswers(random, correctAnswer)

    // add the correct answer, shuffle and find the index of the correct answer
    answers.push(`$${correctAnswer}$`)
    random.shuffle(answers)
    const correctAnswerIndex = answers.indexOf(`$${correctAnswer}$`)

    // generate the question object
    const question: MultipleChoiceQuestion = {
      type: "MultipleChoiceQuestion",
      name: DemoMultipleChoice.name(lang),
      path: serializeGeneratorCall({
        generator: DemoMultipleChoice,
        lang,
        parameters,
        seed,
      }),
      text: t(translations, lang, "text", [`${a}`, `${b}`]),
      answers,
      feedback: minimalMultipleChoiceFeedback({ correctAnswerIndex }),
    }

    return {
      question,
      // allows for unit tests
      testing: {
        a,
        b,
        correctAnswer,
        correctAnswerIndex,
      },
    }
  },
}
