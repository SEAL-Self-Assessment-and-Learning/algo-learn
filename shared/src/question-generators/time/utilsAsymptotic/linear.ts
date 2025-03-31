import { cubeFor1 } from "@shared/question-generators/time/utilsAsymptotic/blocks/cubeFor.ts"
import {
  ifConstant1,
  ifConstant2,
  ifConstant3,
  ifConstant4,
} from "@shared/question-generators/time/utilsAsymptotic/blocks/ifConstant.ts"
import {
  linearFor1,
  linearFor2,
  linearForALl1,
} from "@shared/question-generators/time/utilsAsymptotic/blocks/linearFor.ts"
import { linearWhile1 } from "@shared/question-generators/time/utilsAsymptotic/blocks/linearWhile.ts"
import { squareFor1 } from "@shared/question-generators/time/utilsAsymptotic/blocks/squareFor.ts"
import {
  finalValue,
  iterator,
  printStatement,
  runtimeLinear,
  type LoopAsymptoticVariant,
} from "@shared/question-generators/time/utilsAsymptotic/utils.ts"
import { linearWhileIncrements } from "@shared/question-generators/time/utilsAsymptotic/whileIncrements.ts"
import type {
  PseudoCodeIf,
  PseudoCodeString,
  PseudoCodeVariable,
} from "@shared/utils/pseudoCodeUtils.ts"
import type Random from "@shared/utils/random.ts"

export function getLoopLinearTime(random: Random): LoopAsymptoticVariant {
  return random.choice([linearVariant1, linearVariant2, linearVariant3, linearVariant4])(random, 0, 0)
}

export function linearVariant1(
  random: Random,
  iterDepth: number,
  finalDepth: number,
): LoopAsymptoticVariant {
  const forLine = random.choice([
    linearForALl1(random, iterDepth, finalDepth),
    linearFor1(random, iterDepth, finalDepth),
    linearFor2(random, iterDepth, finalDepth),
  ])

  if ("forAll" in forLine) {
    forLine.forAll.do = printStatement(random, iterDepth)
  } else {
    forLine.for.do = printStatement(random, iterDepth)
  }

  return {
    code: [{ block: [forLine] }],
    runtime: runtimeLinear,
  }
}

export function linearVariant2(
  random: Random,
  iterDepth: number,
  finalDepth: number,
): LoopAsymptoticVariant {
  const forLine = random.bool()
    ? squareFor1(random, iterDepth, finalDepth)
    : cubeFor1(random, iterDepth, finalDepth)
  const variableCondition = (variable: PseudoCodeVariable) =>
    random.choice([
      [variable],
      [`${random.int(2, 5)} \\cdot `, variable],
      ["\\frac{", variable, `}{${random.int(2, 5)}}`],
    ])
  const condition: PseudoCodeString = random.bool()
    ? [
        ...variableCondition(iterator[iterDepth]),
        random.bool() ? " > " : " \\geq ",
        ...variableCondition(finalValue[finalDepth]),
      ]
    : [
        ...variableCondition(finalValue[finalDepth]),
        random.bool() ? " < " : " \\leq ",
        ...variableCondition(iterator[iterDepth]),
      ]
  const ifBlock: PseudoCodeIf = {
    if: {
      condition: condition,
      then: {
        block: [
          {
            state: {
              assignment: iterator[iterDepth].variable,
              value: [iterator[iterDepth], `^${random.int(2, 4)}`],
            },
          },
        ],
      },
    },
  }
  switch (random.int(0, 2)) {
    case 0:
      ifBlock.if.else = printStatement(random, iterDepth)
      break
    case 1:
      ;(ifBlock.if.then as { block: any[] }).block.push(printStatement(random, iterDepth))
      break
    case 2:
      break
  }

  forLine.for.do = { block: [ifBlock] }

  return {
    code: [{ block: [forLine] }],
    runtime: runtimeLinear,
  }
}

export function linearVariant3(
  random: Random,
  iterDepth: number,
  finalDepth: number,
): LoopAsymptoticVariant {
  const whileBlock = linearWhile1(random, iterDepth, finalDepth)
  if ("while" in whileBlock.block[1]) {
    whileBlock.block[1].while.do = { block: [linearWhileIncrements(random, iterDepth, finalDepth)] }
  }
  return {
    code: [whileBlock],
    runtime: runtimeLinear,
  }
}

export function linearVariant4(
  random: Random,
  iterDepth: number,
  finalDepth: number,
): LoopAsymptoticVariant {
  const forLine = random.choice([
    linearFor1(random, iterDepth, finalDepth),
    linearFor2(random, iterDepth, finalDepth),
  ])

  forLine.for.do = {
    block: [
      random.choice([ifConstant1, ifConstant2, ifConstant3, ifConstant4])(random, iterDepth, finalDepth),
    ],
  }

  return {
    code: [{ block: [forLine] }],
    runtime: runtimeLinear,
  }
}
