import { generateForLoopQuestion } from "@shared/question-generators/time/utilsStars/uitlsFor.ts"
import { createForForLoop } from "@shared/question-generators/time/utilsStars/utilsForFor.ts"
import { createWhileLoop } from "@shared/question-generators/time/utilsStars/utilsWhile.ts"
import { PseudoCode } from "@shared/utils/pseudoCodeUtils.ts"
import Random from "@shared/utils/random.ts"

/**
 * Sample the source code of a loop that prints stars
 *
 * @param random
 * @returns - Object containing the source code, the name of the function, the
 *   name of the variable, the number of stars printed in the base case and in
 *   the recursive case, as well as the number of recursive calls and the number
 *   to divide by.
 */
export function sampleLoopStars(random: Random): {
  functionText: PseudoCode
  functionName: string
  n: string
  numStars: number
} {
  const functionName = random.choice("fghPp".split(""))
  const variable = random.choice("nmNMxyztk".split(""))
  const availableVarNames = "nmNMxyztk".split("").filter((c) => c !== variable)
  const { code, numStars } = sampleExact({
    random,
    availableVarNames,
  })
  return {
    functionText: code,
    functionName,
    n: variable,
    numStars,
  }
}

/**
 * Sample the source code of a simple loop that prints stars
 *
 * @param props
 * @param props.random - Random number generator
 * @param props.availableVarNames - Variable names that can be used
 * @returns Source code
 */
export function sampleExact({
  random,
  availableVarNames = "nmNMxyztk".split(""),
}: {
  random: Random
  availableVarNames?: string[]
}): { code: PseudoCode; numStars: number } {
  const innerVar = random.choice(availableVarNames)
  const innerVar2 = random.choice(availableVarNames.filter((v) => v !== innerVar))

  // All possible numPrint values, which could occur inside a loop
  // numPrintMiddle... currently only necessary for "forfor" loops
  const numPrint = random.int(1, 4)
  const numPrintElse = random.choice([1, 2, 3, 4].filter((n) => n !== numPrint))
  const numPrintMiddle = random.choice([1, 2, 3, 4])
  const numPrintMiddleIf = random.choice([1, 2, 3, 4])
  const numPrintMiddleElse = random.choice([1, 2, 3, 4].filter((n) => n !== numPrintMiddleIf))
  const numPrintAfter = random.choice([1, 2, 3, 4])

  const loopType: "for" | "forfor" | "while" = random.choice(["for", "forfor", "while"])

  if (loopType === "for") {
    const forResult = generateForLoopQuestion(innerVar, numPrint, numPrintElse, 0, random)
    return {
      numStars: forResult.numStars,
      code: forResult.code,
    }
  } else if (loopType === "forfor") {
    const forForResult = createForForLoop(
      innerVar,
      innerVar2,
      numPrint,
      numPrintElse,
      numPrintMiddle,
      numPrintMiddleIf,
      numPrintMiddleElse,
      numPrintAfter,
      0,
      random,
    )
    return {
      numStars: forForResult.numStars,
      code: forForResult.code,
    }
  } else if (loopType === "while") {
    const whileLoopResult = createWhileLoop(
      innerVar,
      innerVar2,
      0,
      numPrint,
      numPrintElse,
      numPrintAfter,
      random,
    )
    return {
      numStars: whileLoopResult.numStars,
      code: whileLoopResult.code,
    }
  } else {
    throw new Error("Unknown loop type")
  }
}

/**
 * This function calculates the number of stars to print based on the condition
 *
 * @param cond the condition to check
 * @param i the current value of the loop
 * @param numPrint number of stars to print in the if condition
 * @param numPrintElse number of stars to print in the else condition
 * @param elseStatement if an else statement should be printed
 * @param j the second value of the loop (only if two loops) (default NaN)
 */
export function calculateNumberOfStars(
  cond: string,
  i: number,
  numPrint: number,
  numPrintElse: number,
  elseStatement: boolean,
  j: number = Number.NaN,
): number {
  let numStars = 0
  if (cond === "odd" && (i % 2 === 1 || i % 2 === -1)) numStars += numPrint
  else if (cond === "odd" && i % 2 === 0 && elseStatement) numStars += numPrintElse
  else if (cond === "even" && i % 2 === 0) numStars += numPrint
  else if (cond === "even" && (i % 2 === 1 || i % 2 === -1) && elseStatement) numStars += numPrintElse
  else if (cond === "square" && Number.isInteger(Math.sqrt(i))) numStars += numPrint
  else if (cond === "square" && !Number.isInteger(Math.sqrt(i)) && elseStatement)
    numStars += numPrintElse
  else if (cond === "same" && i === j) numStars += numPrint
  else if (cond === "same" && elseStatement && i !== j) numStars += numPrintElse
  else if (cond === "none") numStars += numPrint
  return numStars
}
