import Fraction from "fraction.js"
import {
  addDependencies,
  ConfigOptions,
  create,
  divideDependencies,
  formatDependencies,
  FractionDependencies,
  log,
  log2,
  multiplyDependencies,
  parseDependencies,
  powDependencies,
  simplifyDependencies,
  subtractDependencies,
} from "mathjs"

const config = {
  number: "Fraction",
} as ConfigOptions

// Create just the functions we need
const math = create(
  {
    addDependencies,
    divideDependencies,
    formatDependencies,
    FractionDependencies,
    multiplyDependencies,
    parseDependencies,
    powDependencies,
    simplifyDependencies,
    subtractDependencies,
  },
  config
)

interface Func {
  (arg: any): any //a call signature
  toTex?: string //express of function in object literal
}

const customFunctions = {
  log: ((a: number, b: number = 2) => log(a) / log(b)) as Func,
  log2: ((a: number) => log2(a)) as Func,
}
customFunctions.log.toTex = "\\mathrm{${name}}\\left(${args}\\right)"
customFunctions.log2.toTex = "\\mathrm{${name}}\\left(${args}\\right)"
math.import(customFunctions)

// @ts-ignore
delete math.Unit

export default math

export function max(a: Fraction, b: Fraction): Fraction {
  return a.compare(b) > 0 ? a : b
}
export function min(a: Fraction, b: Fraction): Fraction {
  return a.compare(b) < 0 ? a : b
}
export function log2Fraction(a: Fraction | number): Fraction {
  return new Fraction(math.log2(new Fraction(a).valueOf()))
}
export function logFraction(a: Fraction | number, b: number): Fraction {
  return new Fraction(math.log(new Fraction(a).valueOf(), b))
}
export function exponentToText(x: Fraction) {
  if (x.d === 1) {
    return x.equals(1) ? "" : `^${x.n}`
  } else {
    return x.equals(1) ? "" : `^(${x.toFraction()})`
  }
}
export function exponentToLatex(x: Fraction) {
  return x.equals(1) ? "" : `^{${x.toFraction()}}`
}

/**
 * Takes the name of a FunctionNode function, assumes it is a logarithm, and
 * returns the base of the logarithm.
 * @param name The name of the function
 * @returns The base of the logarithm, or undefined if the function is not a
 *
 */
export function baseOfLog(name: string): number | undefined {
  if (name.startsWith("log")) {
    const [, base] = name.split("_")
    if (base) {
      return parseInt(base)
    } else {
      return 2
    }
  }
  if (name === "lg") {
    return 10
  }
  if (name === "ln") {
    return math.e
  }
}
