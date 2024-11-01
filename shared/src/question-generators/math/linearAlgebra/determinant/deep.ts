import { FreeTextQuestion } from "@shared/api/QuestionGenerator.ts"
import { determinant } from "@shared/question-generators/math/linearAlgebra/determinant/det.ts"
import { formatFeedback } from "@shared/question-generators/math/linearAlgebra/determinant/utils.ts"
import { randomStandardMatrix } from "@shared/question-generators/math/linearAlgebra/generations/matrix.ts"
import { matrixToTex } from "@shared/question-generators/math/linearAlgebra/tex.ts"
import math from "@shared/utils/math.ts"
import Random from "@shared/utils/random.ts"
import { t, Translations } from "@shared/utils/translations.ts"

/**
 * Generates a question for the determinant of a matrix.
 * The matrix is a random square matrix with a size between 3 and 4.
 * - case 1: 3x3 matrix with values in the range [-10, 10] and precision 0.5
 * - case 2: 4x4 matrix with values in the range [-10, 10] and precision 1
 * @param random
 * @param lang
 * @param permalink
 * @param translations
 */
export function generateVariantDeepDet({
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
  const matrixSize = random.int(3, 4)
  const matrix = randomStandardMatrix({
    random,
    rows: matrixSize,
    cols: matrixSize,
    precision: matrixSize === 3 ? 0.5 : 1,
  })
  const detSolution = math.det(matrix)

  const _ = formatFeedback(detSolution)
  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: determinant.name(lang),
    path: permalink,
    text: t(translations, lang, "text", [matrixToTex(matrix, "r")]),
    checkFormat: _.checkFormat,
    feedback: _.feedback,
  }

  return {
    question,
  }
}
