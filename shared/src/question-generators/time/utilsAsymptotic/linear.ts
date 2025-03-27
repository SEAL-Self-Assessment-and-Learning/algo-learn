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
  return linearVariant1(random)
}

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
    endValueLoop: { variable: "n" },
    endManipulation: random.weightedChoice([
      [{ type: "add", value: valueU }, 1 / 3],
      [{ type: "mult", value: valueD }, 1 / 3],
      [{ type: "div", valueD }, 1 / 6],
      [{ type: "div", valueD, valueU }, 1 / 6],
    ]),
    timeOrStars: "time",
  })
  forLine.for.do = random.choice([
    printStarsNew(random.int(1, 3)),
    {
      state: {
        print: [{ variable: "i" }],
      },
    },
  ])

  return {
    code: [{ block: [forLine] }],
    runtime: runtimeLinear,
  }
}
