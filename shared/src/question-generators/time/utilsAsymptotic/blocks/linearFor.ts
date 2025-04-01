import { createBasicForLine, createForLineWithStepSet } from "@shared/question-generators/time/utils.ts"
import { finalValue, iterator } from "@shared/question-generators/time/utilsAsymptotic/utils.ts"
import type { PseudoCodeFor, PseudoCodeForAll } from "@shared/utils/pseudoCodeUtils.ts"
import type Random from "@shared/utils/random.ts"

export const linearFor1 = (random: Random, iterDepth: number, finalDepth: number): PseudoCodeFor => {
  const valueU = random.choice([10, 20, 50, 100])
  const valueD = random.choice([0.01, 0.01, 0.5, 10, 50, 100].filter((v) => v !== valueU))

  return createBasicForLine({
    variableName: iterator[iterDepth].variable,
    startValueLoop: random.int(0, 10).toString(),
    endValueLoop: finalValue[finalDepth],
    endManipulation: random.weightedChoice([
      [{ type: "add", value: valueU }, 1 / 3],
      [{ type: "mult", value: valueD }, 1 / 3],
      [{ type: "div", valueD }, 1 / 6],
      [{ type: "div", valueD, valueU }, 1 / 6],
    ]),
    timeOrStars: "time",
  })
}

export const linearFor2 = (random: Random, iterDepth: number, finalDepth: number): PseudoCodeFor => {
  const valueD = random.choice([2, 5, 10, 20, 50, 100])
  const valueEnd = random.choice([2, 5, 10, 20, 50, 100].filter((v) => v !== valueD))

  return createBasicForLine({
    variableName: iterator[iterDepth].variable,
    startValueLoop: finalValue[finalDepth],
    startManipulation: random.weightedChoice([
      [{ type: "div", valueD: valueD }, 0.5],
      [{ type: "log", value: random.choice([0, 2, 10, 50]) }, 0.5],
    ]),
    endValueLoop: finalValue[finalDepth],
    endManipulation: random.weightedChoice([
      [undefined, 0.5],
      [{ type: "add", value: valueEnd }, 0.25],
      [{ type: "mult", value: valueEnd }, 0.25],
    ]),
    timeOrStars: "time",
  })
}

export const linearForAll1 = (
  random: Random,
  iterDepth: number,
  finalDepth: number,
): PseudoCodeForAll => {
  const set = random.choice([
    ["1,2,3,\\ldots,", finalValue[finalDepth]],
    [`1,2,3,\\ldots, ${random.int(2, 9)}`, finalValue[finalDepth]],
    [`1,2,3,\\ldots, ${random.int(3, 9)}^${random.int(5, 9)} \\cdot `, finalValue[finalDepth]],
    [
      finalValue[finalDepth],
      ", ",
      finalValue[finalDepth],
      " - 1,",
      finalValue[finalDepth],
      ` - 2, \\ldots, 1`,
    ],
    [
      finalValue[finalDepth],
      ", ",
      finalValue[finalDepth],
      " - 1,",
      finalValue[finalDepth],
      ` - 2, \\ldots, \\frac{`,
      finalValue[finalDepth],
      `}{${random.int(2, 5).toString()}}`,
    ],
    [`2,4,6,\\ldots, ${random.choice([2, 4, 6, 8])} \\cdot `, finalValue[finalDepth]],
    [`1,3,5,\\ldots, (${random.choice([2, 4, 6, 8])} \\cdot `, finalValue[finalDepth], " - 1)"],
    [`1,2,4,8,\\ldots, 2^{`, finalValue[finalDepth], "}"],
    [`1,2,4,8,\\ldots, 2^{ ${random.int(2, 9)} \\cdot `, finalValue[finalDepth], "}"],
    [`3,9,27,\\ldots, 3^{`, finalValue[finalDepth], "}"],
    [`3,9,27,\\ldots, 3^{ ${random.int(2, 9)} \\cdot `, finalValue[finalDepth], "}"],
    [`1^2,2^2,3^2,\\ldots, `, finalValue[finalDepth], "^2"],
    [`1^2,2^2,3^2,\\ldots, (${random.int(2, 5)} \\cdot`, finalValue[finalDepth], ")^2"],
    [
      `1^2,2^2,3^2,\\ldots, (${random.int(5, 9)}^${random.int(5, 9)} \\cdot`,
      finalValue[finalDepth],
      ")^2",
    ],
    [`1!,2!,3!,\\ldots, `, finalValue[finalDepth], "!"],
    [`1!,2!,3!,\\ldots, (${random.int(2, 5)} \\cdot`, finalValue[finalDepth], ")!"],
    [`0,-1,2,-3,\\ldots, (-1)^{`, finalValue[finalDepth], "} \\cdot ", finalValue[finalDepth]],
    [`0,1,-2,3,-4,\\ldots, (-1)^{`, finalValue[finalDepth], "} \\cdot ", finalValue[finalDepth], " + 1"],
  ])
  set.splice(0, 0, "\\{")
  set.push("\\}")

  return createForLineWithStepSet({
    variableName: iterator[iterDepth].variable,
    stepValuesSet: set,
  })
}
