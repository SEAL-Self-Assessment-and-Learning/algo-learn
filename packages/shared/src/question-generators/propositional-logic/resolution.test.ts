import { describe, expect, test } from "vitest"
import type { MultipleChoiceQuestion } from "../../api/QuestionGenerator.ts"
import Random, { sampleRandomSeed } from "../../utils/random.ts"
import { Resolution } from "./resolution.ts"

describe("Resolution - enough answers", () => {
  for (let i = 0; i < 10; i++) {
    test(`${i} - random resolution question`, () => {
      const seed = sampleRandomSeed()
      const random = new Random(seed)
      const { question: q } = Resolution.generate(
        "en",
        {
          depth: random.int(1, 3),
          size: random.int(3, 5),
        },
        seed,
      ) as {
        question: MultipleChoiceQuestion
      }
      expect(q.type).toEqual("MultipleChoiceQuestion")
      expect(q.answers).toHaveLength(6)
    })
  }
})
