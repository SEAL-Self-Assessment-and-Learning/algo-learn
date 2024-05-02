import { describe, expect, test } from "vitest"
import { FreeTextQuestion } from "@shared/api/QuestionGenerator.ts"
import { Loops } from "@shared/question-generators/time/loops.ts"
import { sampleRandomSeed } from "@shared/utils/random.ts"

interface TestingObject {
  question: FreeTextQuestion
  testing: {
    functionText: string
    functionName: string
    numStars: number
  }
}

describe("Loops number of stars - Correctness", () => {
  for (let i = 1; i <= 100; i++) {
    test(`${i}. random loops number of stars question`, () => {
      const { question: q, testing: t } = Loops.generate(
        "", // path not relevant here
        "en", // language not relevant
        { variant: "simpleExact" }, // generator does not support parameters
        sampleRandomSeed(),
      ) as TestingObject

      expect(q.type).toEqual("FreeTextQuestion")
      expect(q.checkFormat).toBeDefined()
      expect(q.feedback).toBeDefined()

      expect(t.functionText.length).toBeGreaterThan(0)
      expect(t.functionName.length).toEqual(1)
      expect(t.numStars).toBeGreaterThanOrEqual(0)
    })
  }
})
