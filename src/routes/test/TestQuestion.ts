import Random from "../../utils/random"
import {
  QuestionGenerator,
  MultipleChoiceQuestion,
  MultipleChoiceAnswer,
  MultipleChoiceFeedback,
} from "./QuestionGenerator"
import { Translations, tFunctional, tFunction } from "./Translations"

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

interface TestQuestion extends MultipleChoiceQuestion {
  a: number
  b: number
  correctAnswerIndex: number
}

/** This question generator generates a simple multiple choice question. */
export const TestQuestion: QuestionGenerator<TestQuestion> = {
  path: "asymptotics/sum",
  name: tFunctional(translations, "title"),
  description: tFunctional(translations, "description"),
  tags: ["calculus", "sum"],
  languages: ["en_US", "de_DE"],
  author: "Max Mustermann",
  version: "1.0.0",
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
  generate: ({ seed }, lang = "en_US"): TestQuestion => {
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

    return {
      type: "MultipleChoiceQuestion",
      lang,
      name: TestQuestion.name(lang),
      path: TestQuestion.path,
      parameters: { seed, lang },
      text: t("text", [`$${a}$`, `$${b}$`, `$${a}+${b}$`]),
      a,
      b,
      answers,
      correctAnswerIndex: correctAnswerIndex,
      allowMultipleAnswers: false,
    }
  },
  /**
   * The user has answered this question. This function checks the answer and
   * returns feedback, including the correct solution.
   *
   * @param answer The answer(s) of the user
   * @returns Feedback for the user
   */
  feedback: (
    question: TestQuestion,
    answer: MultipleChoiceAnswer
  ): MultipleChoiceFeedback => {
    // TODO: Use question.lang and fill in the translations
    if (
      answer.checked.length === 1 &&
      answer.checked[0] === question.correctAnswerIndex
    ) {
      return {
        correct: true,
        correctAnswers: [question.correctAnswerIndex],
        feedbackText: "Correct!",
      }
    }
    return {
      correct: false,
      correctAnswers: [question.correctAnswerIndex],
      feedbackText: `The correct answer is $${
        question.answers[question.correctAnswerIndex]
      }$.`,
    }
  },
}
