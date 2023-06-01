import Random from "../../utils/random"
import { tFunctional, tFunction, Translations } from "../../utils/translations"
import {
  MultipleChoiceQuestion,
  QuestionGenerator,
  minimalMultipleChoiceFeedback,
} from "../../api/QuestionGenerator"
import { pathOf } from "../../utils/QuestionRouter"

const translations: Translations = {
  en_US: {
    title: "Compute a sum",
    description: "Compute the sum of two integers",
    text: "Let {{0}} and {{1}} be two natural numbers. What is the **sum** {{2}}?",
    seedDescription: "Seed for the random number generator",
  },
  de_DE: {
    title: "Summe berechnen",
    description: "Berechne die Summe zweier Zahlen",
    text: "Seien {{0}} und {{1}} zwei natürliche Zahlen. Was ist die **Summe** {{2}}?",
    seedDescription: "Seed für den Zufallsgenerator",
  },
}

/** This question generator generates a simple multiple choice question. */
export const TestQuestion: QuestionGenerator = {
  path: "asymptotics/sum",
  name: tFunctional(translations, "title"),
  description: tFunctional(translations, "description"),
  tags: ["calculus", "sum"],
  languages: ["en_US", "de_DE"],
  author: "Max Mustermann",
  license: "MIT",
  link: "https://example.com",
  allowedParameters: [
    {
      name: "seed",
      type: "string",
      description: tFunctional(translations, "seedDescription"),
    },
  ],
  /**
   * Generates a new SimpleMCTest question.
   *
   * @param props
   * @param props.seed The seed for the random number generator
   * @param lang The language of the question
   * @returns A new SimpleMCTest question
   */
  generate: (parameters, lang = "en_US") => {
    const { seed } = parameters
    const random = new Random(seed)

    const a = random.int(2, 10)
    const b = random.int(2, 10)
    const correctAnswer = a + b
    const answers = [
      `$${correctAnswer}$`,
      `$${correctAnswer + 1}$`,
      `$${correctAnswer - 1}$`,
    ]
    for (let i = 0; i < 1000; i++) {
      const c = random.int(4, 20)
      if (answers.findIndex((a) => a === `$${c}$`) === -1) {
        answers.push(`$${c}$`)
        break
      }
    }
    random.shuffle(answers)
    const correctAnswerIndex = answers.findIndex(
      (a) => a === `$${correctAnswer}$`
    )

    const { t } = tFunction(translations, lang)

    const question: MultipleChoiceQuestion = {
      type: "MultipleChoiceQuestion",
      name: TestQuestion.name(lang),
      path: pathOf(TestQuestion, lang, parameters),
      text: t("text", [`$${a}$`, `$${b}$`, `$${a}+${b}$`]),
      answers,
      feedback: minimalMultipleChoiceFeedback({ correctAnswerIndex }),
    }

    return {
      question,
      a, // only added for possible unit tests
      b, // only added for possible unit tests
      correctAnswer, // only added for possible unit tests
      correctAnswerIndex, // only added for possible unit tests
    }
  },
}
