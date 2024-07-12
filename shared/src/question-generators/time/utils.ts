import {
  printStarsNew,
  PseudoCodeAssignment,
  PseudoCodeBlock,
  PseudoCodeFor,
  PseudoCodeForAll,
  PseudoCodeIf,
  PseudoCodeString,
  PseudoCodeVariable,
  PseudoCodeWhile,
} from "@shared/utils/pseudoCodeUtils.ts"
import Random from "@shared/utils/random.ts"

export type AdditionOption = { type: "add"; value: number }
export type MultiplicationOption = { type: "mult"; value: number }
export type DivisionOption = { type: "div"; value: number }
export type SquareOption = { type: "square"; abs: boolean }
export type CubeOption = { type: "cube" }
export type LogOption = { type: "log"; value: number }
export type RootOption = { type: "root" } // can we display the fifth root of n in pseudocode?
export type PowOption = { type: "pow"; value: number | "self" }

export type BoundsOptions =
  | "none"
  | AdditionOption
  | MultiplicationOption
  | SquareOption
  | CubeOption
  | LogOption
  | RootOption
  | DivisionOption
  | PowOption

export type IfOptions = "none" | "even" | "odd" | "square" | "same" | ">" | "<"

export type WhileOrderOptions = "xy" | "yx" | "xn"
export type WhileCompareOptions = "==" | "<" | ">" | "<=" | ">="

// Here already as an array for faster access to random.choice
export const allWhileCases: string[] = [
  // cases for only X
  "xPlus", // increases first var with an addition
  "xMult", // increases first var with a multiplication
  "xSquare", // increases first var by squaring
  "xMinus", // decreases first var with a subtraction
  "xDiv", // decreases first var with a division
  "xLog", // decreases first var by log2(...)
  "xPlusX", // increases first var by doubling it (like x*2, but instead x+x)
  // cases where Y manipulates X
  "xPlusY", // increases first var with an addition of second var
  "xMultY", // increases first var with a multiplication of second var
  "xDivY", // decreases first var with a division of second var
  "xMinusY", // decreases first var with a subtraction of second var
  // cases where both change, but different directions
  "xMinusYPlus", // first var decreases, second var increases (by subtraction and addition)
  "xMinusYMult", // first var decreases, second var increases (by subtraction and multiplication)
  "xDivYPlus", // first var decreases, second var increases (by division and addition)
  "xDivYMult", // first var decreases, second var increases (by division and multiplication)
  "xMinusYYPlus", // first var decreases, second var decreases (first var - second var and second var by addition)
  // cases where both change but same direction,
  // but one var should move faster than the other,
  // this is controlled in whileCreatePseudo
  "bothPlus", // both increases (addition)
  "bothMult", // both increases (multiplication)
  "bothMinus", // both decreases (subtraction)
]

export function getCompare(random: Random, com: "<" | ">" | "<<" | ">>"): WhileCompareOptions {
  if (com === "<") {
    return random.weightedChoice([
      ["<", 0.49],
      ["<=", 0.49],
      ["==", 0.02],
    ])
  }
  if (com === ">") {
    return random.weightedChoice([
      [">", 0.49],
      [">=", 0.49],
      ["==", 0.02],
    ])
  }
  if (com === "<<") {
    return random.choice(["<", "<="])
  }
  return random.choice([">", ">="])
}

/**
 * Creates a for loop line
 * @param innerVar
 * @param start
 * @param startManipulation
 * @param end
 * @param endManipulation
 * @param stepSet
 * @param timeOrStars (if used to print stars or to determine the runtime of code)
 */
export function createForLine({
  innerVar,
  start,
  startManipulation = "none",
  end,
  endManipulation = "none",
  stepSet,
  timeOrStars = "stars",
}: {
  innerVar: string
  start?: string | PseudoCodeVariable
  startManipulation?: BoundsOptions
  end?: string
  endManipulation?: BoundsOptions
  stepSet?: string
  timeOrStars?: "time" | "stars"
}): PseudoCodeFor | PseudoCodeForAll {
  if (stepSet === undefined) {
    if (start === undefined || end === undefined)
      throw new Error("Either start, end or step should be defined.")

    // create start string via createBoundsString
    const startString = createBoundsString(start, startManipulation, timeOrStars)
    // create the end string via createBoundsString
    const endString = createBoundsString(end, endManipulation, timeOrStars)

    return {
      for: {
        variable: innerVar,
        from: startString,
        to: endString,
        do: null,
      },
    }
  }

  return {
    forAll: {
      variable: innerVar,
      set: [stepSet],
      do: null,
    },
  }
}

