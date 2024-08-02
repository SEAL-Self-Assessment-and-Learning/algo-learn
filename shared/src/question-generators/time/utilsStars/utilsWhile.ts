import {
  allWhileCases,
  BoundsOptions,
  createIfCondition,
  createWhileChangeValues,
  createWhileLine,
  getCompare,
  IfOptions,
  WhileCompareOptions,
  WhileOrderOptions,
} from "@shared/question-generators/time/utils.ts"
import { calculateNumberOfStars } from "@shared/question-generators/time/utilsStars/utils.ts"
import {
  printStarsNew,
  PseudoCode,
  PseudoCodeBlock,
  PseudoCodeWhile,
} from "@shared/utils/pseudoCodeUtils.ts"
import Random from "@shared/utils/random.ts"

/**
 * This function compare two values for var1 and var2 inside a while loop
 * it returns true if the condition is met, so the loop can continue
 * otherwise false
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
 *
 * You have many different cases how the loop is constructed
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
 * @param innerVar the name of the first variable
 * @param innerVar2 second variable
 * @param numStars total number of stars calculated
 * @param numPrint number of stars to print in the if condition
 * @param numPrintElse number of stars to print in the else condition
 * @param numPrintAfter number of stars to print after the loop
 * @param random
 */
export function createWhileLoop(
  innerVar: string,
  innerVar2: string,
  numStars: number,
  numPrint: number,
  numPrintElse: number,
  numPrintAfter: number,
  random: Random,
) {
  function condition(i: number, j: number) {
    return vars === "xy"
      ? compareTwoValues(
          varToManipulate !== "i" || endManipulation === "none"
            ? i
            : endManipulation.type === "square"
              ? Math.abs(i) * i
              : endManipulation.type === "mult"
                ? i * endManipulation.value
                : Math.ceil(Math.log2(i)),
          varToManipulate !== "j" || endManipulation === "none"
            ? j
            : endManipulation.type === "square"
              ? Math.abs(j) * j
              : endManipulation.type === "mult"
                ? j * endManipulation.value
                : Math.ceil(Math.log2(j)),
          compare,
        )
      : vars === "yx"
        ? compareTwoValues(
            varToManipulate !== "j" || endManipulation === "none"
              ? j
              : endManipulation.type === "square"
                ? Math.abs(j) * j
                : endManipulation.type === "mult"
                  ? j * endManipulation.value
                  : Math.ceil(Math.log2(j)),
            varToManipulate !== "i" || endManipulation === "none"
              ? i
              : endManipulation.type === "square"
                ? Math.abs(i) * i
                : endManipulation.type === "mult"
                  ? i * endManipulation.value
                  : Math.ceil(Math.log2(i)),
            compare,
          )
        : vars === "xn"
          ? compareTwoValues(
              varToManipulate !== "i" || endManipulation === "none"
                ? i
                : endManipulation.type === "square"
                  ? Math.abs(i) * i
                  : endManipulation.type === "mult"
                    ? i * endManipulation.value
                    : Math.ceil(Math.log2(i)),
              varToManipulate !== "e" || endManipulation === "none"
                ? endValue
                : endManipulation.type === "square"
                  ? endValue * endValue
                  : endManipulation.type === "mult"
                    ? endValue * endManipulation.value
                    : Math.ceil(Math.log2(endValue)),
              compare,
            )
          : false
  }

  const { startVar1, startVar2, endValue, vars, compare, endManipulation, cOption } =
    computeStartEndVarsWhile(random)

  if (startVar1 === -10 && startVar2 === -10) {
    throw new Error("Start values are not set" + cOption + vars + compare)
  }

  // Choose a condition
  const condEnd: IfOptions = random.choice(["even", "odd", "square", "none"])
  const elseAfter = condEnd === "none" ? false : random.bool(0.3)
  const printAfter = random.bool(0.25)

  const pseudoCode: PseudoCode = []
  const pseudoCodeBlock: PseudoCodeBlock = {
    block: [],
  }
  pseudoCode.push(pseudoCodeBlock)

  let compareVar = ""
  if (
    (cOption.toLowerCase().indexOf("x") !== -1 && cOption.toLowerCase().indexOf("y") !== -1) ||
    (cOption.toLowerCase().indexOf("x") === -1 && cOption.toLowerCase().indexOf("y") === -1) ||
    vars === "xy" ||
    vars === "yx"
  ) {
    compareVar = random.choice(["var1", "var2"])
    // introduce var1 and var2
    pseudoCodeBlock.block.push({
      state: {
        assignment: innerVar,
        value: [startVar1.toString()],
      },
    })
    pseudoCodeBlock.block.push({
      state: {
        assignment: innerVar2,
        value: [startVar2.toString()],
      },
    })
  } else if (cOption.toLowerCase().indexOf("x") !== -1) {
    pseudoCodeBlock.block.push({
      state: {
        assignment: innerVar,
        value: [startVar1.toString()],
      },
    })
    compareVar = "var1"
  } else if (cOption.toLowerCase().indexOf("y") !== -1) {
    compareVar = "var2"
    pseudoCodeBlock.block.push({
      state: {
        assignment: innerVar,
        value: [startVar2.toString()],
      },
    })
  }

  // while loop statement
  // const vars = random.choice(["xy", "yx", "xn"])
  // only manipulate the greater value
  let whilePseudoCode: PseudoCodeWhile
  if (vars === "xy") {
    whilePseudoCode = createWhileLine({
      start: { variable: innerVar },
      startManipulation: startVar2 > startVar1 ? "none" : endManipulation,
      end: { variable: innerVar2 },
      endManipulation: startVar2 > startVar1 ? endManipulation : "none",
      compare,
    })
  } else if (vars === "yx") {
    whilePseudoCode = createWhileLine({
      start: { variable: innerVar2 },
      startManipulation: startVar1 > startVar2 ? "none" : endManipulation,
      end: { variable: innerVar },
      endManipulation: startVar1 > startVar2 ? endManipulation : "none",
      compare,
    })
  } else if (vars === "xn") {
    whilePseudoCode = createWhileLine({
      start: { variable: innerVar },
      startManipulation: startVar1 < endValue ? "none" : endManipulation,
      end: endValue.toString(),
      endManipulation: startVar1 < endValue ? endManipulation : "none",
      compare,
    })
  } else {
    throw new Error("Only vars options allowed are xy, yx, xn")
  }

  pseudoCodeBlock.block.push(whilePseudoCode)
  const whilePseudoBlock: PseudoCodeBlock = {
    block: [],
  }
  whilePseudoCode.while.do = whilePseudoBlock

  // create the if and else statement
  if (condEnd === "none") {
    whilePseudoBlock.block.push(printStarsNew(numPrint))
  } else {
    whilePseudoBlock.block.push(
      createIfCondition({
        innerVar1: compareVar === "var1" ? innerVar : innerVar2,
        condition: condEnd,
        elseStatement: elseAfter,
        numPrint,
        numPrintElse,
      }),
    )
  }

  let firstChangeValue = random.int(1, 3)
  let secondChangeValue = random.int(1, 3)

  const changedCode = createWhileChangeValues({
    cOption,
    firstChangeValue,
    secondChangeValue,
    innerVar,
    innerVar2,
    compare,
    vars,
    random,
  })
  changedCode.assignments.forEach((assignment) => whilePseudoBlock.block.push({ state: assignment }))
  firstChangeValue = changedCode.firstChangeValue
  secondChangeValue = changedCode.secondChangeValue

  const varToManipulate = computeVariableToManipulateWhile(
    startVar1,
    startVar2,
    endValue,
    endManipulation,
    vars,
  )

  // create the while loop
  let i = startVar1
  let j = startVar2

  while (condition(i, j)) {
    // calculate the stars
    numStars += calculateNumberOfStars(
      condEnd,
      compareVar === "var1" ? i : j,
      numPrint,
      numPrintElse,
      elseAfter,
    )

    const changedCode = createWhileChangeValues({
      cOption,
      firstChangeValue,
      secondChangeValue,
      compare,
      vars,
      changeCode: false,
      changeI: i,
      changeJ: j,
      random,
    })
    i = changedCode.changeI
    j = changedCode.changeJ
  }

  // printAfter
  if (printAfter) {
    pseudoCodeBlock.block.push(printStarsNew(numPrintAfter))
    numStars += numPrintAfter
  }

  return { code: pseudoCode, numStars }
}

