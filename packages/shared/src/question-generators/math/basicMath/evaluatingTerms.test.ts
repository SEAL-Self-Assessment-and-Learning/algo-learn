import { describe, expect, test } from "vitest"
import type { FreeTextQuestion } from "@shared/api/QuestionGenerator"
import { sampleRandomSeed } from "@shared/utils/random"
import { EvaluatingTerms } from "./evaluatingTerms"

describe("Arithmetic: Evaluating Terms", () => {
  const sampleSize = 10 // to set a limit on test runs
  for (let i = 1; i <= sampleSize; i++) {
    test(`${i}. random expr question ${i}`, () => {
      const { question: q } = EvaluatingTerms.generate(
        "en", // language not relevant
        { difficulty: 9 },
        sampleRandomSeed(),
      ) as {
        question: FreeTextQuestion
      }

      expect(q.type).toEqual("FreeTextQuestion")
      expect(q.checkFormat).toBeDefined()
      expect(q.feedback).toBeDefined()
      expect(q.text!.length).toBeGreaterThan(0)
    })
  }
})