/**
 * Creates a while loop line
 * @param start
 * @param startManipulation
 * @param end
 * @param endManipulation
 * @param compare
 * @param timeOrStars
 * @param indent
 */
export function createWhileLine({
  start,
  startManipulation = "none",
  end,
  endManipulation = "none",
  compare,
  timeOrStars = "stars",
}: {
  start: string | PseudoCodeVariable
  startManipulation?: BoundsOptions
  end: string | PseudoCodeVariable
  endManipulation?: BoundsOptions
  compare: string
  timeOrStars?: "time" | "stars"
}): PseudoCodeWhile {
  // if compare = "==", we just return start compare end without manipulation
  if (compare === "==") {
    return {
      while: {
        condition: [start, compare, end],
        do: null,
      },
    }
  }

  const startBounds = createBoundsString(start, startManipulation, timeOrStars)
  const endBounds = createBoundsString(end, endManipulation, timeOrStars)

  return {
    while: {
      condition: [...startBounds, compare, ...endBounds],
      do: null,
    },
  }
}

/**
 * Creates a string how to manipulate the bounds (of a for loop or while loop)
 * @param value
 * @param boundsManipulation
 * @param timeOrStars
 */
export function createBoundsString(
  value: string | PseudoCodeVariable,
  boundsManipulation: BoundsOptions,
  timeOrStars?: "time" | "stars",
) {
  // create the bounds string
  let endPseudoCodeString: PseudoCodeString = [value]
  if (boundsManipulation !== "none") {
    if (boundsManipulation.type === "mult") {
      endPseudoCodeString = [`${boundsManipulation.value} \\cdot`, value]
    }
    if (boundsManipulation.type === "square") {
      if (timeOrStars === "stars" && boundsManipulation.abs) {
        endPseudoCodeString = [value, " \\cdot ", value]
      } else {
        endPseudoCodeString = [value, "^2"]
      }
    }
    if (boundsManipulation.type === "cube") {
      endPseudoCodeString = [value, "^3"]
    }
    if (boundsManipulation.type === "log") {
      if (timeOrStars === "stars") {
        endPseudoCodeString = [`\\lceil log_${boundsManipulation.value}(`, value, `) \\rceil`]
      } else {
        endPseudoCodeString = [
          `log_${boundsManipulation.value === 0 ? "" : boundsManipulation.value}(`,
          value,
          `)`,
        ]
      }
    }
    if (boundsManipulation.type === "root") {
      if (timeOrStars === "stars") {
        endPseudoCodeString = [`\\lfloor \\sqrt{`, value, `} \\rfloor`]
      } else {
        endPseudoCodeString = [`\\sqrt{`, value, `}`]
      }
    }
    if (boundsManipulation.type === "div") {
      if (timeOrStars === "stars") {
        endPseudoCodeString = [`\\lfloor \\frac{`, value, `}{${boundsManipulation.value}} \\rfloor`]
      } else {
        endPseudoCodeString = [`\\frac{`, value, `}{${boundsManipulation.value}}`]
      }
    }
    if (boundsManipulation.type === "pow") {
      endPseudoCodeString = [
        boundsManipulation.value === "self" ? value : boundsManipulation.value.toString(),
        "^",
        value,
      ]
    }
    if (boundsManipulation.type === "add") {
      endPseudoCodeString = [
        value,
        boundsManipulation.value > 0 ? "+" : "",
        boundsManipulation.value.toString(),
      ]
    }
  }
  return endPseudoCodeString
}

/**
 * Creates an if condition
 * @param innerVar1
 * @param innerVar2
 * @param condition
 * @param elseStatement
 * @param numPrint
 * @param numPrintElse
 * @param writeCode if other code should be written inside the if statement
 * @param indent
 */
