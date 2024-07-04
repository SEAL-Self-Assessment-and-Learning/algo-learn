import { expect, test } from "vitest"
import { FreeTextFeedback, FreeTextQuestion } from "@shared/api/QuestionGenerator.ts"
import { NormalForms } from "./normalForms.ts"

test("Normal forms with a single literal as answer", () => {
  const { question } = NormalForms.generate("en", { variant: "input", size: 2 }, "xrahebo") as {
    question: FreeTextQuestion
  }
  expect(question.type).toStrictEqual("FreeTextQuestion")

  expect(question.feedback).not.toBeUndefined()
  const feedback = question.feedback?.({ text: "x_1" }) as FreeTextFeedback
  expect(feedback.correct).toStrictEqual(true)
})
