import {
  linearFor1,
  linearFor2,
  linearForALl1,
} from "@shared/question-generators/time/utilsAsymptotic/blocks/linearFor.ts"
import {
  printStatement,
  runtimeSquare,
  type LoopAsymptoticVariant,
} from "@shared/question-generators/time/utilsAsymptotic/utils.ts"
import type Random from "@shared/utils/random.ts"

export function getLoopSquareTime(random: Random): LoopAsymptoticVariant {
  return random.choice([squareVariant1])(random, 0, 0)
}

export function squareVariant1(
  random: Random,
  iterDepth: number,
  finalDepth: number,
): LoopAsymptoticVariant {
  const pickLoop = (depth: number) =>
    random.choice([linearForALl1, linearFor1, linearFor2])(random, depth, finalDepth)

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
