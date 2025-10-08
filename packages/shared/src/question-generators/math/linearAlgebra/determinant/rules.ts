import type { FreeTextQuestion } from "@shared/api/QuestionGenerator.ts"
import { Determinant } from "@shared/question-generators/math/linearAlgebra/determinant/det.ts"
import { getFeedback } from "@shared/question-generators/math/linearAlgebra/determinant/utils.ts"
import {
  allRandomMatrix,
  randomStandardMatrix,
} from "@shared/question-generators/math/linearAlgebra/generations/matrix.ts"
import { matrixToTex } from "@shared/question-generators/math/linearAlgebra/tex.ts"
import math from "@shared/utils/math.ts"
import type Random from "@shared/utils/random.ts"
import type { PrecisionValues } from "@shared/utils/random.ts"
import { t, type Translations } from "@shared/utils/translations.ts"

/**
 * Generates a question for the determinant topic variant rule.
 * The student has to calculate the determinant of a matrix, by applying a
 * det rule correctly.
 * Provides the determinant of another matrix as a hint.
 * @param random
 * @param lang
 * @param permalink
 * @param translations
 */
export function generateVariantsRulesDet({
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
  const rule = random.choice(["mul", "inv", "trans", "rowSwap", "rowMul", "rowAdd"])
  switch (rule) {
    case "mul":
      return generateVariantMulDet({ random, lang, permalink, translations })
    case "inv":
      return generateVariantInvDet({ random, lang, permalink, translations })
    case "trans":
      return generateVariantTransDet({ random, lang, permalink, translations })
    case "rowSwap":
      return generateVariantRowSwapDet({ random, lang, permalink, translations })
    case "rowMul":
      return generateVariantRowMulDet({ random, lang, permalink, translations })
    case "rowAdd":
      return generateVariantRowAddDet({ random, lang, permalink, translations })
    default:
      // should never be reached
      return generateVariantMulDet({ random, lang, permalink, translations })
  }
}

/**
 * Generates a question where the student has to calculate the determinant of a matrix C,
 * given the matrices A and B and the rule C = A * B.
 * Rule: det(AB)=det(A)det(B)
 * @param random
 * @param lang
 * @param permalink
 * @param translations
 */
function generateVariantMulDet({
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
  const matrixSettings = {
    random,
    max: 5,
    min: -5,
    rows: matrixSize,
    cols: matrixSize,
    precision: matrixSize === 2 ? 0.5 : (1 as PrecisionValues),
  }
  const matrixA = allRandomMatrix(matrixSettings)
  const matrixB = allRandomMatrix(matrixSettings)
  const detSolution = math.det(matrixA) * math.det(matrixB)

  const defC = `C = A \\cdot B`
  const defA = `A = ${matrixToTex(matrixA, "r")}`
  const defB = `B = ${matrixToTex(matrixB, "r")}`
  // create def A and def B in one line with a space between
  const defAMulB = `${defA} \\quad ${defB}`

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: Determinant.name(lang),
    path: permalink,
    text: t(translations, lang, "mul", [defC, defAMulB]),
    feedback: getFeedback(detSolution, translations, lang, "mulFeedback"),
  }
  return {
    question,
  }
}

/**
 * Generates a question where the student has to calculate the determinant of a matrix B,
 * given the matrix A and the rule B = A^-1.
 * Rule: det(A^-1) = 1/det(A)
 * (Rounds the solution to 2 decimal places)
 * @param random
 * @param lang
 * @param permalink
 * @param translations
 */
function generateVariantInvDet({
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
  let matrix: number[][]
  // det A != 0 since otherwise 1 / det A not calculable
  do {
    matrix = allRandomMatrix({
      random,
      max: 3,
      min: -3,
      rows: matrixSize,
      cols: matrixSize,
      precision: matrixSize === 3 ? 0.5 : 1,
    })
  } while (math.det(matrix) === 0)
  const detSolution = math.round(1 / math.det(matrix), 2)

  const defA = `A = ${matrixToTex(matrix, "r")}`

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: Determinant.name(lang),
    path: permalink,
    text: t(translations, lang, "inv", [defA]),
    bottomText: t(translations, lang, "invBottom"),
    feedback: getFeedback(detSolution, translations, lang, "invFeedback"),
  }
  return {
    question,
  }
}

/**
 * Generates a question where the student has to calculate the determinant of a matrix B,
 * given the matrix A and the rule B = A^T.
 * Rule: det(A^T) = det(A)
 * @param random
 * @param lang
 * @param permalink
 * @param translations
 */
function generateVariantTransDet({
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
  const matrixA = randomStandardMatrix({
    random,
    rows: matrixSize,
    cols: matrixSize,
  })
  const detSolution = math.det(matrixA)

  const defAB = `A = ${matrixToTex(matrixA, "r")} \\quad B = ${matrixToTex(math.transpose(matrixA), "r")}`

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: Determinant.name(lang),
    path: permalink,
    text: t(translations, lang, "rowManipulation", [defAB, detSolution.toString()]),
    feedback: getFeedback(detSolution, translations, lang, "transFeedback"),
  }
  return {
    question,
  }
}

/**
 * Generates a question where the student has to calculate the determinant of a matrix B,
 * given the matrix A and the rule B = A with a row swap.
 * Rule: det(B) = -det(A)
 * @param random
 * @param lang
 * @param permalink
 * @param translations
 */
function generateVariantRowSwapDet({
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
  })

  const i = random.int(0, matrixSize - 1)
  let j
  do {
    j = random.int(0, matrixSize - 1)
  } while (i === j)
  const swappedMatrix = math.matrix(matrix).swapRows(i, j).toArray() as number[][]
  const detSolution = math.det(matrix)
  const detSwapped = math.det(swappedMatrix) // should be detSolution *–1

  const defAB = `A = ${matrixToTex(matrix, "r")} \\quad B = ${matrixToTex(swappedMatrix, "r")}`

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: Determinant.name(lang),
    path: permalink,
    text: t(translations, lang, "rowManipulation", [defAB, detSwapped.toString()]),
    feedback: getFeedback(detSolution, translations, lang, "rowSwapFeedback"),
  }
  return {
    question,
  }
}

