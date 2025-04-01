import {
  ifLinear1,
  ifLinear2,
  ifLinear3,
} from "@shared/question-generators/time/utilsAsymptotic/blocks/ifLinear.ts"
import {
  linearFor1,
  linearFor2,
  linearForAll1,
} from "@shared/question-generators/time/utilsAsymptotic/blocks/linearFor.ts"
import {
  squareFor1,
  squareForAll1,
} from "@shared/question-generators/time/utilsAsymptotic/blocks/squareFor.ts"
import {
  finalValue,
  iterator,
  printStatement,
  runtimeSquare,
  type LoopAsymptoticVariant,
} from "@shared/question-generators/time/utilsAsymptotic/utils.ts"
import { min } from "@shared/utils/math.ts"
import type { PseudoCodeFor } from "@shared/utils/pseudoCodeUtils.ts"
import type Random from "@shared/utils/random.ts"

export function getLoopSquareTime(random: Random): LoopAsymptoticVariant {
  return random.choice([squareVariant1, squareVariant2, squareVariant3, squareVariant4])(random, 0, 0)
}

export function squareVariant1(
  random: Random,
  iterDepth: number,
  finalDepth: number,
): LoopAsymptoticVariant {
  const squareFor = random.choice([squareFor1, squareForAll1])(random, iterDepth, finalDepth)

  if ("forAll" in squareFor) {
    squareFor.forAll.do = printStatement(random, iterDepth)
  } else {
    squareFor.for.do = printStatement(random, iterDepth)
  }

  return {
    code: [{ block: [squareFor] }],
    runtime: runtimeSquare,
  }
}

export function squareVariant2(
  random: Random,
  iterDepth: number,
  finalDepth: number,
): LoopAsymptoticVariant {
  const pickLoop = (depth: number) =>
    random.choice([linearForAll1, linearFor1, linearFor2])(random, depth, finalDepth)

  const forLine1 = pickLoop(iterDepth)
  const forLine2 = pickLoop(iterDepth + 1)

  const forBlock = { block: [forLine2] }
  ;("forAll" in forLine2 ? forLine2.forAll : forLine2.for).do = printStatement(
    random,
    iterDepth + random.int(0, 1),
  )
  ;("forAll" in forLine1 ? forLine1.forAll : forLine1.for).do = forBlock

  return {
    code: [{ block: [forLine1] }],
    runtime: runtimeSquare,
  }
}

export function squareVariant3(
  random: Random,
  iterDepth: number,
  finalDepth: number,
): LoopAsymptoticVariant {
  const forLine = random.choice([linearFor1, linearFor2, linearForAll1])(random, iterDepth, finalDepth)

  if ("forAll" in forLine) {
    forLine.forAll.do = {
      block: [random.choice([ifLinear1, ifLinear2, ifLinear3])(random, iterDepth, finalDepth)],
    }
  } else {
    forLine.for.do = {
      block: [random.choice([ifLinear1, ifLinear2, ifLinear3])(random, iterDepth, finalDepth)],
    }
  }

  return {
    code: [{ block: [forLine] }],
    runtime: runtimeSquare,
  }
}

export function squareVariant4(random: Random, iterDepth: number, finalDepth: number) {
  const startFirst = random.int(1, 9)
  const startSecond = min(startFirst, random.int(1, 9))
  const forLine: PseudoCodeFor = {
    for: {
      variable: iterator[iterDepth].variable,
      from: [startFirst.toString()],
      to: [finalValue[finalDepth]],
      do: {
        block: [
          {
            for: {
              variable: iterator[iterDepth + 1].variable,
              from: [startSecond.toString()],
              to: random.choice([
                [iterator[iterDepth]],
                [`${random.int(2, 9)} \\cdot `, iterator[iterDepth]],
              ]),
              do: printStatement(random, iterDepth + random.int(0, 1)),
            },
          },
        ],
      },
    },
  }
  return {
    code: [{ block: [forLine] }],
    runtime: runtimeSquare,
  }
}