export function createIfCondition({
  innerVar1,
  innerVar2 = "none",
  condition,
  elseStatement = false,
  numPrint = 0,
  numPrintElse = 0,
  writeCode = "",
}: {
  innerVar1: string
  innerVar2?: string
  condition: IfOptions
  elseStatement?: boolean
  numPrint?: number
  numPrintElse?: number
  writeCode?: string
}): PseudoCodeIf {
  if (condition === "none") {
    throw new Error("There should not be an if condition with none.")
  }

  let formattedCondition: PseudoCodeString
  if (condition === "same" || condition === ">" || condition === "<") {
    formattedCondition = [
      { variable: innerVar1 },
      `${condition === "same" ? "==" : condition}`,
      { variable: innerVar2 },
    ]
  } else {
    formattedCondition = [{ variable: innerVar1 }, `\\text{ is ${condition}}`]
  }

  const thenStatement: PseudoCodeBlock = {
    block: [],
  }
  if (numPrint > 0) {
    thenStatement.block.push(printStarsNew(numPrint))
  }
  if (writeCode !== "") {
    thenStatement.block.push({
      state: [writeCode],
    })
  }

  const ifStatement: PseudoCodeIf = {
    if: {
      condition: formattedCondition,
      then: thenStatement,
    },
  }

  if (elseStatement) {
    ifStatement.if.else = {
      block: [printStarsNew(numPrintElse)],
    }
  }

  return ifStatement
}

/**
 * Creates the comparing of while loops
 * - Either creates code
 * - Or returns the new values of the inner variables (changeI, changeJ)
 * @param cOption
 * @param firstChangeValue
 * @param secondChangeValue
 * @param innerVar
 * @param innerVar2
 * @param code
 * @param compare
 * @param vars
 * @param changeCode
 * @param changeI
 * @param changeJ
 * @param random
 */
