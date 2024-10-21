import { describe, expect, test } from "vitest"
import { FreeTextFeedback, FreeTextQuestion } from "@shared/api/QuestionGenerator"
import { sampleRandomSeed } from "@shared/utils/random"
import { ModTricks } from "./modTricks"

const variants = [
  { name: "simple", params: { variant: "simple" }, testingKeys: ["a", "b"] },
  { name: "inverse", params: { variant: "inverse" }, testingKeys: ["a", "n", "inverse"] },
  {
    name: "exponentiation",
    params: { variant: "exponentiation" },
    testingKeys: ["a", "b", "n", "result"],
  },
]

describe("ModTricks - Correctness", () => {
  variants.forEach(({ name, params }) => {
    test(`Valid answer for ${name}`, async () => {
      const { question, testing } = ModTricks.generate("en", params, sampleRandomSeed()) as {
        question: FreeTextQuestion
        testing: Record<string, number>
      }

      expect(question.type).toBe("FreeTextQuestion")
      expect(question.feedback).toBeDefined()

      let correctAnswer: string | number | undefined
      switch (name) {
        case "simple":
          correctAnswer = testing.a
          break
        case "inverse":
          correctAnswer = testing.inverse
          break
        case "exponentiation":
          correctAnswer = testing.result
          break
        default:
          throw new Error(`Unknown variant: ${name}`)
      }

      // ensure correctAnswer is defined
      if (correctAnswer === undefined) {
        throw new Error(`Correct answer could not be determined for ${name}`)
      }

      // test correct answers
      const correctFeedback = (await question.feedback?.({
        text: correctAnswer.toString(),
      })) as FreeTextFeedback
      expect(correctFeedback.correct).toBe(true)

      // Test incorrect answers
      const incorrectAnswer = typeof correctAnswer === "number" ? correctAnswer + 1 : "incorrect"
      const incorrectFeedback = (await question.feedback?.({
        text: incorrectAnswer.toString(),
      })) as FreeTextFeedback
      expect(incorrectFeedback.correct).toBe(false)
    })
  })
})

describe("ModTricks - Invalid Inputs", () => {
  const invalidInputs = ["3.14", "banana", "!@#$%^&*"]

  variants.forEach(({ name, params }) => {
    invalidInputs.forEach((input) => {
      test(`Invalid input (${input}) for ${name}`, async () => {
        const { question } = ModTricks.generate("en", params, sampleRandomSeed()) as {
          question: FreeTextQuestion
        }

        const feedback = (await question.feedback?.({ text: input })) as FreeTextFeedback
        expect(feedback?.correct).toBe(false)
        expect(feedback?.feedbackText).toContain("Your answer is not valid.")
      })
    })
  })
})

describe("ModTricks - Reproducibility", () => {
  const seed = sampleRandomSeed()

  variants.forEach(({ name, params }) => {
    test(`Reproducible question for ${name}`, () => {
      // generate question with same seed twice
      const { question: q1, testing: t1 } = ModTricks.generate("en", params, seed) as {
        question: FreeTextQuestion
        testing: Record<string, number>
      }
      const { question: q2, testing: t2 } = ModTricks.generate("en", params, seed) as {
        question: FreeTextQuestion
        testing: Record<string, number>
      }

      // ensure equality
      expect(q1.text).toEqual(q2.text)
      expect(q1.prompt).toEqual(q2.prompt)
      expect(t1).toEqual(t2)
    })
  })
})

describe("ModTricks - Multiple Random Generations", () => {
  variants.forEach(({ name, params }) => {
    for (let i = 1; i <= 10; i++) {
      test(`${i}. random ${name} question`, () => {
        const { question, testing } = ModTricks.generate("en", params, sampleRandomSeed()) as {
          question: FreeTextQuestion
          testing: Record<string, number>
        }

        expect(question.type).toEqual("FreeTextQuestion")
        expect(question.feedback).toBeDefined()

        // range checks
        if (name === "simple") {
          expect(testing.a).toBeGreaterThanOrEqual(0)
          expect(testing.b).toBeGreaterThan(1)
          expect(testing.a).toBeLessThanOrEqual(19)
          expect(testing.b).toBeLessThanOrEqual(20)
        } else if (name === "reduction") {
          expect(testing.x).toBeGreaterThanOrEqual(100)
          expect(testing.x).toBeLessThanOrEqual(999)
          expect(testing.n).toBeGreaterThanOrEqual(2)
          expect(testing.n).toBeLessThanOrEqual(20)
        } else if (name === "inverse") {
          expect(testing.a).toBeGreaterThanOrEqual(2)
          expect(testing.a).toBeLessThanOrEqual(15)
          expect(testing.n).toBeGreaterThanOrEqual(2)
          expect(testing.n).toBeLessThanOrEqual(20)
        } else if (name === "exponentiation") {
          expect(testing.a).toBeGreaterThanOrEqual(2)
          expect(testing.a).toBeLessThanOrEqual(10)
          expect(testing.b).toBeGreaterThanOrEqual(2)
          expect(testing.b).toBeLessThanOrEqual(10)
          expect(testing.n).toBeGreaterThanOrEqual(2)
          expect(testing.n).toBeLessThanOrEqual(20)
        }
      })
    }
  })
})
