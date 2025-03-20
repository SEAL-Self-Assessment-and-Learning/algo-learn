import { describe, expect, test } from "vitest"
import type { FreeTextFeedback, FreeTextQuestion } from "@shared/api/QuestionGenerator"
import { sampleRandomSeed } from "@shared/utils/random"
import { modFactor } from "./modFactorization"

// Define the variants to be tested
const variants = [
  { name: "large_number", params: { variant: "large_number" }, testingKeys: ["x", "n", "calculation"] },
  {
    name: "multiplication",
    params: { variant: "multiplication" },
    testingKeys: ["a", "b", "n", "calculation", "result"],
  },
  {
    name: "large_exponent",
    params: { variant: "large_exponent" },
    testingKeys: ["base", "exp", "n", "factors", "result"],
  },
]

describe("modFactor - Correctness", () => {
  variants.forEach(({ name, params }) => {
    test(`Valid answer for ${name}`, async () => {
      const { question, testing } = modFactor.generate("en", params, sampleRandomSeed()) as {
        question: FreeTextQuestion
        testing: Record<string, number>
      }

      expect(question.type).toBe("FreeTextQuestion")
      expect(question.feedback).toBeDefined()

      let correctAnswer: string | number | undefined
      switch (name) {
        case "large_number":
          correctAnswer = testing.x
          break
        case "multiplication":
        case "large_exponent":
          correctAnswer = testing.result
          break
        default:
          throw new Error(`Unknown variant: ${name}`)
      }

      // Ensure correctAnswer is defined
      if (correctAnswer === undefined) {
        throw new Error(`Correct answer could not be determined for ${name}`)
      }

      // Test correct answers
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

describe("modFactor - Invalid Inputs", () => {
  const invalidInputs = ["3.14", "banana", "!@#$%^&*"]

  variants.forEach(({ name, params }) => {
    invalidInputs.forEach((input) => {
      test(`Invalid input (${input}) for ${name}`, async () => {
        const { question } = modFactor.generate("en", params, sampleRandomSeed()) as {
          question: FreeTextQuestion
        }

        const feedback = (await question.feedback?.({ text: input })) as FreeTextFeedback
        expect(feedback?.correct).toBe(false)
        expect(feedback?.feedbackText).toContain("Your answer is not valid.")
      })
    })
  })
})

describe("modFactor - Reproducibility", () => {
  const seed = sampleRandomSeed()

  variants.forEach(({ name, params }) => {
    test(`Reproducible question for ${name}`, () => {
      // Generate question with the same seed twice
      const { question: q1, testing: t1 } = modFactor.generate("en", params, seed) as {
        question: FreeTextQuestion
        testing: Record<string, number>
      }
      const { question: q2, testing: t2 } = modFactor.generate("en", params, seed) as {
        question: FreeTextQuestion
        testing: Record<string, number>
      }

      // Ensure equality
      expect(q1.text).toEqual(q2.text)
      expect(q1.prompt).toEqual(q2.prompt)
      expect(t1).toEqual(t2)
    })
  })
})

describe("modFactor - Multiple Random Generations", () => {
  variants.forEach(({ name, params }) => {
    for (let i = 1; i <= 10; i++) {
      test(`${i}. random ${name} question`, () => {
        const { question, testing } = modFactor.generate("en", params, sampleRandomSeed()) as {
          question: FreeTextQuestion
          testing: Record<string, number>
        }

        expect(question.type).toEqual("FreeTextQuestion")
        expect(question.feedback).toBeDefined()

        // Range checks per variant
        if (name === "large_number") {
          expect(testing.x).toBeGreaterThan(10)
          expect(testing.x).toBeLessThanOrEqual(125000)
          expect(testing.n).toBeGreaterThanOrEqual(2)
          expect(testing.n).toBeLessThanOrEqual(20)
        } else if (name === "multiplication") {
          expect(testing.a).toBeGreaterThan(0)
          expect(testing.b).toBeGreaterThan(0)
          expect(testing.n).toBeGreaterThanOrEqual(2)
          expect(testing.n).toBeLessThanOrEqual(20)
        } else if (name === "large_exponent") {
          expect(testing.base).toBeGreaterThanOrEqual(2)
          expect(testing.base).toBeLessThanOrEqual(10)
          expect(testing.exp).toBeGreaterThan(0)
          expect(testing.exp).toBeLessThanOrEqual(1000)
          expect(testing.n).toBeGreaterThanOrEqual(2)
          expect(testing.n).toBeLessThanOrEqual(20)
        }
      })
    }
  })
})
