import { FreeTextQuestion } from "@shared/api/QuestionGenerator.ts"
import { determinant } from "@shared/question-generators/math/linearAlgebra/determinant/det.ts"
import { formatFeedback } from "@shared/question-generators/math/linearAlgebra/determinant/utils.ts"
import {
  generateGoodCofactorMatrix,
  generateLowerLeftTriangleMatrix,
  generateUpperRightTriangleMatrix,
} from "@shared/question-generators/math/linearAlgebra/generations/matrix.ts"
import { matrixToTex } from "@shared/question-generators/math/linearAlgebra/tex.ts"
import math from "@shared/utils/math.ts"
import Random from "@shared/utils/random.ts"
import { t, Translations } from "@shared/utils/translations.ts"

/**
 * Generates a question about the determinant of a matrix using the cofactor expansion.
 * The matrix is generated randomly of 5x5 or 6x6 only using integer values [-10,10]
 * @param random
 * @param lang
 * @param permalink
 * @param translations
 */
export function generateVariantCofactorDet({
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
  let matrix: number[][]
  const matrixSize = random.int(5, 6)
  const matrixType = random.weightedChoice([
    ["standard", 0.7],
    ["upperRightTriangle", 0.15],
    ["lowerLeftTriangle", 0.15],
  ])
  if (matrixType === "standard") {
    matrix = generateGoodCofactorMatrix({ random, size: matrixSize, min: -5, max: 5 })
  } else if (matrixType === "upperRightTriangle") {
    matrix = generateUpperRightTriangleMatrix({ random, size: matrixSize, min: -5, max: 5 })
  } else {
    matrix = generateLowerLeftTriangleMatrix({ random, size: matrixSize, min: -5, max: 5 })
  }

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
