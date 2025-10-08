import { describe, expect, test } from "vitest"
import type { FreeTextQuestion } from "../../api/QuestionGenerator.ts"
import type { PseudoCode } from "../../utils/pseudoCodeUtils.ts"
import { sampleRandomSeed } from "../../utils/random.ts"
import { Loops } from "./loops.ts"

interface TestingObject {
  question: FreeTextQuestion
  testing: {
    functionText: PseudoCode
    functionName: string
    numStars: number
  }
}

describe("Loops number of stars - Correctness", () => {
  for (let i = 1; i <= 100; i++) {
    test(`${i}. random loops number of stars question`, () => {
      const { question: q, testing: t } = Loops.generate(
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
