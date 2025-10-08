import type { Language } from "@shared/api/Language.ts"
import type { FreeTextFeedbackFunction } from "@shared/api/QuestionGenerator.ts"
import { t, type Translations } from "@shared/utils/translations.ts"

export function getFeedback(
  detSolution: number,
  translations?: Translations,
  lang?: Language,
  rule?: string,
): FreeTextFeedbackFunction {
  return ({ text }) => {
    // remove all whitespaces
    text = text.replace(/\s/g, "")

    const det = parseFloat(text)
    if (det === detSolution) {
      return {
        correct: true,
      }
    } else {
      if (translations && lang && rule) {
        return {
          correct: false,
          feedbackText: t(translations, lang, rule),
          correctAnswer: detSolution.toString(),
        }
      } else {
        return {
          correct: false,
          correctAnswer: detSolution.toString(),
        }
      }
    }
  }
}