/**
 * Generates a question where the student has to calculate the determinant of a matrix B,
 * given the matrix A and the rule B = A with a row multiplication.
 * Rule: det(B) = k * det(A)
 * @param random
 * @param lang
 * @param permalink
 * @param translations
 */
function generateVariantRowMulDet({
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
  })

  const i = random.int(0, matrixSize - 1)
  const k = random.choice([-4, -3, -2, -1, 2, 3, 4, 5])

  // multiply each value in row i with k
  const matrixRowMul = math
    .matrix(matrix)
    .map((value, index) => {
      if (index[0] === i) {
        return value * k
      }
      return value as number
    })
    .toArray() as number[][]
  const detSolution = math.det(matrix)
  const detRowMul = math.det(matrixRowMul)

  const defAB = `A = ${matrixToTex(matrix, "r")} \\quad B = ${matrixToTex(matrixRowMul, "r")}`

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: Determinant.name(lang),
    path: permalink,
    text: t(translations, lang, "rowManipulation", [defAB, detRowMul.toString()]),
    feedback: getFeedback(detSolution, translations, lang, "rowMulFeedback"),
  }
  return {
    question,
  }
}

/**
 * Generates a question where the student has to calculate the determinant of a matrix B,
 * given the matrix A and the rule B = A with a k*row addition.
 * Rule: det(B) = det(A)
 * @param random
 * @param lang
 * @param permalink
 * @param translations
 */
function generateVariantRowAddDet({
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
  const matrixSize = 3
  const matrixHelper = randomStandardMatrix({
    random,
    rows: matrixSize,
    cols: matrixSize,
  })

  const i = random.int(0, matrixSize - 1)
  let j
  do {
    j = random.int(0, matrixSize - 1)
  } while (i === j)
  const k = random.choice([-4, -3, -2, -1, 2, 3, 4, 5])

  // add row j to row i multiplied by k
  const matrixAdd = math
    .matrix(matrixHelper)
    .map((value, index) => {
      if (index[0] === i) {
        return (value + k * matrixHelper[j][index[1]]) as number
      }
      return value as number
    })
    .toArray() as number[][]
  const detSolution = math.det(matrixAdd)
  const detHelper = math.det(matrixHelper)

  const defAB = `A = ${matrixToTex(matrixAdd, "r")} \\quad B = ${matrixToTex(matrixHelper, "r")}`

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: Determinant.name(lang),
    path: permalink,
    text: t(translations, lang, "rowManipulation", [defAB, detHelper.toString()]),
    feedback: getFeedback(detSolution, translations, lang, "rowAddFeedback"),
  }
  return {
    question,
  }
}
