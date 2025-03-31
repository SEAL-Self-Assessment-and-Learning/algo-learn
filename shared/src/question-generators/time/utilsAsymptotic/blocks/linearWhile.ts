import { createWhileLine, type BoundsOptions } from "@shared/question-generators/time/utils.ts"
import { finalValue, iterator } from "@shared/question-generators/time/utilsAsymptotic/utils.ts"
import type {
  PseudoCodeAssignment,
  PseudoCodeBlock,
  PseudoCodeWhile,
} from "@shared/utils/pseudoCodeUtils.ts"
import type Random from "@shared/utils/random.ts"

export const linearWhile1 = (random: Random, iterDepth: number, finalDepth: number): PseudoCodeBlock => {
  const iAssignment: PseudoCodeAssignment = {
    assignment: iterator[iterDepth].variable,
    value: random.weightedChoice([
      [[random.int(1, 9).toString()], 0.8],
      [[`${random.int(4, 7)}^${random.int(5, 9)}`], 0.2],
      [[`\\text{random.choice}(\\{1,\\ldots,`, finalValue[finalDepth], "\\})"], 0.05],
    ]),
  }
  const firstMani: BoundsOptions = random.choice([
    { type: "mult", value: random.int(2, 5) },
    { type: "div", valueD: random.int(2, 5) },
  ])
  const secondMani: BoundsOptions = random.choice([
    { type: "mult", value: random.int(2, 5) },
    { type: "div", valueD: random.int(2, 5) },
  ])
  const iFirst: boolean = random.bool()
  const whileLine: PseudoCodeWhile = createWhileLine({
    start: iFirst ? iterator[iterDepth] : finalValue[finalDepth],
    end: iFirst ? finalValue[finalDepth] : iterator[iterDepth],
    compare: iFirst ? random.choice([" < ", " \\leq "]) : random.choice([" > ", " \\geq "]),
    timeOrStars: "time",
    ...(random.bool(1 / 3) ? { startManipulation: firstMani } : {}),
    ...(random.bool(1 / 3) ? { endManipulation: secondMani } : {}),
  })
  return { block: [{ state: iAssignment }, whileLine] }
}
