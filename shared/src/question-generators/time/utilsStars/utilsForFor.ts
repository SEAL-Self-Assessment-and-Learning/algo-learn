import {
  BoundsOptions,
  createForLine,
  createIfCondition,
  IfOptions,
} from "@shared/question-generators/time/utils.ts"
import { calculateNumberOfStars } from "@shared/question-generators/time/utilsStars/calculateNumberOfStars.ts"
import {
  printStarsNew,
  PseudoCode,
  PseudoCodeBlock,
  PseudoCodeFor,
  PseudoCodeForAll,
  PseudoCodeVariable,
} from "@shared/utils/pseudoCodeUtils.ts"
import Random from "@shared/utils/random.ts"

/**
 * This function generates code for a double for loop
 * We don't use blocks here we can use the same variables for both loops
 *
 * Example:
 * for y from 0 to 9:
 *   if y is square
 *     print("**")
 *   for x from y*2 to 20*2:
 *     if x is even
 *       print("*")
 *     else:
 *       print("**")
 *
 * @param firstVariableName the name of the first variable
 * @param secondVariableName
 * @param numPrint number of stars to print in the if condition
 * @param numPrintElse number of stars to print in the else condition
 * @param numPrintMiddle number of stars to print in between the two loops
 * @param numPrintMiddleIf number of stars to print in the if condition in the first loop
 * @param numPrintMiddleElse
 * @param numPrintAfter print stars after both loops
 * @param numStars total number of stars calculated
 * @param random
 */
