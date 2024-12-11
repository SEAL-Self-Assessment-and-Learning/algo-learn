import {
  MultiFreeTextFeedbackFunction,
  MultiFreeTextFormatFunction,
  MultiFreeTextQuestion,
} from "@shared/api/QuestionGenerator"
import { axb } from "@shared/question-generators/math/linearAlgebra/axb/axbGen"
import { generateAforAxEqualsB } from "@shared/question-generators/math/linearAlgebra/generations/matrix"
import { matrixToTex, vectorToTex } from "@shared/question-generators/math/linearAlgebra/tex"
import { _ } from "@shared/utils/generics"
import math from "@shared/utils/math"
import { createMatrixInput } from "@shared/utils/matrixInput.ts"
import Random from "@shared/utils/random"
import { t, Translations } from "@shared/utils/translations"

/**
 * This function generates a question for the start of the Ax=b question type.
 * @param translations
 * @param random
 * @param lang
 * @param permalink
 */
export function generateVariantStartAxb(
  translations: Translations,
  random: Random,
  lang: "de" | "en",
  permalink: string,
) {
  const checkFormat: MultiFreeTextFormatFunction = ({ text }, fieldID) => {
    const value = text[fieldID]
    if (value === "") {
      return {
        valid: false,
      }
    }
    // remove all whitespaces
    const cleanedValue = value.replace(/\s/g, "")
    // check if the input is a number
    if (!/^-?\d+(\.\d+)?$/.test(cleanedValue)) {
      return {
        valid: false,
        message: t(translations, lang, "checkFormat"),
      }
    }
    return {
      valid: true,
    }
  }

  const feedback: MultiFreeTextFeedbackFunction = ({ text }) => {
    // rebuild an x vector from the input fields
    const userX: number[] = []
    for (let i = 0; i < matrixSize; i++) {
      userX.push(parseFloat(text[`x_${i}_0`].replace(/\s/g, "")))
    }
    const userB = math.multiply(A, userX)
    const correct = _.isEqual(userB, updatedB)
    if (correct) {
      return {
        correct: true,
      }
    }
    return {
      correct: false,
      correctAnswer: "$x=" + vectorToTex(x) + "$",
    }
  }

  const matrixSize = random.int(2, 3)
  let x: number[]
  do {
    x = Array.from({ length: matrixSize }, () => random.int(-8, 8))
  } while (math.norm(x) === 0)
  const b: number[] = Array.from({ length: matrixSize }, () => random.int(-8, 8))
  const { A, updatedB } = generateAforAxEqualsB({
    random,
    x,
    b,
  })

  const matrixInput = createMatrixInput({
    rows: matrixSize,
    cols: 1,
    name: "$x=$",
    elementOf: `$\\in\\mathbb{R}^${matrixSize}$`,
  })

  const question: MultiFreeTextQuestion = {
    type: "MultiFreeTextQuestion",
    name: axb.name(lang),
    path: permalink,
    text: t(translations, lang, "text", [
      matrixToTex(A, "r"),
      vectorToTex(updatedB),
      matrixInput.matrixInput,
    ]),
    checkFormat,
    feedback,
  }

  return {
    question,
  }
}
