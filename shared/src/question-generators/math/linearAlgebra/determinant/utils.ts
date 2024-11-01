import { FreeTextFeedbackFunction, FreeTextFormatFunction } from "@shared/api/QuestionGenerator.ts"

export function formatFeedback(detSolution: number) {
  const checkFormat: FreeTextFormatFunction = ({ text }) => {
    if (text.trim() === "") return { valid: false }
    // the determinant should be a number, but we allow all inputs
    // to make it more difficult
    return { valid: true, message: "" }
  }
  const feedback: FreeTextFeedbackFunction = ({ text }) => {
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

  return { checkFormat, feedback }
}