export function createForForLoop(
  firstVariableName: string,
  secondVariableName: string,
  numPrint: number,
  numPrintElse: number,
  numPrintMiddle: number,
  numPrintMiddleIf: number,
  numPrintMiddleElse: number,
  numPrintAfter: number,
  numStars: number,
  random: Random,
) {
  // get all possible random variables via helper function
  const {
    startFirst,
    stepFirst,
    endFirst,
    endFirstManipulation,
    printStarsMiddle,
    condMiddle,
    elseMiddle,
    startSecond,
    startSecondManipulation,
    startSecondManipulationValue,
    stepSecond,
    endSecond,
    endSecondManipulation,
    condEnd,
    askFirstVar,
    elseEnd,
    printStarsAfter,
  } = generateForForRandomVariables(random)

  const pseudoCode: PseudoCode = []
  const pseudoCodeBlock: PseudoCodeBlock = {
    block: [],
  }
  pseudoCode.push(pseudoCodeBlock)

  let firstForStatement: PseudoCodeFor | PseudoCodeForAll
  if (stepFirst === 1) {
    // Generate the pseudocode
    firstForStatement = createForLine({
      variableName: firstVariableName,
      startValueLoop: startFirst.toString(),
      startManipulation: "none",
      endValueLoop: endFirst.toString(),
      endManipulation: endFirstManipulation,
    })
    pseudoCodeBlock.block.push(firstForStatement)
  } else {
    const stepSet = createStepSet({
      start: startFirst,
      end: endFirst,
      step: stepFirst,
      endFirstManipulation,
    })
    firstForStatement = createForLine({
      variableName: firstVariableName,
      stepSet,
    })
    pseudoCodeBlock.block.push(firstForStatement)
  }

  const firstForBlock: PseudoCodeBlock = {
    block: [],
  }
  // differ between for and forAll (x in {...})
  if ("forAll" in firstForStatement) {
    firstForStatement.forAll.do = firstForBlock
  } else {
    firstForStatement.for.do = firstForBlock
  }
  // printsStarsMiddle
  if (printStarsMiddle) {
    firstForBlock.block.push(printStarsNew(numPrintMiddle))
  }

  // if middle
  if (condMiddle !== "none") {
    const ifForStatementMiddle = createIfCondition({
      firstVariableName: firstVariableName,
      condition: condMiddle,
      elseStatement: elseMiddle,
      numPrint: numPrintMiddleIf,
      numPrintElse: numPrintMiddleElse,
    })
    firstForBlock.block.push(ifForStatementMiddle)
  } else {
    // if the condition is none (we still want to print stars) in this case (printStarsMiddle is false)
    firstForBlock.block.push(printStarsNew(numPrintMiddleIf))
  }

  let startManipulation: BoundsOptions = "none"
  let startValue: string | PseudoCodeVariable = startSecond.toString()
  if (startSecondManipulation === "var-normal") {
    startValue = { variable: firstVariableName }
  } else if (startSecondManipulation === "var-mult") {
    startValue = { variable: firstVariableName }
    startManipulation = { type: "mult", value: startSecondManipulationValue }
  } else if (startSecondManipulation === "var-square") {
    startValue = { variable: firstVariableName }
    // we only have positive numbers so abs is not necessary
    startManipulation = { type: "square", abs: false }
  }
  let secondForStatement: PseudoCodeFor | PseudoCodeForAll
  if (stepSecond === 1) {
    // Generate the pseudocode
    secondForStatement = createForLine({
      variableName: secondVariableName,
      startValueLoop: startValue,
      startManipulation: startManipulation,
      endValueLoop: endSecond.toString(),
      endManipulation: endSecondManipulation,
    })
    firstForBlock.block.push(secondForStatement)
  } else {
    const stepSet = createStepSet({
      start: startSecond,
      end: endSecond,
      step: stepSecond,
      endFirstManipulation: endSecondManipulation,
    })
    secondForStatement = createForLine({
      variableName: secondVariableName,
      stepSet,
    })
    firstForBlock.block.push(secondForStatement)
  }

  const secondForBlock: PseudoCodeBlock = {
    block: [],
  }
  // differ between for and forAll (x in {...})
  if ("forAll" in secondForStatement) {
    secondForStatement.forAll.do = secondForBlock
  } else {
    secondForStatement.for.do = secondForBlock
  }

  // create the if inside the second for loop
  let askVar = `${secondVariableName}`
  if (askFirstVar) {
    askVar = `${firstVariableName}`
  }
  if (condEnd !== "none") {
    const secondIfStatement = createIfCondition({
      firstVariableName: askVar,
      secondVariableName: askVar === firstVariableName ? secondVariableName : firstVariableName,
      condition: condEnd,
      elseStatement: elseEnd,
      numPrint,
      numPrintElse,
    })
    secondForBlock.block.push(secondIfStatement)
  } else {
    // if there is no if condition we still want to print stars (empty for loop does not make sense)
    secondForBlock.block.push(printStarsNew(numPrint))
  }

  // print stars after
  if (printStarsAfter) {
    // no inside any loop
    pseudoCodeBlock.block.push(printStarsNew(numPrintAfter))
  }

  const endFirstValue =
    endFirstManipulation === "none"
      ? endFirst
      : endFirstManipulation.type === "mult"
        ? endFirst * endFirstManipulation.value
        : endFirstManipulation.type === "square"
          ? endFirst * endFirst
          : Math.ceil(Math.log2(endFirst))

  // first loop
  for (let i = startFirst; i <= endFirstValue; i += stepFirst) {
    if (printStarsMiddle) numStars += numPrintMiddle

    numStars += calculateNumberOfStars(condMiddle, i, numPrintMiddleIf, numPrintMiddleElse, elseMiddle)

    // second loop
    let j =
      startSecondManipulation === "var-normal"
        ? i
        : startSecondManipulation === "var-mult"
          ? i * startSecondManipulationValue
          : startSecondManipulation === "var-square"
            ? i * i
            : startSecond
    const endSecondValue =
      endSecondManipulation === "none"
        ? endSecond
        : endSecondManipulation.type === "square"
          ? endSecond * endSecond
          : endSecondManipulation.type === "log"
            ? Math.ceil(Math.log2(endSecond))
            : endSecondManipulation.type === "mult"
              ? endSecond * endSecondManipulation.value
              : Number.NaN

    if (Number.isNaN(endSecondValue)) {
      throw new Error("There should not be a manipulation value except none, square, log and mult")
    }

    for (; j <= endSecondValue; j += stepSecond) {
      numStars += calculateNumberOfStars(
        condEnd,
        askFirstVar ? i : j,
        numPrint,
        numPrintElse,
        elseEnd,
        askFirstVar ? j : i,
      )
    }
  }

  if (printStarsAfter) numStars += numPrintAfter

  return { code: pseudoCode, numStars }
}

function createStepSet({
  start,
  end,
  step,
  endFirstManipulation,
}: {
  start: number
  end: number
  step: number
  endFirstManipulation: BoundsOptions
}) {
  if (endFirstManipulation === "none") {
    let stepSet = "\\{"
    for (let i = start; i <= end; i += step) {
      if (i + step <= end) {
        stepSet += i.toString() + ", "
      } else {
        stepSet += i.toString() + "\\}"
      }
    }
    return stepSet
  } else {
    let stepSet = `\\{${start}, ${start + step}, ${start + 2 * step}, \\dots, `
    if (endFirstManipulation.type === "square") {
      let rowEndNumber = start
      while (rowEndNumber + step <= end * end) {
        rowEndNumber += step
      }
      // Calculate the difference
      const difference = rowEndNumber - end * end
      // Create the stepSet string
      stepSet += `${end}^2 ${difference < 0 ? difference.toString() : ""}\\}`
    } else if (endFirstManipulation.type === "mult") {
      let rowEndNumber = start
      while (rowEndNumber + step <= end * endFirstManipulation.value) {
        rowEndNumber += step
      }
      const difference = rowEndNumber - end * endFirstManipulation.value
      stepSet += `${end}\\cdot${endFirstManipulation.value} ${difference < 0 ? difference.toString() : ""}\\}`
    } else {
      throw new Error("No other manipulation for endFirstManipulation")
    }

    return stepSet
  }
}

