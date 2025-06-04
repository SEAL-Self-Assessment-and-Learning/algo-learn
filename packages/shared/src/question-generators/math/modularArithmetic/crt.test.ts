import { describe, expect, test } from "vitest"
import type { FreeTextFeedback, FreeTextQuestion } from "../../../api/QuestionGenerator.ts"
import { sampleRandomSeed } from "../../../utils/random.ts"
import { CRT } from "./crt.ts"

const variants = [
  { name: "rand", params: { variant: "rand" }, testingKeys: ["crtValue", "commonModulus"] },
  { name: "2", params: { variant: "2" }, testingKeys: ["crtValue", "commonModulus"] },
  { name: "3", params: { variant: "3" }, testingKeys: ["crtValue", "commonModulus"] },
  { name: "4", params: { variant: "4" }, testingKeys: ["crtValue", "commonModulus"] },
]

describe("CRT - Correctness", () => {
  variants.forEach(({ name, params }) => {
    test(`Valid answer for ${name}`, async () => {
      const { question, testing } = CRT.generate("en", params, sampleRandomSeed()) as {
        question: FreeTextQuestion
        testing: Record<string, number>
      }

      expect(question.type).toBe("FreeTextQuestion")
      expect(question.feedback).toBeDefined()

      const correctAnswer = `${testing.crtValue} (mod ${testing.commonModulus})`
      const correctFeedback = (await question.feedback?.({ text: correctAnswer })) as FreeTextFeedback
      expect(correctFeedback.correct).toBe(true)

      const incorrectAnswer = `${testing.crtValue + 1} (mod ${testing.commonModulus})`
      const incorrectFeedback = (await question.feedback?.({
        text: incorrectAnswer,
      })) as FreeTextFeedback
      expect(incorrectFeedback.correct).toBe(false)
    })
  })
})

describe("CRT - Invalid Inputs", () => {
  const invalidInputs = ["3.14", "banana", "!@#$%^&*"]

  variants.forEach(({ name, params }) => {
    invalidInputs.forEach((input) => {
      test(`Invalid input (${input}) for ${name}`, async () => {
        const { question } = CRT.generate("en", params, sampleRandomSeed()) as {
          question: FreeTextQuestion
        }

        const feedback = (await question.feedback?.({ text: input })) as FreeTextFeedback
        expect(feedback?.correct).toBe(false)
        expect(feedback?.feedbackText).toContain("Your answer is not valid.")
      })
    })
  })
})

describe("CRT - Reproducibility", () => {
  const seed = sampleRandomSeed()

  variants.forEach(({ name, params }) => {
    test(`Reproducible question for ${name}`, () => {
      const { question: q1, testing: t1 } = CRT.generate("en", params, seed) as {
        question: FreeTextQuestion
        testing: Record<string, number>
      }
      const { question: q2, testing: t2 } = CRT.generate("en", params, seed) as {
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

describe("CRT - Multiple Random Generations", () => {
  variants.forEach(({ name, params }) => {
    for (let i = 1; i <= 10; i++) {
      test(`${i}. random ${name} question`, () => {
        const { question, testing } = CRT.generate("en", params, sampleRandomSeed()) as {
          question: FreeTextQuestion
          testing: Record<string, number>
        }

        expect(question.type).toEqual("FreeTextQuestion")
        expect(question.feedback).toBeDefined()

        expect(testing.crtValue).toBeGreaterThanOrEqual(0)
        expect(testing.commonModulus).toBeGreaterThanOrEqual(2)
      })
    }
  })
})
