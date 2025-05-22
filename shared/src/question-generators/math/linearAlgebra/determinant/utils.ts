import type { FreeTextFeedbackFunction } from "@shared/api/QuestionGenerator.ts"

export function getFeedback(detSolution: number): FreeTextFeedbackFunction {
  return ({ text }) => {
    // remove all whitespaces
    text = text.replace(/\s/g, "")

    const det = parseFloat(text)
    if (det === detSolution) {
      return {
        correct: true,
      }
    } else {
      return {
        correct: false,
        correctAnswer: detSolution.toString(),
      }
    }
  }
}
