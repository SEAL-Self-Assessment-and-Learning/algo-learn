import { describe, expect, test } from "vitest"
import { MultiFreeTextQuestion, MultipleChoiceQuestion } from "@shared/api/QuestionGenerator.ts"
import { queueQuestion } from "@shared/question-generators/StackQueue/QueueGenerator.ts"
import { stackQuestion } from "@shared/question-generators/StackQueue/StackGenerator.ts"
import { sampleRandomSeed } from "../../utils/random"

interface TestingObjectMultiple {
  question: MultipleChoiceQuestion | MultiFreeTextQuestion
  testing: {
    allAnswers: string[]
    correctAnswerIndex: number[]
  }
}

interface TestingObjectFreetext {
  question: MultipleChoiceQuestion | MultiFreeTextQuestion
  testing: {
    correctAnswer: { [key: string]: string }
  }
}

describe("StackQueueGenerator - Correctness", () => {
  for (let i = 1; i <= 100; i++) {
    test(`${i}. Choice - random Stack-Generator question`, () => {
      const { question: q, testing: t } = stackQuestion.generate(
        "", // path not relevant here
        "en", // language not relevant
        {
          variant: "choice",
        },
        sampleRandomSeed(),
      ) as TestingObjectMultiple

      correctnessTestingObjectMultiple(q, t)
    })

    test(`${i}. FreeText - random Stack-Generator question`, () => {
      const { question: q, testing: t } = stackQuestion.generate(
        "", // path not relevant here
        "en", // language not relevant
        {
          variant: "input",
        },
        sampleRandomSeed(),
      ) as TestingObjectFreetext

      expect(q.type).toEqual("MultiFreeTextQuestion")
      expect(Object.keys(t.correctAnswer).length).toBeGreaterThanOrEqual(0)
    })

    test(`${i}. Choice - random Queue-Generator question`, () => {
      const { question: q, testing: t } = queueQuestion.generate(
        "", // path not relevant here
        "en", // language not relevant
        {
          variant: "choice",
        },
        sampleRandomSeed(),
      ) as TestingObjectMultiple

      correctnessTestingObjectMultiple(q, t)
    })

    test(`${i}. FreeText - random Queue-Generator question`, () => {
      const { question: q, testing: t } = queueQuestion.generate(
        "", // path not relevant here
        "en", // language not relevant
        {
          variant: "input",
        },
        sampleRandomSeed(),
      ) as TestingObjectFreetext

      expect(q.type).toEqual("MultiFreeTextQuestion")
      expect(Object.keys(t.correctAnswer).length).toBeGreaterThanOrEqual(0)
    })
  }
})

describe("StackQueueGenerator - Reproducible", () => {
  for (let i = 1; i <= 10; i++) {
    const seed = sampleRandomSeed()

    test(`${i}. Choice - Stack-Generator question`, () => {
      const { question: q1, testing: t1 } = stackQuestion.generate(
        "", // path not relevant here
        "en", // language not relevant
        {
          variant: "choice",
        },
        seed,
      ) as TestingObjectMultiple
      const { question: q2, testing: t2 } = stackQuestion.generate(
        "", // path not relevant here
        "de", // language not relevant
        {
          variant: "choice",
        },
        seed,
      ) as TestingObjectMultiple

      reproduceTestingObjectMultiple(q1, t1, q2, t2)
    })

    test(`${i}. FreeText - Stack-Generator question`, () => {
      const { question: q1, testing: t1 } = stackQuestion.generate(
        "", // path not relevant here
        "en", // language not relevant
        {
          variant: "input",
        },
        seed,
      ) as TestingObjectFreetext
      const { question: q2, testing: t2 } = stackQuestion.generate(
        "", // path not relevant here
        "de", // language not relevant
        {
          variant: "input",
        },
        seed,
      ) as TestingObjectFreetext

      expect(q1.type).toEqual("MultiFreeTextQuestion")
      expect(q1.type).toEqual(q2.type)

      for (const key in t1.correctAnswer) {
        expect(t1.correctAnswer[key]).toEqual(t2.correctAnswer[key])
      }
    })

    test(`${i}. Choice - Queue-Generator question`, () => {
      const { question: q1, testing: t1 } = queueQuestion.generate(
        "", // path not relevant here
        "en", // language not relevant
        {
          variant: "choice",
        },
        seed,
      ) as TestingObjectMultiple
      const { question: q2, testing: t2 } = queueQuestion.generate(
        "", // path not relevant here
        "de", // language not relevant
        {
          variant: "choice",
        },
        seed,
      ) as TestingObjectMultiple

      reproduceTestingObjectMultiple(q1, t1, q2, t2)
    })

    test(`${i}. FreeText - Queue-Generator question`, () => {
      const { question: q1, testing: t1 } = queueQuestion.generate(
        "", // path not relevant here
        "en", // language not relevant
        {
          variant: "input",
        },
        seed,
      ) as TestingObjectFreetext
      const { question: q2, testing: t2 } = queueQuestion.generate(
        "", // path not relevant here
        "de", // language not relevant
        {
          variant: "input",
        },
        seed,
      ) as TestingObjectFreetext

      expect(q1.type).toEqual("MultiFreeTextQuestion")
      expect(q1.type).toEqual(q2.type)

      for (const key in t1.correctAnswer) {
        expect(t1.correctAnswer[key]).toEqual(t2.correctAnswer[key])
      }
    })
  }
})

function correctnessTestingObjectMultiple(
  q: MultipleChoiceQuestion | MultiFreeTextQuestion,
  t: { allAnswers?: string[]; correctAnswerIndex: any },
) {
  expect(q.type).toEqual("MultipleChoiceQuestion")
  expect(t.allAnswers).toHaveLength(4)
  if (q.type === "MultipleChoiceQuestion") {
    expect(q.answers).toHaveLength(4)
    expect(t.correctAnswerIndex.length).toBeLessThanOrEqual(q.answers.length)
    expect(t.correctAnswerIndex.length).toBeGreaterThanOrEqual(0)
  }
}

function reproduceTestingObjectMultiple(
  q1: MultipleChoiceQuestion | MultiFreeTextQuestion,
  t1: {
    allAnswers?: string[]
    correctAnswerIndex: any
  },
  q2: MultipleChoiceQuestion | MultiFreeTextQuestion,
  t2: { allAnswers?: string[]; correctAnswerIndex: any },
) {
  expect(q1.type).toEqual("MultipleChoiceQuestion")
  expect(q1.type).toEqual(q2.type)

  if (q1.type === "MultipleChoiceQuestion" && q2.type === "MultipleChoiceQuestion") {
    expect(q1.answers.length).toEqual(q2.answers.length)
  }

  for (let j = 0; j < t1.correctAnswerIndex.length; j++) {
    expect(t1.correctAnswerIndex[j]).toEqual(t2.correctAnswerIndex[j])
  }
}
