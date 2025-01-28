import { describe, expect, test } from "vitest"
import type { MultipleChoiceQuestion } from "../../api/QuestionGenerator"
import { sampleRandomSeed } from "../../utils/random"
import { ExampleQuestion } from "./example"

interface TestingObject {
  question: MultipleChoiceQuestion
  testing: {
    a: number
    b: number
    correctAnswer: number
    correctAnswerIndex: number
  }
}

describe("ExampleQuestion - Correctness", () => {
  for (let i = 1; i <= 10; i++) {
    test(`${i}. random example question`, () => {
      const { question: q, testing: t } = ExampleQuestion.generate(
        "en", // language not relevant
        {}, // generator does not support parameters
        sampleRandomSeed(),
      ) as TestingObject

      // type and number of answers are correct
      expect(q.type).toEqual("MultipleChoiceQuestion")
      expect(q.answers).toHaveLength(4)

      // correctAnswer is actually correct
      expect(t.correctAnswer).toEqual(t.a + t.b)

      // correctAnswerIndex points to the right element
      expect(t.correctAnswerIndex).toBeLessThan(q.answers.length)
      expect(q.answers[t.correctAnswerIndex]).toEqual(`$${t.a + t.b}$`)

      // all answers are pairwise different
      for (let i = 0; i < q.answers.length; i++) {
        for (let j = i + 1; j < q.answers.length; j++) {
          expect(q.answers[i]).not.toEqual(q.answers[j])
        }
      }
    })
  }
})

describe("ExampleQuestion - Reproducible", () => {
  const seed = sampleRandomSeed()
  // generate question the first time
  const { question: q1, testing: t1 } = ExampleQuestion.generate(
    "en", // language not relevant
    {}, // generator does not support parameters
    seed, // the random seed
  ) as TestingObject

  // generate question a second time with the same seed (just different language)
  const { question: q2, testing: t2 } = ExampleQuestion.generate(
    "de", // language not relevant
    {}, // generator does not support parameters
    seed, // the random seed
  ) as TestingObject

  test("different language - same question", () => {
    // check that both questions are equal
    expect(q1.answers.length).toEqual(q2.answers.length)
    for (let i = 0; i < q1.answers.length; i++) {
      expect(q1.answers[i]).toEqual(q2.answers[i])
    }

    expect(t1.a).toEqual(t2.a)
    expect(t1.b).toEqual(t2.b)
    expect(t1.correctAnswer).toEqual(t2.correctAnswer)
    expect(t1.correctAnswerIndex).toEqual(t2.correctAnswerIndex)
  })
})
