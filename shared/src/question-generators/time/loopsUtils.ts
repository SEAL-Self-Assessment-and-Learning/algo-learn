import { printStars } from "@shared/question-generators/recursion/formulaUtils.ts"
import Random from "@shared/utils/random.ts"

export type AdditionOption = { type: "add"; value: number }
export type MultiplicationOption = { type: "mult"; value: number }
export type DivisionOption = { type: "div"; value: number }
export type SquareOption = { type: "square" }
export type CubeOption = { type: "cube" }
export type LogOption = { type: "log"; value: number }
export type RootOption = { type: "root" } // can we display the fifth root of n in pseudocode?
export type PowOption = { type: "pow"; value: number | "self" }

export type StepOptions =
  | "normal"
  | AdditionOption
  | MultiplicationOption
  | SquareOption
  | DivisionOption

export type BoundsOptions =
  | "none"
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

export function createForLine({
  innerVar,
  start,
  startManipulation = "none",
  end,
  endManipulation = "none",
  step = "normal",
  indent = 0,
}: {
  innerVar: string
  start: string
  startManipulation?: BoundsOptions
  end: string
  endManipulation?: BoundsOptions
  step?: StepOptions
  indent: number
}): string {
  // check if the for loop can finish
  checkForLoopLogicError({ start, startManipulation, endManipulation, step })

  // create the spacing in front the for statement
  const _: string = " ".repeat(indent)

  // create start string via createBoundsString
  const startString = createBoundsString(start, startManipulation)

  // create the step string via createStepString
  const stepString = createStepString(step, innerVar, true)

  // create the end string via createBoundsString
  const endString = createBoundsString(end, endManipulation)

  return `${_}for ${innerVar} from ${startString} to ${endString}${stepString}:\n`
}

export function createWhileLine({
  start,
  startManipulation = "none",
  end,
  endManipulation = "none",
  compare,
  indent = 0,
}: {
  start: string
  startManipulation?: BoundsOptions
  end: string
  endManipulation?: BoundsOptions
  compare: string
  indent: number
}): string {
  const _: string = " ".repeat(indent)

  // if compare = "==", we just return start compare end without manipulation
  if (compare === "==") {
    return `${_}while ${start} ${compare} ${end}:\n`
  }

  const startBounds = createBoundsString(start, startManipulation)
  const endBounds = createBoundsString(end, endManipulation)

  return `${_}while ${startBounds} ${compare} ${endBounds}:\n`
}

export function createStepString(step: StepOptions, innerVar: string, forLoop: boolean = false) {
  // create the step string
  let stepString: string = ""
  if (typeof step !== "string") {
    const addOrMult: "+" | "*" | "/" | "-" =
      step.type === "add" ? (step.value < 0 ? "-" : "+") : step.type === "div" ? "/" : "*"
    const stepValue = step.type === "square" ? "square" : Math.abs(step.value).toString()
    const prompt = `${forLoop ? " with" : ""}`
    stepString = `${prompt} ${innerVar} ${addOrMult}= ${stepValue === "square" ? innerVar : stepValue}`
  }
  return stepString
}

export function createBoundsString(value: string, boundsManipulation: BoundsOptions) {
  // create the bounds string
  let endString: string = boundsManipulation === "none" ? value : ""
  if (boundsManipulation !== "none") {
    if (boundsManipulation.type === "mult") {
      endString = `${boundsManipulation.value}*${value}`
    }
    if (boundsManipulation.type === "square") {
      endString = `abs(${value})*${value}`
    }
    if (boundsManipulation.type === "cube") {
      endString = `${value}*${value}*${value}`
    }
    if (boundsManipulation.type === "log") {
      endString = `ceil(log${boundsManipulation.value}(${value}))`
    }
    if (boundsManipulation.type === "root") {
      endString = `floor(root(${value}))`
    }
    if (boundsManipulation.type === "div") {
      endString = `floor(${value}/${boundsManipulation.value})`
    }
    if (boundsManipulation.type === "pow") {
      endString = `pow(${boundsManipulation.value === "self" ? value : boundsManipulation.value},${value})`
    }
  }
  return endString
}

export function createIfCondition({
  innerVar1,
  innerVar2 = "none",
  condition,
  elseStatement = false,
  numPrint = 0,
  numPrintElse = 0,
  writeCode = "",
  indent = 0,
}: {
  innerVar1: string
  innerVar2?: string
  condition: IfOptions
  elseStatement?: boolean
  numPrint?: number
  numPrintElse?: number
  writeCode?: string
  indent?: number
}): string {
  let code = ""
  const _ = " ".repeat(indent)
  if (condition === "same" || condition === ">" || condition === "<") {
    code += `${_}if ${innerVar1} == ${innerVar2}:\n`
  } else {
    if (condition !== "none") {
      code += `${_}if ${innerVar1} is ${condition}:\n`
    }
  }
  if (numPrint > 0) {
    code += printStars(numPrint, indent + (condition !== "none" ? 2 : 0))
  }
  if (writeCode !== "") {
    code += `${_}  ${writeCode}`
  }

  if (elseStatement) {
    code += `${_}else:\n`
    code += printStars(numPrintElse, indent + 2)
  }

  return code
}

export function createIfContinue({
  con = true,
  indent = 0,
}: {
  con?: boolean
  indent?: number
}): string {
  return con ? " ".repeat(indent) + "continue\n" : ""
}

export function createIfBreak({ br = true, indent = 0 }: { br?: boolean; indent?: number }): string {
  return br ? " ".repeat(indent) + "break\n" : ""
}

export function createVariable({
  variable,
  value,
  indent = 0,
}: {
  variable: string
  value: string
  indent?: number
}): string {
  return `${" ".repeat(indent)}${variable} = ${value}\n`
}

export function createWhileChangeValues({
  cOption,
  firstChangeValue,
  secondChangeValue,
  innerVar = "na",
  innerVar2 = "na",
  code = "",
  _ = "",
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
  code?: string
  _?: string
  compare: WhileCompareOptions
  vars: WhileOrderOptions
  changeCode?: boolean
  changeI?: number
  changeJ?: number
  random: Random
}) {
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

function checkForLoopLogicError({
  start,
  startManipulation,
  endManipulation,
  step,
}: {
  start: string
  startManipulation: BoundsOptions
  endManipulation: BoundsOptions
  step: StepOptions
}) {
  // TODO add more logic errors

  function checkManipulation(manipulation: BoundsOptions) {
    // Log value has to be greater than 1
    if (manipulation !== "none" && manipulation.type === "log" && manipulation.value <= 1) {
      throw new Error("Log value has to be greater than 1")
    }

    if (
      manipulation !== "none" &&
      manipulation.type === "pow" &&
      typeof manipulation.value === "number" &&
      manipulation.value < 0
    ) {
      throw new Error("Pow value has to be greater or equal to 0")
    }
  }

  // this is only not possible if *var and start="1"
  if (typeof step !== "string" && step.type === "square" && Number.parseInt(start) <= 1) {
    throw new Error("Cannot finish loop, because the step is *var and the start is 1")
  }

  // Multiplication step should be bigger than 1
  if (typeof step !== "string" && step.type === "mult" && Math.abs(step.value) <= 1) {
    throw new Error("Multiplication step should be bigger than 1")
  }

  // Addition needs to have at least a value of Math.abs(x) >= 1
  if (typeof step !== "string" && step.type === "add" && Math.abs(step.value) < 1) {
    throw new Error("Addition step should be bigger than 1")
  }

  // check if the start manipulation is valid
  checkManipulation(startManipulation)
  // check if the end manipulation is valid
  checkManipulation(endManipulation)
}
