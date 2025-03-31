import {
  finalValue,
  iterator,
  printStatement,
} from "@shared/question-generators/time/utilsAsymptotic/utils.ts"
import { printStarsNew, type PseudoCodeIf, type PseudoCodeState } from "@shared/utils/pseudoCodeUtils.ts"
import type Random from "@shared/utils/random.ts"

export const randomPrintBlock = (random: Random, depth: number): PseudoCodeState | PseudoCodeIf => {
  return random.choice([printBlock1, printBlock2, printBlock3])(random, depth)
}

export const printBlock1 = (random: Random, depth: number): PseudoCodeState => {
  return printStatement(random, depth)
}

export const printBlock2 = (random: Random, depth: number): PseudoCodeIf => {
  return {
    if: {
      condition: [iterator[depth], "<", finalValue[depth]],
      then: printStatement(random, depth),
    },
  }
}

export const printBlock3 = (random: Random, depth: number): PseudoCodeIf => {
  return {
    if: {
      condition: [iterator[depth], "<", finalValue[depth]],
      then: printStatement(random, depth),
      else: printStarsNew(random.int(4, 5)),
    },
  }
}
