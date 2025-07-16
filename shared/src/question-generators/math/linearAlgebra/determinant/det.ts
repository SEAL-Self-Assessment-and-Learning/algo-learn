import type { QuestionGenerator } from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { generateVariantCofactorDet } from "@shared/question-generators/math/linearAlgebra/determinant/cofactor.ts"
import { generateVariantDeepDet } from "@shared/question-generators/math/linearAlgebra/determinant/deep.ts"
import { generateVariantsRulesDet } from "@shared/question-generators/math/linearAlgebra/determinant/rules.ts"
import { generateVariantStartDet } from "@shared/question-generators/math/linearAlgebra/determinant/start.ts"
import Random from "@shared/utils/random.ts"
import { tFunctional, type Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Determinant",
    description: "Compute the determinant of a matrix",
    text: `Compute the determinant of the matrix 
    $ A = {{0}} $.`,
    mul: `The Matrix $C$ is defined as follows: 
    \\[ {{0}} \\]
    \\[ {{1}} \\]
    What is the determinant of $C$?`,
    inv: `Given the matrix:
    \\[ {{0}} \\]
    Compute the determinant of $A^{-1}$.`,
    invBottom: "Please round your answer to two decimal places.",
    rowManipulation: `Given the matrices: 
    \\[ {{0}} \\]
    Given det $B = {{1}} $.
    **Compute** det $A$.`,
    mulFeedback: `Please consider the rule for the determinant of a product: $\\det(AB) = \\det(A)\\cdot\\det(B)$.`,
    invFeedback: `Please consider the rule for the determinant of an inverse: $\\det(A^{-1}) = \\frac{1}{\\det(A)}$.`,
    transFeedback: `Please consider the rule for the determinant of a transpose: $\\det(A^\\top) = \\det(A)$.`,
    rowSwapFeedback: `Please consider how swapping two rows affects the determinant.`,
    rowMulFeedback: `Please consider how multiplying a row by a scalar affects the determinant.`,
    rowAddFeedback: `Please consider how adding a multiple of one row to another affects the determinant.`,
  },
  de: {
    name: "Determinante",
    description: "Berechne die Determinante einer Matrix",
    text: `Berechne die Determinante der Matrix 
    $ A = {{0}} $.`,
    mul: `Die Matrix $C$ ist wie folgt definiert: 
    \\[ {{0}} \\]
    \\[{{1}} \\]
    Wie lautet die Determinante von $C$?`,
    inv: `Gegeben ist die Matrix:
    \\[{{0}} \\]
    Berechne die Determinante von $A^{-1}$.`,
    invBottom: "Bitte runde deine Antwort auf zwei Dezimalstellen.",
    rowManipulation: `Gegeben sind die Matrizen: 
    \\[ {{0}} \\]
    Gegeben ist det $B = {{1}} $.
    **Berechne** det $A$.`,
    mulFeedback: `Bitte beachte die Regel für die Determinante eines Produkts: $\\det(AB) = \\det(A)\\cdot\\det(B)$.`,
    invFeedback: `Bitte beachte die Regel für die Determinante einer Inversen: $\\det(A^{-1}) = \\frac{1}{\\det(A)}$.`,
    transFeedback: `Bitte beachte die Regel für die Determinante einer Transponierten: $\\det(A^\\top) = \\det(A)$.`,
    rowSwapFeedback: `Bitte beachte, wie sich das Vertauschen von zwei Zeilen auf die Determinante auswirkt.`,
    rowMulFeedback: `Bitte beachte, wie sich das Multiplizieren einer Zeile mit einem Skalar auf die Determinante auswirkt.`,
    rowAddFeedback: `Bitte beachte, wie sich das Addieren eines Vielfachen einer Zeile zu einer anderen auf die Determinante auswirkt.`,
  },
}

export const Determinant: QuestionGenerator = {
  id: "ladet",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["start", "deep", "cofactor", "rules"],
    },
  ],

  /**
   * Generates a question to ask the user to compute the determinant of a matrix.
   *
   * Four different variants are available:
   * - "start": A simple question to start with max 2x2 or 3x3 matrices (only integer values)
   * - "deep": A question with a 3x3 (integer and 0.5 values) or 4x4 matrix (integer values)
   * - "cofactor": A question with a 5x5 or 6x6 matrix (integer values)
   * - "rules": A question with a kxk (k [2,3,4]) matrix (integer values) and a rule to apply
   *            (knowing the rule, the determinant can be computed)
   *
   * @param lang
   * @param parameters
   * @param seed
   */
  generate: (lang, parameters, seed) => {
    const permalink = serializeGeneratorCall({
      generator: Determinant,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)

    const variant = parameters.variant as "start" | "deep" | "cofactor" | "rules"
    if (variant === "start") {
      return generateVariantStartDet({
        random,
        lang,
        permalink,
        translations,
      })
    } else if (variant === "deep") {
      return generateVariantDeepDet({
        random,
        lang,
        permalink,
        translations,
      })
    } else if (variant === "rules") {
      return generateVariantsRulesDet({
        random,
        lang,
        permalink,
        translations,
      })
    } else {
      return generateVariantCofactorDet({
        random,
        lang,
        permalink,
        translations,
      })
    }
  },
}
