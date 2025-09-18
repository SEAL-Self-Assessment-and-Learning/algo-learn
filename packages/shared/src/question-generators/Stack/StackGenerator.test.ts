import { describe, expect, test } from "vitest"
import type { MultiFreeTextQuestion, MultipleChoiceQuestion } from "../../api/QuestionGenerator.ts"
import { sampleRandomSeed } from "../../utils/random.ts"
import { queueQuestion } from "../Queue/QueueGenerator.ts"
import { stackQuestion } from "./StackGenerator.ts"

interface TestingObjectFreetext {
  question: MultipleChoiceQuestion | MultiFreeTextQuestion
  testing: {
    correctAnswer: { [key: string]: string }
  }
}

describe("StackQueueGenerator - Correctness", () => {
  for (let i = 1; i <= 10; i++) {
    test(`${i}. FreeText - random Stack-Generator question`, () => {
      const { question: q, testing: t } = stackQuestion.generate(
        "en", // language not relevant
        {
          variant: "detailed",
        },
        sampleRandomSeed(),
      ) as TestingObjectFreetext

      expect(q.type).toEqual("MultiFreeTextQuestion")
      expect(Object.keys(t.correctAnswer).length).toBeGreaterThanOrEqual(0)
    })

    test(`${i}. FreeText - random Queue-Generator question`, () => {
      const { question: q } = queueQuestion.generate(
        "en", // language not relevant
        {
          variant: "detailed",
        },
        sampleRandomSeed(),
      ) as TestingObjectFreetext

      expect(q.type).toEqual("MultiFreeTextQuestion")
    })
  }
})

describe("StackQueueGenerator - Reproducible", () => {
  for (let i = 1; i <= 10; i++) {
    const seed = sampleRandomSeed()

    test(`${i}. FreeText - Stack-Generator question`, () => {
      const { question: q1, testing: t1 } = stackQuestion.generate(
        "en", // language not relevant
        {
          variant: "detailed",
        },
        seed,
      ) as TestingObjectFreetext
      const { question: q2, testing: t2 } = stackQuestion.generate(
        "de", // language not relevant
        {
          variant: "detailed",
        },
        seed,
      ) as TestingObjectFreetext

      expect(q1.type).toEqual("MultiFreeTextQuestion")
      expect(q1.type).toEqual(q2.type)

      for (const key in t1.correctAnswer) {
        expect(t1.correctAnswer[key]).toEqual(t2.correctAnswer[key])
      }
    })

    test(`${i}. FreeText - Queue-Generator question`, () => {
      const { question: q1 } = queueQuestion.generate(
        "en", // language not relevant
        {
          variant: "detailed",
        },
        seed,
      ) as TestingObjectFreetext
      const { question: q2 } = queueQuestion.generate(
        "en", // language not relevant
        {
          variant: "detailed",
        },
        seed,
      ) as TestingObjectFreetext

      expect(q1.type).toEqual("MultiFreeTextQuestion")
      expect(q1.type).toEqual(q2.type)
      expect(q1.text).toEqual(q2.text)
    })
  }
})
