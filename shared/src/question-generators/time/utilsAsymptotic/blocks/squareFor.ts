import { createBasicForLine, createForLineWithStepSet } from "@shared/question-generators/time/utils.ts"
import { finalValue, iterator } from "@shared/question-generators/time/utilsAsymptotic/utils.ts"
import type { PseudoCodeFor, PseudoCodeForAll } from "@shared/utils/pseudoCodeUtils.ts"
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

export const squareForAll1 = (
  random: Random,
  iterDepth: number,
  finalDepth: number,
): PseudoCodeForAll => {
  const set = random.choice([
    ["1,2,3,\\ldots,", finalValue[finalDepth], "^2"],
    ["2,4,6,\\ldots, 2 \\cdot ", finalValue[finalDepth], "^2"],
    ["1,3,5,\\ldots, (2 \\cdot ", finalValue[finalDepth], "^2 - 1)"],
    ["1,2,3,\\ldots,", finalValue[finalDepth], " \\cdot (", finalValue[finalDepth], "+ 1)"],
    [`5,10,15,\\ldots, 5 \\cdot `, finalValue[finalDepth], "^2"],
    [`1,2,3,\\ldots, ${random.int(2, 9)} \\cdot `, finalValue[finalDepth], "^2"],
    ["1,2,3,\\ldots, (", finalValue[finalDepth], " + ", random.int(1, 5).toString(), ")^2"],
    [
      `${generateThreeDigitSequence(random)},\\ldots,`,
      finalValue[finalDepth],
      "^2 + ",
      random.int(1, 9).toString(),
    ],
    [
      "1,2,3,\\ldots,",
      finalValue[finalDepth],
      "^2 + ",
      random.int(2, 9).toString(),
      "\\cdot",
      finalValue[finalDepth],
    ],
    ["0,3,6,\\ldots, 3 \\cdot ", finalValue[finalDepth], "^2"],
    ["1,2,3,\\ldots,", finalValue[finalDepth], "^{2} + ", finalValue[finalDepth], "^{2}"],
    [
      "1,2,3,\\ldots,",
      random.int(4, 7).toString(),
      `^{${random.int(4, 9)}} \\cdot `,
      finalValue[finalDepth],
      "^2",
    ],
    ["1,2,3,\\ldots, \\frac{", finalValue[finalDepth], "^{3}}{", finalValue[finalDepth], "}"],
    [
      "1,2,3,\\ldots,",
      finalValue[finalDepth],
      " \\cdot ",
      `${random.int(4, 7)}^{-${random.int(4, 8)}}`,
      " \\cdot ",
      finalValue[finalDepth],
    ],
  ])
  set.splice(0, 0, "\\{")
  set.push("\\}")

  return createForLineWithStepSet({
    variableName: iterator[iterDepth].variable,
    stepValuesSet: set,
  })
}

const generateThreeDigitSequence = (random: Random): string => {
  const start = random.int(2, 20)
  return `${start}, ${start + 1}, ${start + 2}`
}
