import Fraction from "fraction.js"
import {
  addDependencies,
  ConfigOptions,
  create,
  divideDependencies,
  formatDependencies,
  FractionDependencies as fractionDependencies,
  log,
  log2,
  multiplyDependencies,
  parseDependencies,
  powDependencies,
  simplifyDependencies,
  subtractDependencies,
} from "mathjs"

const config: ConfigOptions = {
  number: "Fraction",
}

// Create just the functions we need
const math = create(
  {
    addDependencies,
    divideDependencies,
    formatDependencies,
    fractionDependencies,
    multiplyDependencies,
    parseDependencies,
    powDependencies,
    simplifyDependencies,
    subtractDependencies,
  },
  config,
)

interface Func {
  (arg: any): any //a call signature
  toTex?: string //express of function in object literal
}

const customFunctions: { log: Func; log2: Func } = {
  log: (a: number, b: number = 2) => log(a) / log(b),
  log2: (a: number) => log2(a),
}
customFunctions.log.toTex = "\\mathrm{${name}}\\left(${args}\\right)"
customFunctions.log2.toTex = "\\mathrm{${name}}\\left(${args}\\right)"
math.import(customFunctions)

// @ts-expect-error mathjs does not provide types
delete math.Unit

export default math

/**
 * Return the maximum of two fractions
 *
 * @param a - The first fraction
 * @param b - The second fraction
 * @returns The maximum of a and b
 */
export function max(a: Fraction, b: Fraction): Fraction {
  return a.compare(b) > 0 ? a : b
}

/**
 * Return the minimum of two numbers. Other than Math.min, this function works
 * with Fractions and with Infinity.
 *
 * @param a - The first number
 * @param b - The second number
 * @returns The minimum of a and b
 */
export function min<T>(a: T, b: T): T {
  if (a instanceof Fraction && b instanceof Fraction) {
    return a.compare(b) < 0 ? a : b
  } else {
    return a < b ? a : b
  }
}

/**
 * Return the base-2 logarithm of a Fraction.
 *
 * @param x - The number to take the logarithm of
 * @returns The number log_2(x) as a Fraction
 */
export function log2Fraction(x: Fraction | number): Fraction {
  return new Fraction(math.log2(new Fraction(x).valueOf()))
}

/**
 * Return the logarithm of a Fraction.
 *
 * @param x - The number to take the logarithm of
 * @param b - The base of the logarithm
 * @returns The number log_b(x) as a Fraction
 */
export function logFraction(x: Fraction | number, b: number): Fraction {
  return new Fraction(math.log(new Fraction(x).valueOf(), b))
}

/**
 * Prints x as an exponent if x is not 1. Moreover, if the fraction n/d is
 * non-trivial (that is, has d != 1), then print it as "(n/d)".
 *
 * @param x - The exponent
 * @returns The exponent as text
 */
export function exponentToText(x: Fraction) {
  if (x.equals(1)) {
    return ""
  } else if (x.d === 1) {
    return `^${x.n}`
  } else {
    return `^(${x.toFraction()})`
  }
}

/**
 * Prints x as an exponent if x is not 1. Moreover, if the fraction n/d is
 * non-trivial (that is, has d != 1), then print it as "^{n/d}".
 *
 * @param x - The exponent
 * @returns The exponent as a LaTeX string
 */
export function exponentToLatex(x: Fraction) {
  return x.equals(1) ? "" : `^{${x.toFraction()}}`
}

/**
 * Return all variables in a given mathjs expression
 *
 * @param node - The mathjs expression
 * @returns List of variables
 */
export function getVars(node: math.MathNode): Array<string> {
  if (
    (node instanceof math.OperatorNode || node instanceof math.FunctionNode) &&
    node.args instanceof Array
  ) {
    return node.args.flatMap(getVars)
  } else if (node instanceof math.SymbolNode) {
    return [node.name]
  } else if (node instanceof math.ParenthesisNode) {
    return getVars(node.content as math.MathNode)
  } else if (node instanceof math.ConstantNode) {
    return []
  } else {
    throw Error("Unknown node type '" + node.type + "' in getVars")
  }
}

/**
 * Takes the name of a FunctionNode function, assumes it is a logarithm, and
 * returns the base of the logarithm.
 *
 * @param name - The name of the function
 * @returns The base of the logarithm, or undefined if the function is not a
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
