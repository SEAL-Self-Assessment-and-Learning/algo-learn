import {
  BoundsOptions,
  createForLine,
  createIfCondition,
  IfOptions,
} from "@shared/question-generators/time/utils.ts"
import { calculateNumberOfStars } from "@shared/question-generators/time/utilsStars/utils.ts"
import {
  printStarsNew,
  PseudoCode,
  PseudoCodeBlock,
  PseudoCodeFor,
  PseudoCodeForAll,
  PseudoCodeIf,
} from "@shared/utils/pseudoCodeUtils.ts"
import Random from "@shared/utils/random.ts"

/**
 * This function generates random variables for the loop
 * Those variables are the structure of the loop
 * @param random
 */
function generateRandomConditions(random: Random) {
  const low = random.int(0, 2)
  const high = random.int(6, 10)

  const endManipulation = random.weightedChoice([
    ["none" as BoundsOptions, 0.7],
    [{ type: "mult", value: random.int(2, 3) }, 0.125],
    [{ type: "square", abs: false }, 0.125],
    [{ type: "log", value: 2 }, 0.05],
  ])

  const cond: IfOptions = random.choice(["none", "even", "odd", "square"])
  const elseStatement = cond !== "none" ? random.bool(0.7) : false

  return { low, high, endManipulation, cond, elseStatement }
}

/**
 * This function checks if the loop should continue
 * @param i - current iteration of the loop
 * @param endManipulation - the manipulation of the end value of the loop
 * @param endValueLoop - the end value of the loop
 */
function forLoopConditionCheck(i: number, endManipulation: BoundsOptions, endValueLoop: number) {
  let compareValue: number
  if (endManipulation === "none") {
    compareValue = endValueLoop
  } else if (endManipulation.type === "mult") {
    compareValue = endValueLoop * endManipulation.value
  } else if (endManipulation.type === "square") {
    compareValue = endValueLoop * endValueLoop
  } else {
    compareValue = Math.ceil(Math.log2(endValueLoop))
  }

  return i <= compareValue
}

/**
 * This function creates the pseudo code for the for-loop
 * @param innerVar
 * @param low
 * @param high
 * @param endManipulation
 * @param cond
 * @param numPrint
 * @param elseStatement
 * @param numPrintElse
 */
function createPseudoCodeFor({
  innerVar,
  low,
  high,
  endManipulation,
  cond,
  numPrint,
  elseStatement,
  numPrintElse,
}: {
  innerVar: string
  low: number
  high: number
  endManipulation: BoundsOptions
  cond: IfOptions
  numPrint: number
  elseStatement: boolean
  numPrintElse: number
}) {
  const completeCode: PseudoCode = []
  const bodyBlock: PseudoCodeBlock = {
    block: [],
  }
  completeCode.push(bodyBlock)

  const forStatement: PseudoCodeFor | PseudoCodeForAll = createForLine({
    innerVar,
    start: low.toString(),
    end: high.toString(),
    endManipulation,
  })
  bodyBlock.block.push(forStatement)

  if (cond === "none") {
    if ("forAll" in forStatement) {
      forStatement.forAll.do = {
        block: [printStarsNew(numPrint)],
      }
    } else {
      forStatement.for.do = {
        block: [printStarsNew(numPrint)],
      }
    }
  } else {
    const ifStatement: PseudoCodeIf = createIfCondition({
      innerVar1: innerVar,
      condition: cond,
      elseStatement,
      numPrint,
      numPrintElse,
    })
    if ("forAll" in forStatement) {
      forStatement.forAll.do = {
        block: [ifStatement],
      }
    } else {
      forStatement.for.do = {
        block: [ifStatement],
      }
    }
  }
  return completeCode
}

/**
 * This function generates code for a for loop
 *
 * Example:
 * for t from 1 to 9
 *   if t is odd
 *     print("***")
 *
 * @param innerVar
 * @param numPrint
 * @param numPrintElse
 * @param numStars
 * @param random
 */
export function generateForLoopQuestion(
  innerVar: string,
  numPrint: number,
  numPrintElse: number,
  numStars: number,
  random: Random,
) {
  const { low, high, endManipulation, cond, elseStatement } = generateRandomConditions(random)

  const completeCode = createPseudoCodeFor({
    innerVar,
    low,
    high,
    endManipulation,
    cond,
    numPrint,
    elseStatement,
    numPrintElse,
  })

  for (let i = low; forLoopConditionCheck(i, endManipulation, high); i++) {
    numStars += calculateNumberOfStars(cond, i, numPrint, numPrintElse, elseStatement)
  }

  return { numStars, code: completeCode }
}