/**
 * A function to generate the random variables for the forfor loop option
 * @param random
 */
function generateForForRandomVariables(random: Random) {
  // currently nut using log (but could just un-comment to use it)
  const endManipulationOptions: BoundsOptions[] = [
    "none",
    { type: "mult", value: random.int(2, 3) },
    { type: "square", abs: false },
  ]
  // no square, no same
  const ifOptions: IfOptions[] = ["even", "odd", "none"]

  // at first, we randomly choose all the possible options inside both loops
  const startFirst = random.int(0, 3)
  const stepFirst = random.weightedChoice([
    [1, 0.5],
    [2, 0.35],
    [3, 0.15],
  ])
  const endFirst = random.int(6, 10)

  const endFirstManipulation: BoundsOptions = random.weightedChoice([
    [endManipulationOptions[0], 0.7],
    [endManipulationOptions[1], 0.125],
    [endManipulationOptions[2], 0.125],
  ])

  let printStarsMiddle = random.bool(0.15)

  const condMiddle: IfOptions = random.choice(ifOptions)
  const elseMiddle: boolean = condMiddle === "none" ? false : random.bool(0.2)
  // if condMiddle is none (numPrintMiddleIf will be printed instead of numPrintMiddle)
  if (condMiddle === "none") printStarsMiddle = false

  const startSecond = random.int(0, 3)
  const startSecondManipulation: "none" | "var-normal" | "var-mult" | "var-square" =
    endFirstManipulation === "none"
      ? random.weightedChoice([
          ["none", 0.5],
          ["var-normal", 0.3],
          ["var-mult", 0.1],
          ["var-square", 0.1],
        ])
      : "none"
  const startSecondManipulationValue = random.int(2, 3) // only important for var-normal
  // if startSecondManipulation is not none, we cannot display a set nicely (it'd be {x,x+2,x+4,...,19} or so
  const stepSecond =
    stepFirst !== 1 || startSecondManipulation !== "none"
      ? 1
      : random.weightedChoice([
          [1, 0.2],
          [2, 0.4],
          [3, 0.4],
        ])

  // just in case, we check if twice
  if (startSecondManipulation !== "none" && stepSecond > 1) {
    throw new Error(
      "If the startSecondManipulation is not none, the stepSecond should be 1, because we cannot display a set nicely",
    )
  }

  // If we have a manipulation to the start value of the second for based on the first for loop,
  // we may need to increase the endValue of the second for loop for better results.
  // Otherwise, it could be for M from 2*x to 14 (with x \in [2...10])
  const additionalValue =
    startSecondManipulation === "var-normal" || startSecondManipulation === "none"
      ? endFirst
      : startSecondManipulation === "var-mult"
        ? endFirst * startSecondManipulationValue
        : endFirst * endFirst
  const endSecond =
    startSecondManipulation === "none" ? random.int(6, 10) : additionalValue + random.int(0, 2) // here the additional value is added
  // no log option, to avoid: for y from 2*m to ceil(log2(262144)) with y += 1
  const endSecondManipulation: BoundsOptions =
    endFirstManipulation !== "none"
      ? "none"
      : random.weightedChoice([
          [endManipulationOptions[0], 0.7],
          [endManipulationOptions[1], 0.125],
          [endManipulationOptions[2], 0.125],
        ])

  // definitely print stars at the end
  const condEnd: IfOptions = random.choice(["even", "odd", "same", "square", "none"])
  // if I want to ask inside the second if statement for a condition
  // based on the variable inside the first for loop
  const askFirstVar = random.weightedChoice([
    [true, 0.15],
    [false, 0.85],
  ])
  const elseEnd =
    condEnd === "none" || elseMiddle // no two else statements (would be too much)
      ? false
      : random.bool()

  const printStarsAfter = random.bool(0.05)

  return {
    startFirst,
    stepFirst,
    endFirst,
    endFirstManipulation,
    printStarsMiddle,
    condMiddle,
    elseMiddle,
    startSecond,
    startSecondManipulation,
    startSecondManipulationValue,
    stepSecond,
    endSecond,
    endSecondManipulation,
    condEnd,
    askFirstVar,
    elseEnd,
    printStarsAfter,
  }
}