export function createWhileChangeValues({
  cOption,
  firstChangeValue,
  secondChangeValue,
  innerVar = "nan",
  innerVar2 = "nan",
  compare,
  vars,
  changeCode = true,
  changeI = 0,
  changeJ = 0,
  random,
}: {
  cOption: string
  firstChangeValue: number
  secondChangeValue: number
  innerVar?: string
  innerVar2?: string
  compare: WhileCompareOptions
  vars: WhileOrderOptions
  changeCode?: boolean
  changeI?: number
  changeJ?: number
  random: Random
}) {
  // changeI -> innerVar
  // changeJ -> innerVar2
  const assignments: PseudoCodeAssignment[] = []
  if (cOption === "xPlus") {
    assignments.push({
      assignment: innerVar,
      value: [{ variable: innerVar }, "+", firstChangeValue.toString()],
    })
    changeI += firstChangeValue
  } else if (cOption === "xMult") {
    changeCode ? (firstChangeValue = random.int(2, 3)) : ""
    assignments.push({
      assignment: innerVar,
      value: [{ variable: innerVar }, "*", firstChangeValue.toString()],
    })
    changeI *= firstChangeValue
  } else if (cOption === "xSquare") {
    assignments.push({
      assignment: innerVar,
      value: [{ variable: innerVar }, "^2"],
    })
    changeI *= changeI
  } else if (cOption === "xPlusX") {
    assignments.push({
      assignment: innerVar,
      value: [{ variable: innerVar }, "+", { variable: innerVar }],
    })
    changeI += changeI
  } else if (cOption === "xMinus") {
    assignments.push({
      assignment: innerVar,
      value: [{ variable: innerVar }, "-", firstChangeValue.toString()],
    })
    changeI -= firstChangeValue
  } else if (cOption === "xDiv") {
    changeCode ? (firstChangeValue = random.int(2, 3)) : ""
    assignments.push({
      assignment: innerVar,
      value: [
        "\\lfloor \\frac{",
        { variable: innerVar },
        "}{",
        firstChangeValue.toString(),
        "} \\rfloor",
      ],
    })
    changeI = Math.floor(changeI / firstChangeValue)
  } else if (cOption === "xLog") {
    assignments.push({
      assignment: innerVar,
      value: ["\\lceil ", "log_2(", innerVar, ")", "\\rceil"],
    })
    changeI = Math.ceil(Math.log2(changeI))
  } else if (cOption === "xMinusY") {
    assignments.push({
      assignment: innerVar,
      value: [{ variable: innerVar }, "-", { variable: innerVar2 }],
    })
    changeI -= changeJ
  } else if (cOption === "xDivY") {
    assignments.push({
      assignment: innerVar,
      value: ["\\lfloor \\frac{", { variable: innerVar }, "}{", { variable: innerVar2 }, "} \\rfloor"],
    })
    changeI = Math.floor(changeI / changeJ)
  } else if (cOption === "xPlusY") {
    assignments.push({
      assignment: innerVar,
      value: [{ variable: innerVar }, "+", { variable: innerVar2 }],
    })
    changeI += changeJ
  } else if (cOption === "xMultY") {
    assignments.push({
      assignment: innerVar,
      value: [{ variable: innerVar }, "*", { variable: innerVar2 }],
    })
    changeI *= changeJ
  } else if (cOption === "xMinusYPlus") {
    assignments.push({
      assignment: innerVar,
      value: [{ variable: innerVar }, "-", firstChangeValue.toString()],
    })
    assignments.push({
      assignment: innerVar2,
      value: [{ variable: innerVar2 }, "+", secondChangeValue.toString()],
    })
    changeI -= firstChangeValue
    changeJ += secondChangeValue
  } else if (cOption === "xDivYPlus") {
    changeCode ? (firstChangeValue = random.int(2, 3)) : ""
    assignments.push({
      assignment: innerVar,
      value: [
        "\\lfloor \\frac{",
        { variable: innerVar },
        "}{",
        firstChangeValue.toString(),
        "} \\rfloor",
      ],
    })
    assignments.push({
      assignment: innerVar2,
      value: [{ variable: innerVar2 }, "+", secondChangeValue.toString()],
    })
    changeI = Math.floor(changeI / firstChangeValue)
    changeJ += secondChangeValue
  } else if (cOption === "xMinusYMult") {
    assignments.push({
      assignment: innerVar,
      value: [{ variable: innerVar }, "-", firstChangeValue.toString()],
    })
    changeCode ? (secondChangeValue = random.int(2, 3)) : ""
    assignments.push({
      assignment: innerVar2,
      value: [{ variable: innerVar2 }, " \\cdot ", secondChangeValue.toString()],
    })
    changeI -= firstChangeValue
    changeJ *= secondChangeValue
  } else if (cOption === "xDivYMult") {
    changeCode ? (firstChangeValue = random.int(2, 3)) : ""
    assignments.push({
      assignment: innerVar,
      value: [
        "\\lfloor \\frac{",
        { variable: innerVar },
        "}{",
        firstChangeValue.toString(),
        "} \\rfloor",
      ],
    })
    changeCode ? (secondChangeValue = random.int(2, 3)) : ""
    assignments.push({
      assignment: innerVar2,
      value: [{ variable: innerVar2 }, "*", secondChangeValue.toString()],
    })
    changeI = Math.floor(changeI / firstChangeValue)
    changeJ *= secondChangeValue
  } else if (cOption === "xMinusYYPlus") {
    assignments.push({
      assignment: innerVar,
      value: [{ variable: innerVar }, "-", { variable: innerVar2 }],
    })
    assignments.push({
      assignment: innerVar2,
      value: [{ variable: innerVar2 }, "+", secondChangeValue.toString()],
    })
    changeI -= changeJ
    changeJ += secondChangeValue
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
    assignments.push({
      assignment: innerVar,
      value: [{ variable: innerVar }, "-", firstChangeValue.toString()],
    })
    assignments.push({
      assignment: innerVar2,
      value: [{ variable: innerVar2 }, "-", secondChangeValue.toString()],
    })
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
    assignments.push({
      assignment: innerVar,
      value: [{ variable: innerVar }, "+", firstChangeValue.toString()],
    })
    assignments.push({
      assignment: innerVar2,
      value: [{ variable: innerVar2 }, "+", secondChangeValue.toString()],
    })
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
    assignments.push({
      assignment: innerVar,
      value: [{ variable: innerVar }, "*", firstChangeValue.toString()],
    })
    assignments.push({
      assignment: innerVar2,
      value: [{ variable: innerVar2 }, "*", secondChangeValue.toString()],
    })
    changeI *= firstChangeValue
    changeJ *= secondChangeValue
  }

  return {
    assignments,
    firstChangeValue,
    secondChangeValue,
    changeI,
    changeJ,
  }
}
