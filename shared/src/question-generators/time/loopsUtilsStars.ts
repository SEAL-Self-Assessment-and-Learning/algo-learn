import Random from "../../utils/random"
import { printStars } from "../recursion/formulaUtils"

/**
 * Sample the source code of a simple loop that prints stars
 *
 * @param random - Random number generator
 * @returns - Object containing the source code, the name of the function, the
 *   name of the variable, the number of stars printed in the base case and in
 *   the recursive case, as well as the number of recursive calls and the number
 *   to divide by.
 */
export function sampleLoop(random: Random) {
  const functionName = random.choice("fghPp".split(""))
  const variable = random.choice("nmNMxyztk".split(""))
  const availableVarNames = "nmNMxyztk".split("").filter((c) => c !== variable)
  const { code, numStars } = sampleExactIfEven({
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
 * @param props.indent - Indentation level
 * @returns Source code
 */
export function sampleExactIfEven({
  random,
  availableVarNames = "nmNMxyztk".split(""),
  indent = 0,
}: {
  random: Random
  availableVarNames?: string[]
  indent?: number
}) {
  const _ = " ".repeat(indent)
  const innerVar = random.choice(availableVarNames)
  const innerVar2 = random.choice(availableVarNames.filter((v) => v !== innerVar))
  const innerVar3 = random.choice(availableVarNames.filter((v) => v !== innerVar && v !== innerVar2))
  const innerVar4 = random.choice(
    availableVarNames.filter((v) => v !== innerVar && v !== innerVar2 && v !== innerVar3),
  )
  let code = ""
  let numStars = 0
  const numPrint = random.int(1, 4)
  const numPrintElse = random.choice([1, 2, 3, 4].filter((n) => n !== numPrint))
  const numPrintMiddle = random.choice([1, 2, 3, 4])
  const numPrintMiddleIf = random.choice([1, 2, 3, 4])
  const numPrintMiddleElse = random.choice([1, 2, 3, 4].filter((n) => n !== numPrintMiddleIf))
  const numPrintAfter = random.choice([1, 2, 3, 4])

  /*
  const loopType = random.choice([
    "for",
    "forfor",
    "while",
    "whilewhile",
    "forwhile",
    "whilefor",
  ])
   */
  /*
  Explanation of the possible loop structures:
  - for -> simple for loop
  - forfor -> nested for loop (the second loop can be dependent on the first)
  - while -> simple while loop (one or two Params)
  - whilewhileBlock -> nested while loop (the second is independent of the first)
   */
  const loopType = random.choice(["for", "forfor", "while", "whilewhileBlock"])
  // const loopType = random.choice(["forfor"])

  if (loopType === "for") {
    const forResult = createForLoop(innerVar, numPrint, numPrintElse, code, _, indent, numStars, random)

    code = forResult.code
    numStars = forResult.numStars
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
      code,
      indent,
      _,
      numStars,
      random,
    )

    code = forForResult.code
    numStars = forForResult.numStars
  } else if (loopType === "while") {
    const whileLoop = createWhileLoop(
      code,
      _,
      indent,
      innerVar,
      innerVar2,
      numStars,
      numPrint,
      numPrintElse,
      numPrintAfter,
      random,
    )
    code = whileLoop.code
    numStars = whileLoop.numStars
  } else if (loopType === "whilewhileBlock") {
    const secondWhileLoop = createWhileLoop(
      code,
      _,
      indent,
      innerVar,
      innerVar2,
      numStars,
      numPrint,
      numPrintElse,
      numPrintAfter,
      random,
    )

    const firstWhileLoop = createWhileLoop(
      code,
      _,
      indent,
      innerVar3,
      innerVar4,
      numStars,
      numPrint,
      numPrintElse,
      numPrintAfter,
      random,
      true,
      secondWhileLoop.numStars,
      secondWhileLoop.code,
    )

    code = firstWhileLoop.code
    numStars = firstWhileLoop.numStars
  }

  console.log(`Numstars: ${numStars}`)

  return { code: code.trim(), numStars }
}

/**
 * This function compare two values for var1 and var2 inside a while loop
 * it returns true if the condition is met, so the loop can continue
 * @param i
 * @param j
 * @param compare
 */
function compareTwoValues(i: number, j: number, compare: string) {
  return compare === "<"
    ? i < j
    : compare === "<="
      ? i <= j
      : compare === ">"
        ? i > j
        : compare === ">="
          ? i >= j
          : i === j
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
function calculateNumStars(
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
  else if (cond === "none") numStars += numPrint
  else if (cond === "same" && i === j) numStars += numPrint
  else if (cond === "same" && elseStatement && i !== j) numStars += numPrintElse
  return numStars
}

function createForLoop(
  innerVar: string,
  numPrint: number,
  numPrintElse: number,
  code: string,
  _: string,
  indent: number,
  numStars: number,
  random: Random,
) {
  const low = random.int(0, 2)
  const high = random.int(6, 10)

  const endManipulation = random.weightedChoice([
    ["none", 0.7],
    ["mult", 0.125],
    ["square", 0.125],
    ["log", 0.05],
  ])
  const endManipulationValue = random.int(2, 3)

  if (endManipulation === "mult") {
    code += `${_}for ${innerVar} from ${low} to ${high}*${endManipulationValue}:\n`
  } else if (endManipulation === "square") {
    code += `${_}for ${innerVar} from ${low} to ${high}*${high}:\n`
  } else if (endManipulation === "log") {
    code += `${_}for ${innerVar} from ${low} to ceil(log2(${high})):\n`
  } else {
    code += `${_}for ${innerVar} from ${low} to ${high}:\n`
  }
  const cond = random.choice(["even", "odd", "square", "none"])
  if (cond !== "none") {
    code += `${_}  if ${innerVar} is ${cond}\n`
  }
  code += printStars(numPrint, indent + (cond === "none" ? 2 : 4))
  const elseStatement =
    cond !== "none"
      ? random.weightedChoice([
          [true, 0.7],
          [false, 0.3],
        ])
      : false
  if (elseStatement) {
    code += `${_}  else:\n`
    code += printStars(numPrintElse, indent + 4)
  }

  for (
    let i = low;
    i <=
    (endManipulation === "none"
      ? high
      : endManipulation === "mult"
        ? high * endManipulationValue
        : endManipulation === "square"
          ? high * high
          : Math.ceil(Math.log2(high)));
    i++
  ) {
    numStars += calculateNumStars(cond, i, numPrint, numPrintElse, elseStatement)
  }

  return { numStars, code }
}

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
 * Result: 483 -> \sum_{i=11}^{20}(2i)+\sum_{i=12}^{21}(i)+8
 *
 * Just for fun: Also the options for a "continue" (never exit the second for loop)
 * and a "break" (exit the second for loop after the first iteration)
 *
 * @param innerVar the name of the first variable
 * @param innerVar2
 * @param numPrint number of stars to print in the if condition
 * @param numPrintElse number of stars to print in the else condition
 * @param numPrintMiddle number of stars to print in between the two loops
 * @param numPrintMiddleIf number of stars to print in the if condition in the first loop
 * @param numPrintMiddleElse
 * @param numPrintAfter print stars after both loops
 * @param code the code to append to
 * @param indent
 * @param _
 * @param numStars total number of stars calculated
 * @param random
 */
function createForForLoop(
  innerVar: string,
  innerVar2: string,
  numPrint: number,
  numPrintElse: number,
  numPrintMiddle: number,
  numPrintMiddleIf: number,
  numPrintMiddleElse: number,
  numPrintAfter: number,
  code: string,
  indent: number,
  _: string,
  numStars: number,
  random: Random,
) {
  // at first, we randomly choose all the possible options inside both loops
  const startFirst = random.int(0, 3)
  const stepFirst = random.weightedChoice([
    [1, 0.725],
    [2, 0.2],
    [3, 0.075],
  ])
  let endFirst = random.int(6, 10)
  const endFirstManipulation = random.weightedChoice([
    ["none", 0.7],
    ["mult", 0.125],
    ["square", 0.125],
    ["log", 0.05],
  ])
  if (endFirstManipulation === "log") endFirst += 2 // add 2 to get at least one iteration
  const endFirstManipulationValue = random.int(2, 3)
  const printStarsMiddle = random.weightedChoice([
    [true, 0.15],
    [false, 0.85],
  ])
  // square only if not square, because then it may be to complicated
  const options = ["even", "odd", ...(endFirstManipulation !== "square" ? ["square"] : []), "none"]
  const condMiddle = random.choice(options)
  const elseMiddle =
    condMiddle === "none"
      ? false
      : random.weightedChoice([
          [true, 0.25],
          [false, 0.75],
        ])

  const continueMiddle = random.weightedChoice([
    [true, 0.05],
    [false, 0.95],
  ])
  const startSecond = random.int(0, 3)
  const startSecondManipulation =
    endFirstManipulation === "none"
      ? random.weightedChoice([
          ["none", 0.7],
          ["var-normal", 0.2],
          ["var-mult", 0.05],
          ["var-square", 0.05],
        ])
      : "none"
  const startSecondManipulationValue = random.int(2, 3)
  const stepSecond =
    stepFirst !== 1
      ? 1
      : random.weightedChoice([
          [1, 0.6],
          [2, 0.3],
          [3, 0.1],
        ])
  // if we have a manipulation to the start value of the second for based on the first for loop, we may need to increase
  // the endValue of the second for loop for better results
  const additionalValue =
    startSecondManipulation === "var-normal" || startSecondManipulation === "none"
      ? 0
      : startSecondManipulation === "var-mult"
        ? endFirst * startSecondManipulationValue - endFirst
        : endFirst * endFirst - endFirst
  let endSecond =
    startSecondManipulation === "none"
      ? random.int(6, 10)
      : endFirst + additionalValue + random.int(0, 2) // here the additional value is added
  const endSecondManipulation =
    endFirstManipulation !== "none"
      ? false
      : random.weightedChoice([
          ["none", 0.7],
          ["mult", 0.125],
          ["square", 0.125],
          ["log", 0.05],
        ])
  // case we log the value, we first calc 2^endValue, so the log results are still sensible
  if (endSecondManipulation === "log") {
    endSecond = Math.pow(2, endSecond)
  }
  if (endSecondManipulation === "log") endSecond += 2
  const endSecondManipulationValue = random.int(2, 3)
  // definitely print stars at the end
  const condEnd = random.choice(["even", "odd", "same", "square", "none"])
  const askFirstVar = random.weightedChoice([
    [true, 0.2],
    [false, 0.8],
  ])
  const elseEnd =
    condEnd === "none" || elseMiddle
      ? false
      : random.weightedChoice([
          [true, 0.5],
          [false, 0.5],
        ])

  const breakEnd = random.weightedChoice([
    [true, 0.05],
    [false, 0.95],
  ])
  const printStarsAfter =
    condEnd !== "none" && condMiddle !== "none"
      ? false
      : random.weightedChoice([
          [true, 0.25],
          [false, 0.75],
        ])

  // log the data
  console.log(
    `StartFirst: ${startFirst}, StepFirst: ${stepFirst}, EndFirst: ${endFirst}, EndFirstManipulation: ${endFirstManipulation}, EndFirstManipulationValue: ${endFirstManipulationValue}`,
  )
  console.log(
    `PrintStarsMiddle: ${printStarsMiddle}, CondMiddle: ${condMiddle}, ElseMiddle: ${elseMiddle}, ContinueMiddle: ${continueMiddle}`,
  )
  console.log(
    `StartSecond: ${startSecond}, StartSecondManipulation: ${startSecondManipulation}, StartSecondManipulationValue: ${startSecondManipulationValue}, StepSecond: ${stepSecond}, EndSecond: ${endSecond}, EndSecondManipulation: ${endSecondManipulation}, EndSecondManipulationValue: ${endSecondManipulationValue}`,
  )

  // Generate the pseudocode
  // First for-loop
  let stepFirstString = ""
  if (stepFirst !== 1) {
    stepFirstString = ` with ${innerVar} += ${stepFirst}`
  }
  if (endFirstManipulation === "mult") {
    code += `${_}for ${innerVar} from ${startFirst} to ${endFirst}*${endFirstManipulationValue}${stepFirstString}:\n`
  } else if (endFirstManipulation === "square") {
    code += `${_}for ${innerVar} from ${startFirst} to ${endFirst}*${endFirst}${stepFirstString}:\n`
  } else if (endFirstManipulation === "log") {
    code += `${_}for ${innerVar} from ${startFirst} to ceil(log2(${endFirst}))${stepFirstString}:\n`
  } else if (endFirstManipulation === "none") {
    code += `${_}for ${innerVar} from ${startFirst} to ${endFirst}${stepFirstString}:\n`
  }

  // printsStarsMiddle
  if (printStarsMiddle) {
    code += printStars(numPrintMiddle, indent + 2)
  }

  // if middle
  if (condMiddle !== "none") {
    code += `${_}  if ${innerVar} is ${condMiddle}\n`
    code += printStars(numPrintMiddleIf, indent + 4)
  }
  // else middle
  if (elseMiddle) {
    code += `${_}  else:\n`
    code += printStars(numPrintMiddleElse, indent + 4)
  }

  // continue middle
  if (continueMiddle) {
    code += `${_}  continue\n`
  }

  // second for-loop
  let stepSecondString = ""
  if (stepSecond !== 1) {
    stepSecondString = ` with ${innerVar2} += ${stepSecond}`
  }

  let endSecondString: string
  if (endSecondManipulation === "mult") {
    endSecondString = `${endSecond}*${endSecondManipulationValue}`
  } else if (endSecondManipulation === "square") {
    endSecondString = `${endSecond}*${endSecond}`
  } else if (endSecondManipulation === "log") {
    endSecondString = `ceil(log2(${endSecond}))`
  } else {
    endSecondString = `${endSecond}`
  }

  if (startSecondManipulation === "var-normal") {
    code += `${_}  for ${innerVar2} from ${innerVar} to ${endSecondString}${stepSecondString}:\n`
  } else if (startSecondManipulation === "var-mult") {
    code += `${_}  for ${innerVar2} from ${innerVar}*${startSecondManipulationValue} to ${endSecondString}${stepSecondString}:\n`
  } else if (startSecondManipulation === "var-square") {
    code += `${_}  for ${innerVar2} from ${innerVar}*${innerVar} to ${endSecondString}${stepSecondString}:\n`
  } else {
    code += `${_}  for ${innerVar2} from ${startSecond} to ${endSecondString}${stepSecondString}:\n`
  }

  // if end
  if (condEnd !== "none") {
    let askVar = `${innerVar2}`
    if (askFirstVar) {
      askVar = `${innerVar}`
    }
    if (condEnd === "same") {
      code += `${_}    if ${innerVar} == ${innerVar2}\n`
    } else {
      code += `${_}    if ${askVar} is ${condEnd}\n`
    }
  }
  code += printStars(numPrint, indent + (condEnd !== "none" ? 6 : 4))
  // else end
  if (elseEnd) {
    code += `${_}    else:\n`
    code += printStars(numPrintElse, indent + 6)
  }

  // break end
  if (breakEnd) {
    code += `${_}    break\n`
  }

  // print stars after
  if (printStarsAfter) {
    code += printStars(numPrintAfter, indent)
  }

  // calculate the number of stars
  const endFirstValue =
    endFirstManipulation === "mult"
      ? endFirst * endFirstManipulationValue
      : endFirstManipulation === "square"
        ? endFirst * endFirst
        : endFirstManipulation === "log"
          ? Math.ceil(Math.log(endFirst))
          : endFirst
  // first loop
  for (let i = startFirst; i <= endFirstValue; i += stepFirst) {
    if (printStarsMiddle) numStars += numPrintMiddle

    if (condMiddle !== "none") {
      numStars += calculateNumStars(condMiddle, i, numPrintMiddleIf, numPrintMiddleElse, elseMiddle)
    }

    if (continueMiddle) continue

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
      endSecondManipulation === "mult"
        ? endSecond * endSecondManipulationValue
        : endSecondManipulation === "square"
          ? endSecond * endSecond
          : endSecondManipulation === "log"
            ? Math.ceil(Math.log(endSecond))
            : endSecond
    for (; j <= endSecondValue; j += stepSecond) {
      numStars += calculateNumStars(condEnd, j, numPrint, numPrintElse, elseEnd, i)
      console.log(numStars)
      if (breakEnd) break
    }
  }

  if (printStarsAfter) numStars += numPrintAfter

  return { code, numStars }
}

/**
 * This code creates a block of a while loop
 * You have many different cases how the loop is constructed with quite much manipulation
 *
 * The options are listed below
 *
 * Example result:
 * let t = 8, let n = 8
 * while t == n:
 *   if t is odd
 *     print("*")
 *   t = floor(t / 2)
 *   n += 3
 *
 * @param code the code to append to
 * @param _
 * @param indent
 * @param innerVar the name of the first variable
 * @param innerVar2 second variable
 * @param numStars total number of stars calculated
 * @param numPrint number of stars to print in the if condition
 * @param numPrintElse number of stars to print in the else condition
 * @param numPrintAfter number of stars to print after the loop
 * @param random
 * @param twoLoops if there is going to be a second loop inside this
 * @param starsSecondLoop number of stars the second loop will print
 * @param insertCode code of the second loop to insert inside this loop
 */
function createWhileLoop(
  code: string,
  _: string,
  indent: number,
  innerVar: string,
  innerVar2: string,
  numStars: number,
  numPrint: number,
  numPrintElse: number,
  numPrintAfter: number,
  random: Random,
  twoLoops: boolean = false,
  starsSecondLoop: number = 0,
  insertCode: string = "",
) {
  const allCases: [element: string, weight: number][] = [
    // cases for only X
    ["xPlus", 1], // increases first var with an addition
    ["xMult", 1], // increases first var with a multiplication
    ["xSquare", 1], // increases first var by squaring
    ["xMinus", 1], // decreases first var with a subtraction
    ["xDiv", 1], // decreases first var with a division
    ["xLog", 1], // decreases first var by log2(...)
    ["xPlusX", 1], // increases first var by doubling it (like x*2, but instead x+x)
    // cases where Y manipulates X
    ["xPlusY", 2], // increases first var with an addition of second var
    ["xMultY", 2], // increases first var with a multiplication of second var
    ["xDivY", 2], // decreases first var with a division of second var
    ["xMinusY", 2], // decreases first var with a subtraction of second var
    // cases where both change, but different directions
    ["xMinusYPlus", 4], // first var decreases, second var increases (by subtraction and addition)
    ["xMinusYMult", 4], // first var decreases, second var increases (by subtraction and multiplication)
    ["xDivYPlus", 4], // first var decreases, second var increases (by division and addition)
    ["xDivYMult", 4], // first var decreases, second var increases (by division and multiplication)
    ["xMinusYYPlus", 5], // first var decreases, second var decreases (first var - second var and second var by addition)
    // cases where both change but same direction,
    // but one var should move faster than the other,
    // this is controlled in whileCreatePseudo
    ["bothPlus", 5], // both increases (addition)
    ["bothMult", 5], // both increases (multiplication)
    ["bothMinus", 5], // both decreases (subtraction)
  ]

  const cOption = random.weightedChoice(allCases)

  let startVar1: number = -10
  let startVar2: number = -10
  let endValue: number = -10
  let compare: string = ""
  let vars: string = ""
  let endManipulation = random.weightedChoice([
    ["none", 0.8],
    ["mult", 0.125],
    //["square", 0.125], // TODO fix issues with this
    ["log", 0.075],
  ])
  const endManipulationValue = random.int(2, 3)

  if (cOption === "xPlus") {
    vars = random.choice(["xy", "yx", "xn"])
    if (vars === "xy" || vars == "yx") {
      if (vars == "xy") {
        // case x increases, so needs to be smaller than y (x+c <= y)
        compare = random.weightedChoice([
          ["<", 0.49],
          ["<=", 0.49],
          ["==", 0.02],
        ])
      } else {
        compare = random.weightedChoice([
          [">", 0.49],
          [">=", 0.49],
          ["==", 0.02],
        ])
      }
      if (compare === "==") {
        startVar1 = random.int(4, 8)
        startVar2 = startVar1
      } else {
        startVar1 = random.int(0, 2)
        startVar2 = random.int(7, 10)
      }
    } else {
      // same for xn (x+y <= n)
      compare = random.weightedChoice([
        ["<", 0.49],
        ["<=", 0.49],
        ["==", 0.02],
      ])
      if (compare === "==") {
        startVar1 = random.int(4, 8)
        endValue = startVar1
      } else {
        startVar1 = random.int(0, 2)
        endValue = random.int(7, 10)
      }
    }
  }
  if (cOption === "xMult" || cOption === "xPlusX") {
    // xMult and xPlusX have the same logic
    vars = random.choice(["xy", "yx", "xn"])
    if (vars === "xy" || vars === "yx") {
      if (vars === "xy") {
        // cases y is static and x increase to x needs to be smaller than y
        // c*x <= y or x+x <= y
        compare = random.weightedChoice([
          ["<", 0.49],
          ["<=", 0.49],
          ["==", 0.02],
        ])
      } else {
        compare = random.weightedChoice([
          [">", 0.49],
          [">=", 0.49],
          ["==", 0.02],
        ])
      }
      if (compare === "==") {
        startVar1 = random.int(4, 8)
        startVar2 = startVar1
      } else {
        startVar1 = random.int(1, 2) // needs to be at least 1, because 0*c = 0
        startVar2 = random.int(7, 10)
      }
    } else {
      // same as above (x*c <=n or x+x <= n)
      compare = random.weightedChoice([
        ["<", 0.49],
        ["<=", 0.49],
        ["==", 0.02],
      ])
      if (compare === "==") {
        startVar1 = random.int(4, 8)
        endValue = startVar1
      } else {
        startVar1 = random.int(1, 2)
        endValue = random.int(7, 10)
      }
    }
  }
  if (cOption === "xSquare") {
    vars = random.choice(["xy", "yx", "xn"])
    if (vars === "xy" || vars === "yx") {
      if (vars === "xy") {
        // x increases, so it needs to be smaller than (because y is static)
        // x*x <= y
        compare = random.weightedChoice([
          ["<", 0.49],
          ["<=", 0.49],
          ["==", 0.02],
        ])
      } else {
        compare = random.weightedChoice([
          [">", 0.49],
          [">=", 0.49],
          ["==", 0.02],
        ])
      }
      if (compare === "==") {
        startVar1 = random.int(4, 8)
        startVar2 = startVar1
      } else {
        startVar1 = random.int(2, 3) // needs to be at least 2, because 0*0 = 0 and 1*1 = 1
        startVar2 = random.int(10, 13) // so at least two iteration if we don't have an end manipulation
      }
    } else {
      // same as above (x*x <= n)
      compare = random.weightedChoice([
        ["<", 0.49],
        ["<=", 0.49],
        ["==", 0.02],
      ])
      if (compare === "==") {
        startVar1 = random.int(4, 8)
        endValue = startVar1
      } else {
        startVar1 = random.int(2, 3)
        endValue = random.int(10, 13) // at least two iterations (s.a.)
      }
    }
  }
  if (cOption === "xMinus") {
    vars = random.choice(["xy", "yx", "xn"])
    if (vars === "xy" || vars === "yx") {
      if (vars === "xy") {
        // x decreases, so it needs to be larger than y, because y is still static
        // x-c >= y
        compare = random.weightedChoice([
          [">", 0.49],
          [">=", 0.49],
          ["==", 0.02],
        ])
      } else {
        compare = random.weightedChoice([
          ["<", 0.49],
          ["<=", 0.49],
          ["==", 0.02],
        ])
      }
      if (compare === "==") {
        startVar1 = random.int(4, 8)
        startVar2 = startVar1
      } else {
        // numbers don't matter with enough subtraction x-c -> -inf
        startVar1 = random.int(7, 10)
        startVar2 = random.int(0, 2)
      }
    } else {
      // same as above (x-c >= n)
      compare = random.weightedChoice([
        [">", 0.49],
        [">=", 0.49],
        ["==", 0.02],
      ])
      if (compare === "==") {
        startVar1 = random.int(4, 8)
        endValue = startVar1
      } else {
        startVar1 = random.int(7, 10)
        endValue = random.int(0, 2)
      }
    }
  }
  if (cOption === "xDiv" || cOption === "xLog") {
    vars = random.choice(["xy", "yx", "xn"])
    if (vars === "xy" || vars === "yx") {
      if (vars === "xy") {
        // x decreases, so it needs to be larger than y, because y is still static
        // x/c >= y or log2(x) >= y
        compare = random.weightedChoice([
          [">", 0.49],
          [">=", 0.49],
          ["==", 0.02],
        ])
      } else {
        compare = random.weightedChoice([
          ["<", 0.49],
          ["<=", 0.49],
          ["==", 0.02],
        ])
      }
      if (compare === "==") {
        startVar1 = random.int(4, 8)
        startVar2 = startVar1
      } else {
        // numbers do matter but with enough division x/c -> 0
        // and log2(x) -> 0
        // so the compare variable should be at least 1 because x/c >= 0 will always be true
        startVar1 = random.int(8, 12)
        startVar2 = random.int(1, 3)
      }
    } else {
      // same as above
      // x/c >= n or log2(x) >= n
      compare = random.weightedChoice([
        [">", 0.49],
        [">=", 0.49],
        ["==", 0.02],
      ])
      if (compare === "==") {
        startVar1 = random.int(4, 8)
        endValue = startVar1
      } else {
        startVar1 = random.int(8, 12)
        // be at least on, because x/c >= 0 will always be true
        endValue = random.int(1, 3)
      }
    }
  }
  if (cOption === "xPlusY") {
    // only xn makes sense
    // x+y <= y will be false after one iteration
    vars = "xn"
    // because x increases and n is static x+y<=n
    compare = random.weightedChoice([
      ["<", 0.49],
      ["<=", 0.49],
      ["==", 0.02],
    ])
    if (compare === "==") {
      startVar1 = random.int(4, 8)
      startVar2 = random.int(1, 2)
      endValue = startVar1
    } else {
      // x start does not matter (but should be smaller than n)
      startVar1 = random.int(0, 2)
      // y should be at least 1 (I have set it to 2-3, so we don't get x+1 ...)
      startVar2 = random.int(2, 3)
      endValue = random.int(9, 12)
    }
  }
  if (cOption === "xMultY") {
    // only xn makes sense
    // because x*y <= y will be false after one iteration
    vars = "xn"
    // because x increases and n is static (x*y<=n)
    compare = random.weightedChoice([
      ["<", 0.49],
      ["<=", 0.49],
      ["==", 0.02],
    ])
    if (compare === "==") {
      startVar1 = random.int(4, 8)
      startVar2 = random.int(2, 3)
      endValue = startVar1
    } else {
      // x needs to start at least at 1 (because 0*c = 0)
      startVar1 = random.int(1, 2)
      // y should be at least 2 (because x*1=x) will be endless loop
      startVar2 = random.int(2, 3)
      endValue = random.int(8, 12)
    }
  }
  if (cOption === "xDivY") {
    vars = random.choice(["xy", "yx", "xn"])
    if (vars === "xy" || vars === "yx") {
      if (vars == "xy") {
        // x decreases, so it needs to be larger than y, because y is still static
        // x/y >= y (example 10/2 >= 2)
        compare = random.weightedChoice([
          [">", 0.49],
          [">=", 0.49],
          ["==", 0.02],
        ])
      } else {
        compare = random.weightedChoice([
          ["<", 0.49],
          ["<=", 0.49],
          ["==", 0.02],
        ])
      }
      if (compare === "==") {
        startVar1 = random.int(4, 8)
        startVar2 = startVar1
      } else {
        // x needs to be greater than y, y at least 2 (because x/1=x) will be endless loop
        startVar1 = random.int(8, 12)
        startVar2 = random.int(2, 3)
      }
    } else {
      // same as above
      // x/y >= n
      compare = random.weightedChoice([
        [">", 0.49],
        [">=", 0.49],
        ["==", 0.02],
      ])
      if (compare === "==") {
        startVar1 = random.int(4, 8)
        startVar2 = random.int(2, 3)
        endValue = startVar1
      } else {
        startVar1 = random.int(8, 12)
        // at least two, to have a sensible division
        startVar2 = random.int(2, 3)
        // at least 1, because x/y >= 0 will always be true
        endValue = random.int(1, 3)
      }
    }
  }
  if (cOption === "xMinusY" || cOption === "xMinusYPlus") {
    // case xMinusY (y is static, and we decrease x by y) all three make
    // case xMinusYPlus (y increases with addition, and we decrease x with subtraction)
    vars = random.choice(cOption === "xMinusY" ? ["xy", "yx", "xn"] : ["xy", "yx"])
    if (vars === "xy" || vars === "yx") {
      if (vars == "xy") {
        // in both cases x decreases (the one case y is either static or increases)
        // so x-y >= y or x-c >= y-c
        compare = random.weightedChoice([
          [">", 0.49],
          [">=", 0.49],
          ["==", 0.02],
        ])
      } else {
        compare = random.weightedChoice([
          ["<", 0.49],
          ["<=", 0.49],
          ["==", 0.02],
        ])
      }
      if (compare === "==") {
        startVar1 = random.int(4, 8)
        startVar2 = startVar1
      } else {
        // x > y (y at least 1) otherwise x-y = x
        startVar1 = random.int(7, 10) + (cOption === "xMinusYPlus" ? 3 : 0) // add 3 so we get more iterations
        startVar2 = random.int(1, 3)
      }
    } else {
      // so x-y >= n
      compare = random.weightedChoice([
        [">", 0.49],
        [">=", 0.49],
        ["==", 0.02],
      ])
      if (compare === "==") {
        startVar1 = random.int(4, 8)
        startVar2 = random.int(1, 3)
        endValue = startVar1
      } else {
        // x > n and y at least 1
        startVar1 = random.int(7, 10)
        startVar2 = random.int(1, 3)
        endValue = random.int(1, 3)
      }
    }
  }
  if (cOption === "xMinusYMult" || cOption === "xDivYPlus" || cOption === "xDivYMult") {
    vars = random.choice(["xy", "yx", "xn"])
    if (vars === "xy" || vars === "yx") {
      if (vars == "xy") {
        // in all three cases x decreases and y increases
        // so x > y
        compare = random.weightedChoice([
          [">", 0.49],
          [">=", 0.49],
          ["==", 0.02],
        ])
      } else {
        compare = random.weightedChoice([
          ["<", 0.49],
          ["<=", 0.49],
          ["==", 0.02],
        ])
      }
      if (compare === "==") {
        startVar1 = random.int(4, 8)
        startVar2 = startVar1
      } else {
        // x starts higher than y
        // case xDiv add 3 for more iterations
        startVar1 = random.int(7, 10) + (cOption.indexOf("xDiv") !== -1 ? 3 : 0)
        // cases YMult -> startVar2 at least 1
        startVar2 = random.int(0, 2) + (cOption.indexOf("Mult") !== -1 ? 1 : 0)
      }
    } else {
      // x decreases -> x >= n
      compare = random.weightedChoice([
        [">", 0.49],
        [">=", 0.49],
        ["==", 0.02],
      ])
      if (compare === "==") {
        startVar1 = random.int(4, 8)
        startVar2 = random.int(1, 3)
        endValue = startVar1
      } else {
        // case xDiv add 3 for more iterations
        startVar1 = random.int(7, 10) + (cOption.indexOf("xDiv") !== -1 ? 3 : 0)
        // case yMult value at least 1 for sensible multiplication
        startVar2 = random.int(0, 2) + (cOption.indexOf("Mult") !== -1 ? 1 : 0)
        // case xDiv endValue at least 1 cause x/c >= 0 always true
        endValue = random.int(0, 2) + (cOption.indexOf("Div") !== -1 ? 1 : 0)
      }
    }
  }
  if (cOption === "xMinusYYPlus") {
    vars = random.choice(["xy", "yx", "xn"])
    if (vars === "xy" || vars === "yx") {
      if (vars == "xy") {
        // x decreases by y and y increases by c
        // x-y >= y+c
        compare = random.weightedChoice([
          [">", 0.49],
          [">=", 0.49],
          ["==", 0.02],
        ])
      } else {
        compare = random.weightedChoice([
          ["<", 0.49],
          ["<=", 0.49],
          ["==", 0.02],
        ])
      }
      if (compare === "==") {
        startVar1 = random.int(5, 15)
        startVar2 = startVar1
      } else {
        // high start value for more iterations
        startVar1 = random.int(15, 20)
        // doesn't matter where it starts
        startVar2 = random.int(0, 2)
      }
    } else {
      // x-y >= n with y+c
      compare = random.weightedChoice([
        [">", 0.49],
        [">=", 0.49],
        ["==", 0.02],
      ])
      if (compare === "==") {
        startVar1 = random.int(5, 15)
        startVar2 = random.weightedChoice([
          [0, 0.8],
          [1, 0.2],
        ]) // so we maybe get an iteration at the while even though ==
        endValue = startVar1
      } else {
        startVar1 = random.int(15, 20)
        startVar2 = random.int(0, 2)
        // because of subtraction x-y -> -inf
        endValue = random.int(0, 3)
      }
    }
  }
  if (cOption === "bothPlus" || cOption === "bothMult") {
    // not endManipulation, because the runtime could be too long
    // x=9, y=1
    // while x*x or 3*x < y
    //  x = x+3
    //  y = y+4
    // this example takes quite a while to finish
    endManipulation = "none"
    vars = random.choice(["xy", "yx"])
    // x should increase slower, so it starts higher
    if (vars === "xy" || vars === "yx") {
      if (vars == "xy") {
        compare = random.weightedChoice([
          [">", 0.49],
          [">=", 0.49],
          ["==", 0.02],
        ])
      } else {
        compare = random.weightedChoice([
          ["<", 0.49],
          ["<=", 0.49],
          ["==", 0.02],
        ])
      }
      if (compare === "==") {
        startVar1 = random.int(4, 8)
        startVar2 = startVar1
      } else {
        // x starts higher than
        startVar1 = random.int(7, 10)
        // if Mult, y at least 1 otherwise doesn't matter
        startVar2 = random.int(0, 2) + (cOption === "bothMult" ? 1 : 0)
      }
    }
  }
  if (cOption === "bothMinus") {
    endManipulation = "none"
    vars = random.choice(["xy", "yx"])
    if (vars === "xy" || vars === "yx") {
      if (vars == "xy") {
        // x decreases faster, so it starts higher
        compare = random.weightedChoice([
          [">", 0.49],
          [">=", 0.49],
          ["==", 0.02],
        ])
      } else {
        compare = random.weightedChoice([
          ["<", 0.49],
          ["<=", 0.49],
          ["==", 0.02],
        ])
      }
      if (compare === "==") {
        startVar1 = random.int(4, 8)
        startVar2 = startVar1
      } else {
        // values are not important here
        startVar1 = random.int(7, 10)
        startVar2 = random.int(0, 2)
      }
    }
  }

  if (startVar1 === -10 && startVar2 === -10) {
    throw new Error("Start values are not set" + cOption + vars + compare)
  }

  // Choose a condition
  const condEnd = random.choice(["even", "odd", "square", "none"])
  const elseAfter =
    condEnd === "none"
      ? false
      : random.weightedChoice([
          [true, 0.3],
          [false, 0.7],
        ])
  const printAfter = random.weightedChoice([
    [true, 0.25],
    [false, 0.75],
  ])

  let compareVar = ""
  if (
    (cOption.toLowerCase().indexOf("x") !== -1 && cOption.toLowerCase().indexOf("y") !== -1) ||
    (cOption.toLowerCase().indexOf("x") === -1 && cOption.toLowerCase().indexOf("y") === -1) ||
    vars === "xy" ||
    vars === "yx"
  ) {
    compareVar = random.choice(["var1", "var2"])
    // introduce var1 and var2
    code += `${_}let ${innerVar} = ${startVar1}, `
    code += `${_}let ${innerVar2} = ${startVar2}\n`
  } else if (cOption.toLowerCase().indexOf("x") !== -1) {
    code += `${_}let ${innerVar} = ${startVar1}\n`
    compareVar = "var1"
  } else if (cOption.toLowerCase().indexOf("y") !== -1) {
    compareVar = "var2"
    code += `${_}let ${innerVar2} = ${startVar2}\n`
  }

  // while loop statement
  // const vars = random.choice(["xy", "yx", "xn"])
  // only manipulate the greater value
  if (vars === "xy") {
    if (endManipulation === "none" || compare === "==") {
      code += `${_}while ${innerVar} ${compare} ${innerVar2}:\n`
    } else if (endManipulation === "square") {
      if (startVar2 > startVar1) {
        code += `${_}while ${innerVar} ${compare} abs(${innerVar2})*abs(${innerVar2}):\n`
      } else if (startVar1 > startVar2) {
        code += `${_}while ${innerVar}*${innerVar} ${compare} ${innerVar2}:\n`
      }
    } else if (endManipulation === "mult") {
      if (startVar2 > startVar1) {
        code += `${_}while ${innerVar} ${compare} ${innerVar2}*${endManipulationValue}:\n`
      } else if (startVar1 > startVar2) {
        code += `${_}while ${innerVar}*${endManipulationValue} ${compare} ${innerVar2}:\n`
      }
    } else if (endManipulation === "log") {
      if (startVar2 > startVar1) {
        code += `${_}while ${innerVar} ${compare} ceil(log2(${innerVar2})):\n`
      } else if (startVar1 > startVar2) {
        code += `${_}while ceil(log2(${innerVar})) ${compare} ${innerVar2}:\n`
      }
    }
  } else if (vars === "yx") {
    if (endManipulation === "none" || compare === "==") {
      code += `${_}while ${innerVar2} ${compare} ${innerVar}:\n`
    } else if (endManipulation === "square") {
      if (startVar1 > startVar2) {
        code += `${_}while ${innerVar2} ${compare} abs(${innerVar})*abs(${innerVar}):\n`
      } else if (startVar2 > startVar1) {
        code += `${_}while ${innerVar2}*${innerVar2} ${compare} ${innerVar}:\n`
      }
    } else if (endManipulation === "mult") {
      if (startVar1 > startVar2) {
        code += `${_}while ${innerVar2} ${compare} ${innerVar}*${endManipulationValue}:\n`
      } else if (startVar2 > startVar1) {
        code += `${_}while ${innerVar2}*${endManipulationValue} ${compare} ${innerVar}:\n`
      }
    } else if (endManipulation === "log") {
      if (startVar1 > startVar2) {
        code += `${_}while ${innerVar2} ${compare} ceil(log2(${innerVar}):\n`
      } else if (startVar2 > startVar1) {
        code += `${_}while ceil(log2(${innerVar2})) ${compare} ${innerVar}:\n`
      }
    }
  } else if (vars === "xn") {
    if (endManipulation === "none" || compare === "==") {
      code += `${_}while ${innerVar} ${compare} ${endValue}:\n`
    } else if (endManipulation === "square") {
      if (endValue > startVar1) {
        code += `${_}while ${innerVar} ${compare} ${endValue}*${endValue}:\n`
      } else if (startVar1 > endValue) {
        code += `${_}while ${innerVar}*${innerVar} ${compare} ${endValue}:\n`
      }
    } else if (endManipulation === "mult") {
      if (endValue > startVar1) {
        code += `${_}while ${innerVar} ${compare} ${endValue}*${endManipulationValue}:\n`
      } else if (startVar1 > endValue) {
        code += `${_}while ${innerVar}*${endManipulationValue} ${compare} ${endValue}:\n`
      }
    } else if (endManipulation === "log") {
      if (endValue > startVar1) {
        code += `${_}while ${innerVar} ${compare} ceil(log2(${endValue})):\n`
      } else if (startVar1 > endValue) {
        code += `${_}while ceil(log2(${innerVar})) ${compare} ${endValue}:\n`
      }
    }
  }

  // create the if and else statement
  if (condEnd !== "none") {
    code += `${_}  if ${compareVar === "var1" ? innerVar : innerVar2} is ${condEnd}\n`
  }
  code += printStars(numPrint, indent + (condEnd === "none" ? 2 : 4))
  if (elseAfter) {
    code += `${_}  else:\n`
    code += printStars(numPrintElse, indent + 4)
  }

  let firstChangeValue = random.int(1, 3)
  let secondChangeValue = random.int(1, 3)

  const changedCode = whileCreatePseudo(
    cOption,
    firstChangeValue,
    secondChangeValue,
    innerVar,
    innerVar2,
    code,
    _,
    compare,
    vars,
    true,
    0,
    0,
    random,
  )
  code = changedCode.code
  firstChangeValue = changedCode.firstChangeValue
  secondChangeValue = changedCode.secondChangeValue

  let toMpl = ""
  if (endManipulation !== "none") {
    if (vars === "xn") {
      if (endManipulation === "square") {
        if (endValue > startVar1) {
          toMpl = "e"
        } else if (startVar1 > endValue) {
          toMpl = "i"
        }
      } else if (endManipulation === "mult") {
        if (endValue > startVar1) {
          toMpl = "e"
        } else if (startVar1 > endValue) {
          toMpl = "i"
        }
      } else if (endManipulation === "log") {
        if (endValue > startVar1) {
          toMpl = "e"
        } else if (startVar1 > endValue) {
          toMpl = "i"
        }
      }
    } else if (vars === "xy" || vars === "yx") {
      if (endManipulation === "square") {
        if (startVar2 > startVar1) {
          toMpl = "j"
        } else if (startVar1 > startVar2) {
          toMpl = "i"
        }
      } else if (endManipulation === "mult") {
        if (startVar2 > startVar1) {
          toMpl = "j"
        } else if (startVar1 > startVar2) {
          toMpl = "i"
        }
      } else if (endManipulation === "log") {
        if (startVar2 > startVar1) {
          toMpl = "j"
        } else if (startVar1 > startVar2) {
          toMpl = "i"
        }
      }
    }
  }

  // create the while loop
  let i = startVar1
  let j = startVar2

  while (
    vars === "xy"
      ? compareTwoValues(
          toMpl !== "i"
            ? i
            : endManipulation === "square"
              ? Math.abs(i) * Math.abs(i)
              : endManipulation === "mult"
                ? i * endManipulationValue
                : Math.floor(Math.log2(i)),
          toMpl !== "j"
            ? j
            : endManipulation === "square"
              ? Math.abs(j) * Math.abs(j)
              : endManipulation === "mult"
                ? j * endManipulationValue
                : Math.floor(Math.log2(j)),
          compare,
        )
      : vars === "yx"
        ? compareTwoValues(
            toMpl !== "j"
              ? j
              : endManipulation === "square"
                ? Math.abs(j) * Math.abs(j)
                : endManipulation === "mult"
                  ? j * endManipulationValue
                  : Math.floor(Math.log2(j)),
            toMpl !== "i"
              ? i
              : endManipulation === "square"
                ? Math.abs(i) * Math.abs(i)
                : endManipulation === "mult"
                  ? i * endManipulationValue
                  : Math.floor(Math.log2(i)),
            compare,
          )
        : vars === "xn"
          ? compareTwoValues(
              toMpl !== "i"
                ? i
                : endManipulation === "square"
                  ? Math.abs(i) * Math.abs(i)
                  : endManipulation === "mult"
                    ? i * endManipulationValue
                    : Math.floor(Math.log2(i)),
              toMpl !== "e"
                ? endValue
                : endManipulation === "square"
                  ? endValue * endValue
                  : endManipulation === "mult"
                    ? endValue * endManipulationValue
                    : Math.floor(Math.log2(endValue)),
              compare,
            )
          : false
  ) {
    console.log(i, j, endValue, compare, vars, cOption)
    // calculate the stars
    numStars += calculateNumStars(
      condEnd,
      compareVar === "var1" ? i : j,
      numPrint,
      numPrintElse,
      elseAfter,
    )

    if (twoLoops) {
      numStars += starsSecondLoop
    }

    const changedCode = whileCreatePseudo(
      cOption,
      firstChangeValue,
      secondChangeValue,
      innerVar,
      innerVar2,
      code,
      _,
      compare,
      vars,
      false,
      i,
      j,
      random,
    )
    i = changedCode.changeI
    j = changedCode.changeJ
  }

  // add the code of the next loop
  if (twoLoops) {
    // insert two spaces in front of every line at "insertCode"
    code +=
      insertCode
        .split("\n")
        .map((line) => `  ${line}`)
        .join("\n") + "\n"
  }

  // printAfter
  if (printAfter) {
    code += printStars(numPrintAfter, indent)
    numStars += numPrintAfter
  }

  return { code: code.trim(), numStars }
}

function whileCreatePseudo(
  cOption: string,
  firstChangeValue: number,
  secondChangeValue: number,
  innerVar: string,
  innerVar2: string,
  code: string,
  _: string,
  compare: string,
  vars: string,
  changeCode: boolean,
  changeI: number,
  changeJ: number,
  random: Random,
) {
  // changeI -> innerVar
  // changeJ -> innerVar2

  if (cOption === "xPlus") {
    changeCode ? (code += `${_}  ${innerVar} += ${firstChangeValue}\n`) : ""
    changeI += firstChangeValue
  } else if (cOption === "yPlus") {
    changeCode ? (code += `${_}  ${innerVar2} += ${secondChangeValue}\n`) : ""
    changeJ += secondChangeValue
  } else if (cOption === "xMult") {
    changeCode ? (firstChangeValue = random.int(2, 3)) : ""
    changeCode ? (code += `${_}  ${innerVar} *= ${firstChangeValue}\n`) : ""
    changeI *= firstChangeValue
  } else if (cOption === "yMult") {
    changeCode ? (secondChangeValue = random.int(2, 3)) : ""
    changeCode ? (code += `${_}  ${innerVar2} *= ${secondChangeValue}\n`) : ""
    changeJ *= secondChangeValue
  } else if (cOption === "xSquare") {
    changeCode ? (code += `${_}  ${innerVar} *= ${innerVar}\n`) : ""
    changeI *= changeI
  } else if (cOption === "ySquare") {
    changeCode ? (code += `${_}  ${innerVar2} *= ${innerVar2}\n`) : ""
    changeJ *= changeJ
  } else if (cOption === "xPlusX") {
    changeCode ? (code += `${_}  ${innerVar} += ${innerVar}\n`) : ""
    changeI += changeI
  } else if (cOption === "yPlusY") {
    changeCode ? (code += `${_}  ${innerVar2} += ${innerVar2}\n`) : ""
    changeJ += changeJ
  } else if (cOption === "xMinus") {
    changeCode ? (code += `${_}  ${innerVar} -= ${firstChangeValue}\n`) : ""
    changeI -= firstChangeValue
  } else if (cOption === "yMinus") {
    changeCode ? (code += `${_}  ${innerVar2} -= ${secondChangeValue}\n`) : ""
    changeJ -= secondChangeValue
  } else if (cOption === "xDiv") {
    changeCode ? (firstChangeValue = random.int(2, 3)) : ""
    changeCode ? (code += `${_}  ${innerVar} = floor(${innerVar} / ${firstChangeValue})\n`) : ""
    changeI = Math.floor(changeI / firstChangeValue)
  } else if (cOption === "yDiv") {
    changeCode ? (secondChangeValue = random.int(2, 3)) : ""
    changeCode ? (code += `${_}  ${innerVar2} = floor(${innerVar2} / ${secondChangeValue})\n`) : ""
    changeJ = Math.floor(changeJ / secondChangeValue)
  } else if (cOption === "xLog") {
    changeCode ? (code += `${_}  ${innerVar} = floor(log2(${innerVar}))\n`) : ""
    changeI = Math.floor(Math.log2(changeI))
  } else if (cOption === "yLog") {
    changeCode ? (code += `${_}  ${innerVar2} = floor(log2(${innerVar2}))\n`) : ""
    changeJ = Math.floor(Math.log2(changeJ))
  } else if (cOption === "xMinusY") {
    changeCode ? (code += `${_}  ${innerVar} -= ${innerVar2}\n`) : ""
    changeI -= changeJ
  } else if (cOption === "yMinusX") {
    changeCode ? (code += `${_}  ${innerVar2} -= ${innerVar}\n`) : ""
    changeJ -= changeI
  } else if (cOption === "xDivY") {
    changeCode ? (code += `${_}  ${innerVar} = floor(${innerVar} / ${innerVar2})\n`) : ""
    changeI = Math.floor(changeI / changeJ)
  } else if (cOption === "yDivX") {
    changeCode ? (code += `${_}  ${innerVar2} = floor(${innerVar2} / ${innerVar})\n`) : ""
    changeJ = Math.floor(changeJ / changeI)
  } else if (cOption === "xPlusY") {
    changeCode ? (code += `${_}  ${innerVar} += ${innerVar2}\n`) : ""
    changeI += changeJ
  } else if (cOption === "yPlusX") {
    changeCode ? (code += `${_}  ${innerVar2} += ${innerVar}\n`) : ""
    changeJ += changeI
  } else if (cOption === "xMultY") {
    changeCode ? (code += `${_}  ${innerVar} *= ${innerVar2}\n`) : ""
    changeI *= changeJ
  } else if (cOption === "yMultX") {
    changeCode ? (code += `${_}  ${innerVar2} *= ${innerVar}\n`) : ""
    changeJ *= changeI
  } else if (cOption === "xMinusYPlus") {
    changeCode ? (code += `${_}  ${innerVar} -= ${firstChangeValue}\n`) : ""
    changeCode ? (code += `${_}  ${innerVar2} += ${secondChangeValue}\n`) : ""
    changeI -= firstChangeValue
    changeJ += secondChangeValue
  } else if (cOption === "xDivYPlus") {
    changeCode ? (firstChangeValue = random.int(2, 3)) : ""
    changeCode ? (code += `${_}  ${innerVar} = floor(${innerVar} / ${firstChangeValue})\n`) : ""
    changeCode ? (code += `${_}  ${innerVar2} += ${secondChangeValue}\n`) : ""
    changeI = Math.floor(changeI / firstChangeValue)
    changeJ += secondChangeValue
  } else if (cOption === "xMinusYMult") {
    changeCode ? (code += `${_}  ${innerVar} -= ${firstChangeValue}\n`) : ""
    changeCode ? (secondChangeValue = random.int(2, 3)) : ""
    changeCode ? (code += `${_}  ${innerVar2} *= ${secondChangeValue}\n`) : ""
    changeI -= firstChangeValue
    changeJ *= secondChangeValue
  } else if (cOption === "xDivYMult") {
    changeCode ? (firstChangeValue = random.int(2, 3)) : ""
    changeCode ? (code += `${_}  ${innerVar} = floor(${innerVar} / ${firstChangeValue})\n`) : ""
    changeCode ? (secondChangeValue = random.int(2, 3)) : ""
    changeCode ? (code += `${_}  ${innerVar2} *= ${secondChangeValue}\n`) : ""
    changeI = Math.floor(changeI / firstChangeValue)
    changeJ *= secondChangeValue
  } else if (cOption === "xMinusYYPlus") {
    changeCode ? (code += `${_}  ${innerVar} -= ${innerVar2}\n`) : ""
    changeCode ? (code += `${_}  ${innerVar2} += ${secondChangeValue}\n`) : ""
    changeI -= changeJ
    changeJ += secondChangeValue
  } else if (cOption === "yMinusXPlus") {
    changeCode ? (code += `${_}  ${innerVar2} -= ${secondChangeValue}\n`) : ""
    changeCode ? (code += `${_}  ${innerVar} += ${firstChangeValue}\n`) : ""
    changeJ -= secondChangeValue
    changeI += firstChangeValue
  } else if (cOption === "yDivXPlus") {
    changeCode ? (secondChangeValue = random.int(2, 3)) : ""
    changeCode ? (code += `${_}  ${innerVar2} = floor(${innerVar2} / ${secondChangeValue})\n`) : ""
    changeCode ? (code += `${_}  ${innerVar} += ${firstChangeValue}\n`) : ""
    changeJ = Math.floor(changeJ / secondChangeValue)
    changeI += firstChangeValue
  } else if (cOption === "yMinusXMult") {
    changeCode ? (code += `${_}  ${innerVar2} -= ${secondChangeValue}\n`) : ""
    changeCode ? (firstChangeValue = random.int(2, 3)) : ""
    changeCode ? (code += `${_}  ${innerVar} *= ${firstChangeValue}\n`) : ""
    changeJ -= secondChangeValue
    changeI *= firstChangeValue
  } else if (cOption === "yDivXMult") {
    changeCode ? (secondChangeValue = random.int(2, 3)) : ""
    changeCode ? (code += `${_}  ${innerVar2} = floor(${innerVar2} / ${secondChangeValue})\n`) : ""
    changeCode ? (firstChangeValue = random.int(2, 3)) : ""
    changeCode ? (code += `${_}  ${innerVar} *= ${firstChangeValue}\n`) : ""
    changeJ = Math.floor(changeJ / secondChangeValue)
    changeI *= firstChangeValue
  } else if (cOption === "yMinusXXPlus") {
    changeCode ? (code += `${_}  ${innerVar2} -= ${innerVar}\n`) : ""
    changeCode ? (code += `${_}  ${innerVar} += ${firstChangeValue}\n`) : ""
    changeJ -= changeI
    changeI += firstChangeValue
  } else if (cOption === "bothMinus") {
    if (
      (vars === "xy" && (compare === ">" || compare === ">=")) ||
      (vars === "yx" && (compare === "<" || compare === "<="))
    ) {
      changeCode ? (firstChangeValue = random.int(3, 4)) : ""
      changeCode ? (secondChangeValue = firstChangeValue - random.int(1, 2)) : ""
    } else {
      changeCode ? (secondChangeValue = random.int(3, 4)) : ""
      changeCode ? (firstChangeValue = secondChangeValue - random.int(1, 2)) : ""
    }
    changeCode ? (code += `${_}  ${innerVar} -= ${firstChangeValue}\n`) : ""
    changeCode ? (code += `${_}  ${innerVar2} -= ${secondChangeValue}\n`) : ""
    changeI -= firstChangeValue
    changeJ -= secondChangeValue
  } else if (cOption === "bothPlus") {
    if (
      (vars === "xy" && (compare === ">" || compare === ">=")) ||
      (vars === "yx" && (compare === "<" || compare === "<="))
    ) {
      changeCode ? (firstChangeValue = random.int(1, 3)) : ""
      changeCode ? (secondChangeValue = firstChangeValue + random.int(1, 2)) : ""
    } else {
      changeCode ? (secondChangeValue = random.int(1, 3)) : ""
      changeCode ? (firstChangeValue = secondChangeValue + random.int(1, 2)) : ""
    }
    changeCode ? (code += `${_}  ${innerVar} += ${firstChangeValue}\n`) : ""
    changeCode ? (code += `${_}  ${innerVar2} += ${secondChangeValue}\n`) : ""
    changeI += firstChangeValue
    changeJ += secondChangeValue
  } else if (cOption === "bothMult") {
    if (
      (vars === "xy" && (compare === ">" || compare === ">=")) ||
      (vars === "yx" && (compare === "<" || compare === "<="))
    ) {
      changeCode ? (firstChangeValue = random.int(2, 3)) : ""
      changeCode ? (secondChangeValue = firstChangeValue + 1) : ""
    } else {
      changeCode ? (secondChangeValue = random.int(2, 3)) : ""
      changeCode ? (firstChangeValue = secondChangeValue + 1) : ""
    }
    changeCode ? (code += `${_}  ${innerVar} *= ${firstChangeValue}\n`) : ""
    changeCode ? (code += `${_}  ${innerVar2} *= ${secondChangeValue}\n`) : ""
    changeI *= firstChangeValue
    changeJ *= secondChangeValue
  }

  return {
    code,
    firstChangeValue,
    secondChangeValue,
    changeI,
    changeJ,
  }
}
