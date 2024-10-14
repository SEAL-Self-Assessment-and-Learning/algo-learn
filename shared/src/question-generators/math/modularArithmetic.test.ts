import { describe, expect, test } from "vitest"
import { FreeTextFeedback, FreeTextQuestion } from "../../api/QuestionGenerator"
import { ModularArithmetic } from "./modularArithmetic"
import { sampleRandomSeed } from "../../utils/random"

describe("ModularArithmeticQuestion - Correctness", () => {
  test("Valid answer for modular arithmetic question", async () => {
    const { question, testing } = ModularArithmetic.generate("en", {}, sampleRandomSeed()) as {
      question: FreeTextQuestion
      testing: { a: number; b: number }
    }

    // Check type
    expect(question.type).toBe("FreeTextQuestion")
    expect(question.feedback).toBeDefined()

    // Test correct answer
    const correctAnswer = testing.a + testing.b * 1 // x ≡ a (mod b) holds for this x
    const correctFeedback = await question.feedback?.({ text: correctAnswer.toString() }) as FreeTextFeedback
    expect(correctFeedback.correct).toBe(true)

  
    // Test negative number input that satisfies equation
    const correctNegativeAnswer = testing.a - testing.b * 1 // This should satisfy x ≡ a (mod b)
    const correctNegativeFeedback = await question.feedback?.({ text: correctNegativeAnswer.toString() })
    expect(correctNegativeFeedback?.correct).toBe(true)

    // Test incorrect answer
    const incorrectAnswer = correctAnswer + 1 // x + 1 should not satisfy x ≡ a (mod b)
    const incorrectFeedback = await question.feedback?.({ text: incorrectAnswer.toString() }) as FreeTextFeedback
    expect(incorrectFeedback.correct).toBe(false)
    expect(incorrectFeedback.feedbackText).toContain(
      `The answer must satisfy: $x ≡ ${testing.a} \\pmod{ ${testing.b} }$`
    )
  })

  test("Invalid input should return an error", async () => {
    const { question } = ModularArithmetic.generate("en", {}, sampleRandomSeed()) as {
      question: FreeTextQuestion
    }
    
    //Test error
    const invalidFeedback = await question.feedback?.({ text: "not-a-number" }) as FreeTextFeedback
    expect(invalidFeedback.correct).toBe(false)
    expect(invalidFeedback.feedbackText).toContain("Your answer is not a valid number.")
  })
})

describe("ModularArithmeticQuestion - Reproducible", () => {
  const seed = sampleRandomSeed()

  // generate question
  const { question: q1, testing: t1 } = ModularArithmetic.generate(
    "en", {}, seed,
  ) as { question: FreeTextQuestion; testing: { a: number; b: number } }

  // generate question again with same seed
  const { question: q2, testing: t2 } = ModularArithmetic.generate(
    "en", {}, seed,
  ) as { question: FreeTextQuestion; testing: { a: number; b: number } }

  test("Reproducible question with same seed", () => {
    // Ensure both questions are equal
    expect(q1.text).toEqual(q2.text)
    expect(q1.prompt).toEqual(q2.prompt)

    // Ensure same values are used
    expect(t1.a).toEqual(t2.a)
    expect(t1.b).toEqual(t2.b)
  })
})

describe("ModularArithmeticQuestion - Multiple random generations", () => {
  for (let i = 1; i <= 10; i++) {
    test(`${i}. random modular arithmetic question`, () => {
      const { question, testing } = ModularArithmetic.generate(
        "en", {}, sampleRandomSeed(),
      ) as { question: FreeTextQuestion; testing: { a: number; b: number } }

      expect(question.type).toEqual("FreeTextQuestion")
      expect(question.feedback).toBeDefined()
      
      // Ensure value lower bound
      expect(testing.a).toBeGreaterThanOrEqual(0)
      expect(testing.b).toBeGreaterThan(1)


      // Ensure value upper bound
      expect(testing.a).toBeLessThanOrEqual(19)
      expect(testing.b).toBeLessThanOrEqual(20)
    })
  }
})

describe("ModularArithmeticQuestion - Invalid Inputs", () => {
  test("Non-integer numbers should return an error", async () => {
    const { question } = ModularArithmetic.generate("en", {}, sampleRandomSeed()) as {
      question: FreeTextQuestion
    }

    // Pass non-integer number
    const nonIntegerFeedback = await question.feedback?.({ text: "3.14" })
    expect(nonIntegerFeedback?.correct).toBe(false)
    expect(nonIntegerFeedback?.feedbackText).toContain("Your answer is not a valid number.")
  })

  test("String inputs should return an error", async () => {
    const { question } = ModularArithmetic.generate("en", {}, sampleRandomSeed()) as {
      question: FreeTextQuestion
    }

    // Pass string input
    const stringFeedback = await question.feedback?.({ text: "banana" })
    expect(stringFeedback?.correct).toBe(false)
    expect(stringFeedback?.feedbackText).toContain("Your answer is not a valid number.")
  })

  test("Special characters should return an error", async () => {
    const { question } = ModularArithmetic.generate("en", {}, sampleRandomSeed()) as {
      question: FreeTextQuestion
    }

    // Pass special characters
    const specialCharsFeedback = await question.feedback?.({ text: "!@#$%^&*" })
    expect(specialCharsFeedback?.correct).toBe(false)
    expect(specialCharsFeedback?.feedbackText).toContain("Your answer is not a valid number.")
  })
})
