import { createProductTerm } from "@shared/question-generators/asymptotics/asymptoticsUtils.ts"
import { createBasicForLine } from "@shared/question-generators/time/utils.ts"
import type { LoopAsymptoticVariant } from "@shared/question-generators/time/utilsAsymptotic/utils.ts"
import { printStarsNew, type PseudoCodeFor } from "@shared/utils/pseudoCodeUtils.ts"
import type Random from "@shared/utils/random.ts"

const runtimeLinear = createProductTerm({
  coefficient: 1,
  polyexponent: 1,
})

export function getLoopLinearTime(random: Random): LoopAsymptoticVariant {
  return random.choice([linearVariant1, linearVariant2])(random)
}

const vn = { variable: "n" }
const vi = { variable: "i" }

const printStatement = (random: Random) =>
  random.choice([
    printStarsNew(random.int(1, 3)),
    {
      state: {
        print: [vi],
      },
    },
  ])

/**
 * Variant 1: Linear loop with:
 * - no start manipulation
 * - different end manipulations
 * - steps of 1
 * @param random
 */
function linearVariant1(random: Random): LoopAsymptoticVariant {
  const valueU = random.choice([10, 20, 50, 100])
  const valueD = random.choice([0.01, 0.01, 0.5, 10, 50, 100].filter((v) => v !== valueU))

  const forLine: PseudoCodeFor = createBasicForLine({
    variableName: "i",
    startValueLoop: random.int(0, 10).toString(),
    endValueLoop: vn,
    endManipulation: random.weightedChoice([
      [{ type: "add", value: valueU }, 1 / 3],
      [{ type: "mult", value: valueD }, 1 / 3],
      [{ type: "div", valueD }, 1 / 6],
      [{ type: "div", valueD, valueU }, 1 / 6],
    ]),
    timeOrStars: "time",
  })
  forLine.for.do = printStatement(random)

  return {
    code: [{ block: [forLine] }],
    runtime: runtimeLinear,
  }
}

/**
 * Variant 2: Linear loop with:
 * - different start manipulations
 * - end manipulation (add, mult)
 * - steos of 1
 * @param random
 */
function linearVariant2(random: Random): LoopAsymptoticVariant {
  const valueD = random.choice([2, 5, 10, 20, 50, 100])
  const valueEnd = random.choice([2, 5, 10, 20, 50, 100].filter((v) => v !== valueD))

  const forLine: PseudoCodeFor = createBasicForLine({
    variableName: "i",
    startValueLoop: vn,
    startManipulation: random.weightedChoice([
      [{ type: "div", valueD: valueD }, 0.5],
      [{ type: "log", value: random.choice([0, 2, 10, 50]) }, 0.5],
    ]),
    endValueLoop: vn,
    endManipulation: random.weightedChoice([
      [undefined, 0.5],
      [{ type: "add", value: valueEnd }, 0.25],
      [{ type: "mult", value: valueEnd }, 0.25],
    ]),
    timeOrStars: "time",
  })
  forLine.for.do = printStatement(random)

  return {
    code: [{ block: [forLine] }],
    runtime: runtimeLinear,
  }
}