function computeStartEndVarsWhile(random: Random) {
  const cOption = random.choice(allWhileCases)

  let startVar1: number = -10
  let startVar2: number = -10
  let endValue: number = -10
  let compare: WhileCompareOptions = "<"
  let vars: WhileOrderOptions = "xn"

  const endManipulationOptions: BoundsOptions[] = [
    "none",
    { type: "mult", value: random.int(2, 3) },
    { type: "square", abs: true },
    { type: "log", value: 2 },
  ]

  let endManipulation: BoundsOptions = random.weightedChoice([
    [endManipulationOptions[0], 0.6],
    [endManipulationOptions[1], 0.15],
    [endManipulationOptions[2], 0.15],
    [endManipulationOptions[3], 0.1],
  ])
  // if manipulation is square we calculate abs(x)*x, so we keep the negative number

  if (cOption === "xPlus") {
    vars = random.choice(["xy", "yx", "xn"])
    if (vars === "xy" || vars == "yx") {
      if (vars == "xy") {
        // case x increases, so needs to be smaller than y (x+c <= y)
        compare = getCompare(random, "<")
      } else {
        compare = getCompare(random, ">")
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
      compare = getCompare(random, "<")
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
        compare = getCompare(random, "<")
      } else {
        compare = getCompare(random, ">")
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
      compare = getCompare(random, "<")
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
        compare = getCompare(random, "<")
      } else {
        compare = getCompare(random, ">")
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
      compare = getCompare(random, "<")
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
        compare = getCompare(random, ">")
      } else {
        compare = getCompare(random, "<")
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
      compare = getCompare(random, ">")
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
        compare = getCompare(random, ">")
      } else {
        compare = getCompare(random, "<")
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
      compare = getCompare(random, ">")
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
    compare = getCompare(random, "<")
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
    compare = getCompare(random, "<")
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
        compare = getCompare(random, ">")
      } else {
        compare = getCompare(random, "<")
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
      compare = getCompare(random, ">")
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
        compare = getCompare(random, ">")
      } else {
        compare = getCompare(random, "<")
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
      compare = getCompare(random, ">")
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
        compare = getCompare(random, ">")
      } else {
        compare = getCompare(random, "<")
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
      compare = getCompare(random, ">")
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
        compare = getCompare(random, ">")
      } else {
        compare = getCompare(random, "<")
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
      compare = getCompare(random, ">")
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
        compare = getCompare(random, ">")
      } else {
        compare = getCompare(random, "<")
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
        compare = getCompare(random, ">")
      } else {
        compare = getCompare(random, "<")
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

  return {
    startVar1,
    startVar2,
    endValue,
    vars,
    compare,
    cOption,
    endManipulation,
  }
}

function computeVariableToManipulateWhile(
  startVar1: number,
  startVar2: number,
  endValue: number,
  endManipulation: BoundsOptions,
  vars: "xy" | "yx" | "xn",
) {
  let varToManipulate = ""
  if (endManipulation !== "none") {
    if (vars === "xn") {
      if (endManipulation.type === "square") {
        if (endValue > startVar1) {
          varToManipulate = "e"
        } else if (startVar1 > endValue) {
          varToManipulate = "i"
        }
      } else if (endManipulation.type === "mult") {
        if (endValue > startVar1) {
          varToManipulate = "e"
        } else if (startVar1 > endValue) {
          varToManipulate = "i"
        }
      } else if (endManipulation.type === "log") {
        if (endValue > startVar1) {
          varToManipulate = "e"
        } else if (startVar1 > endValue) {
          varToManipulate = "i"
        }
      }
    } else if (vars === "xy" || vars === "yx") {
      if (endManipulation.type === "square") {
        if (startVar2 > startVar1) {
          varToManipulate = "j"
        } else if (startVar1 > startVar2) {
          varToManipulate = "i"
        }
      } else if (endManipulation.type === "mult") {
        if (startVar2 > startVar1) {
          varToManipulate = "j"
        } else if (startVar1 > startVar2) {
          varToManipulate = "i"
        }
      } else if (endManipulation.type === "log") {
        if (startVar2 > startVar1) {
          varToManipulate = "j"
        } else if (startVar1 > startVar2) {
          varToManipulate = "i"
        }
      }
    }
  }
  return varToManipulate
}
