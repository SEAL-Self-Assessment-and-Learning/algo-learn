import type { FreeTextQuestion } from "@shared/api/QuestionGenerator.ts"
import { Determinant } from "@shared/question-generators/math/linearAlgebra/determinant/det.ts"
import { getFeedback } from "@shared/question-generators/math/linearAlgebra/determinant/utils.ts"
import { allRandomMatrix } from "@shared/question-generators/math/linearAlgebra/generations/matrix.ts"
import { matrixToTex } from "@shared/question-generators/math/linearAlgebra/tex.ts"
import math from "@shared/utils/math/math.ts"
import type Random from "@shared/utils/random.ts"
import { t, type Translations } from "@shared/utils/translations.ts"

/**
 * Generates a question for the determinant of a random matrix.
 * The matrix is a square matrix with a random size between 2 and 3 and only integer values.
 * @param random
 * @param lang
 * @param permalink
 * @param translations - translations for the question
 */
export function generateVariantStartDet({
  random,
  lang,
  permalink,
  translations,
}: {
  random: Random
  lang: "de" | "en"
  permalink: string
  translations: Translations
}) {
  const matrixSize = random.int(2, 3)
  const matrix = allRandomMatrix({
    random,
    rows: matrixSize,
    cols: matrixSize,
  })
  const detSolution = math.det(matrix)

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: Determinant.name(lang),
    path: permalink,
    text: t(translations, lang, "text", [matrixToTex(matrix, "r")]),
    feedback: getFeedback(detSolution),
  }
  return {
    question,
  }
}
