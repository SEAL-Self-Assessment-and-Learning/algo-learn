import {
  minimalMultipleChoiceFeedback,
  MultipleChoiceQuestion,
  QuestionGenerator,
} from "../../api/QuestionGenerator"
import { serializeGeneratorCall } from "../../api/QuestionRouter"
import Random from "../../utils/random"
import { tFunction, tFunctional, Translations } from "../../utils/translations"

const translations: Translations = {
  en: {
    name: "Compute a sum",
    description: "Compute the sum of two integers",
    text: "Let {{0}} and {{1}} be two natural numbers. What is the **sum** {{2}}?",
    seedDescription: "Seed for the random number generator",
  },
  de: {
    name: "Summe berechnen",
    description: "Berechne die Summe zweier Zahlen",
    text: "Seien {{0}} und {{1}} zwei natürliche Zahlen. Was ist die **Summe** {{2}}?",
    seedDescription: "Seed für den Zufallsgenerator",
  },
}

/** This question generator generates a simple multiple choice question. */
export const ExampleQuestion: QuestionGenerator = {
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["calculus", "sum"],
  languages: ["en", "de"],
  author: "Max Mustermann",
  license: "MIT",
  link: "https://example.com",
  expectedParameters: [],

  /**
   * Generates a new SimpleMCTest question.
   *
   * @param props
   * @param props.seed The seed for the random number generator
   * @param lang The language of the question
   * @returns A new SimpleMCTest question
   */
  generate: (generatorPath, lang = "en", parameters, seed) => {
    const random = new Random(seed)

    const a = random.int(2, 10)
    const b = random.int(2, 10)
    const correctAnswer = a + b
    const answers = [
      `$${correctAnswer}$`,
      `$${correctAnswer + 1}$`,
      `$${correctAnswer - 1}$`,
    ]

    let c
    do {
      c = random.int(4, 20)
    }
    while (answers.includes(`$${c}$`))
    answers.push(`$${c}$`)

    random.shuffle(answers)
    const correctAnswerIndex = answers.indexOf(`$${correctAnswer}$`)

    const { t } = tFunction(translations, lang)

    const question: MultipleChoiceQuestion = {
      type: "MultipleChoiceQuestion",
      name: ExampleQuestion.name(lang),
      path: serializeGeneratorCall({
        generator: ExampleQuestion,
        lang,
        parameters,
        seed,
        generatorPath,
      }),
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
