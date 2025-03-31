import {
  linearVariant1,
  linearVariant2,
} from "@shared/question-generators/time/utilsAsymptotic/linear.ts"
import { iterator, printStatement } from "@shared/question-generators/time/utilsAsymptotic/utils.ts"
import type {
  PseudoCodeBlock,
  PseudoCodeIf,
  PseudoCodeString,
  PseudoCodeVariable,
} from "@shared/utils/pseudoCodeUtils.ts"
import type Random from "@shared/utils/random.ts"

const condition1 = (random: Random, iterDepth: number, constIf: boolean): PseudoCodeString => {
  const variableCondition = (variable: PseudoCodeVariable) =>
    random.choice([
      [variable],
      [`${random.int(2, 5)} \\cdot `, variable],
      ["\\frac{", variable, `}{${random.int(2, 5)}}`],
    ])
  return random.bool()
    ? [
        ...variableCondition(iterator[iterDepth]),
        constIf ? (random.bool() ? " < " : " \\leq ") : random.bool() ? " > " : " \\geq ",
        random.choice(["10", "1000", `${random.int(3, 5)}^${random.int(4, 7)}`]),
      ]
    : [
        random.choice(["10", "1000", `${random.int(3, 5)}^${random.int(4, 7)}`]),
        !constIf ? (random.bool() ? " < " : " \\leq ") : random.bool() ? " > " : " \\geq ",
        ...variableCondition(iterator[iterDepth]),
      ]
}

const conditionConstant = (random: Random, iterDepth: number): PseudoCodeString => {
  return [
    iterator[iterDepth],
    random.bool() ? " < " : " \\leq ",
    random.choice(["10", "1000", `${random.int(3, 5)}^${random.int(4, 7)}`]),
  ]
}

export const ifConstant1 = (random: Random, iterDepth: number): PseudoCodeIf => {
  return {
    if: {
      condition: condition1(random, iterDepth, random.bool()),
      then: printStatement(random, iterDepth),
    },
  }
}

export const ifConstant2 = (random: Random, iterDepth: number, finalDepth: number): PseudoCodeIf => {
  return {
    if: {
      condition: condition1(random, iterDepth, true),
      then: random.choice([linearVariant1, linearVariant2])(random, iterDepth + 1, finalDepth)
        .code[0] as PseudoCodeBlock,
    },
  }
}

export const ifConstant3 = (random: Random, iterDepth: number, finalDepth: number): PseudoCodeIf => {
  return {
    if: {
      condition: condition1(random, iterDepth, false),
      then: printStatement(random, iterDepth),
      else: random.choice([linearVariant1, linearVariant2])(random, iterDepth + 1, finalDepth)
        .code[0] as PseudoCodeBlock,
    },
  }
}

export const ifConstant4 = (random: Random, iterDepth: number, finalDepth: number): PseudoCodeIf => {
  const ifConst = random.bool()
  return {
    if: {
      condition: condition1(random, iterDepth, ifConst),
      then: ifConst
        ? (random.choice([linearVariant1, linearVariant2])(random, iterDepth + 1, finalDepth)
            .code[0] as PseudoCodeBlock)
        : printStatement(random, iterDepth),
      elseif: [
        {
          condition: conditionConstant(random, iterDepth),
          then: random.bool()
            ? printStatement(random, iterDepth)
            : (random.choice([linearVariant1, linearVariant2])(random, iterDepth + 1, finalDepth)
                .code[0] as PseudoCodeBlock),
        },
      ],
      else: printStatement(random, iterDepth),
    },
  }
}
