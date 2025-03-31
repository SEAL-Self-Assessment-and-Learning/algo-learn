import { createBasicForLine } from "@shared/question-generators/time/utils.ts"
import { finalValue, iterator } from "@shared/question-generators/time/utilsAsymptotic/utils.ts"
import type { PseudoCodeFor } from "@shared/utils/pseudoCodeUtils.ts"
import type Random from "@shared/utils/random.ts"

export const squareFor1 = (random: Random, iterDepth: number, finalDepth: number): PseudoCodeFor => {
  return createBasicForLine({
    variableName: iterator[iterDepth].variable,
    startValueLoop: random.int(0, 9).toString(),
    endValueLoop: finalValue[finalDepth],
    endManipulation: { type: "square", abs: false },
    timeOrStars: "time",
  })
}
