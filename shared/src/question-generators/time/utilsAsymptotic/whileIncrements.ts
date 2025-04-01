import {
  linearVariant1,
  linearVariant2,
} from "@shared/question-generators/time/utilsAsymptotic/linear.ts"
import { finalValue, iterator } from "@shared/question-generators/time/utilsAsymptotic/utils.ts"
import type {
  PseudoCodeBlock,
  PseudoCodeFor,
  PseudoCodeForAll,
  PseudoCodeIf,
  PseudoCodeState,
  PseudoCodeWhile,
} from "@shared/utils/pseudoCodeUtils.ts"
import type Random from "@shared/utils/random.ts"

export function linearWhileIncrements(
  random: Random,
  iterDepth: number,
  finalDepth: number,
  weights?: number[],
): PseudoCodeFor | PseudoCodeState | PseudoCodeForAll | PseudoCodeWhile | PseudoCodeIf {
  return random.weightedChoice([
    [
      {
        state: {
          assignment: iterator[iterDepth].variable,
          value: [
            iterator[iterDepth],
            "+ \\lceil \\frac{",
            iterator[iterDepth],
            "}{",
            finalValue[finalDepth],
            "} \\rceil",
          ],
        },
      },
      weights ? (weights[0] ?? 1) : 1,
    ],
    [
      {
        state: {
          assignment: iterator[iterDepth].variable,
          value: [
            iterator[iterDepth],
            "+ \\lceil \\frac{",
            iterator[iterDepth],
            "}{",
            finalValue[finalDepth],
            "} \\rceil",
          ],
        },
      },
      weights ? (weights[1] ?? 1) : 1,
    ],
    [
      {
        state: {
          assignment: iterator[iterDepth].variable,
          value: [
            iterator[iterDepth],
            "+ (",
            iterator[iterDepth],
            " \\mod ",
            random.int(2, 5).toString(),
            ") + 1",
          ],
        },
      },
      weights ? (weights[2] ?? 1) : 1,
    ],
    [
      {
        if: {
          condition: [iterator[iterDepth], ` \\mod ${random.int(2, 5)} == ${random.int(0, 1)}`],
          then: {
            state: {
              assignment: iterator[iterDepth].variable,
              value: [iterator[iterDepth], `+ ${random.choice([1, 3, 5, 7])}`],
            },
          },
          else: {
            state: {
              assignment: iterator[iterDepth].variable,
              value: [iterator[iterDepth], `+ ${random.choice([2, 4, 6, 8])}`],
            },
          },
        },
      },
      weights ? (weights[3] ?? 1) : 1,
    ],
    [
      {
        if: {
          condition: random.choice([
            [iterator[iterDepth], ` == `, finalValue[finalDepth]],
            [`${random.int(2, 9)} \\cdot `, iterator[iterDepth], ` == `, finalValue[finalDepth]],
            [iterator[iterDepth], ` == \\frac{`, finalValue[finalDepth], `}{${random.int(4, 9)}}`],
          ]),
          then: {
            block: [
              {
                state: {
                  assignment: finalValue[finalDepth + 1].variable,
                  value: [
                    finalValue[finalDepth],
                    ` ${random.choice([" + ", " \\cdot "])} ${random.int(2, 5)}`,
                  ],
                },
              },
              ...(
                random.choice([linearVariant1, linearVariant2])(random, iterDepth + 1, finalDepth + 1)
                  .code[0] as PseudoCodeBlock
              ).block,
            ],
          },
          else: {
            state: {
              assignment: "i",
              value: [iterator[iterDepth], `+ ${random.int(1, 5)}`],
            },
          },
        },
      },
      weights ? (weights[4] ?? 1) : 1,
    ],
  ])
}
