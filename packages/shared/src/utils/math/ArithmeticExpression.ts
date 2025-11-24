/*
Future-Extensions:
- Extend UnaryNode to support more operations like sqrt, exp, etc.
- Support constants like e and pi in parsing and evaluation
- Derive more simplification rules
- Compute integrals and derivatives
- 
*/

export type ArithmeticOperator = "+" | "-" | "*" | "/" | "^"

export type SymbolicAssignmentValue = number | ExprNode
export type SymbolicAssignments = Record<string, SymbolicAssignmentValue>

export interface EvaluateOptions {
  simplify?: boolean
}

export type EvaluationResult = number | ExprNode

export interface ParseOptions {
  simplify?: boolean
  allowImplicitMultiplication?: boolean
}

export interface FunctionDefinition {
  evaluate: (...args: number[]) => number
  toTex?: (args: string[]) => string
  toString?: (args: string[]) => string
  arity?: number
}

export interface Fraction {
  numerator: number
  denominator: number
}

interface SignedTerm {
  node: ExprNode
  sign: 1 | -1
}

const operatorTex = (operator: ArithmeticOperator) => {
  switch (operator) {
    case "*":
      return "\\cdot"
    case "/":
      // Only partial implementation; should be handled specially
      return "\\dfrac{}{}"
    case "^":
      return "^"
    default:
      return operator
  }
}

const NUMERIC_EPSILON = 1e-8
const MAX_APPROXIMATE_DENOMINATOR = 1000

const radToDeg = (x: number) => (x * Math.PI) / 180

/**
 * Mathematical function registry
 * Includes basic functions like sin, cos, tan, exp, log, sqrt, abs
 *
 * Can be extended by adding more functions to the registry
 * Like: max, min, etc.
 */
function functionRegistry(degree: boolean = false): Record<string, FunctionDefinition> {
  return {
    sin: {
      evaluate: degree ? (x) => Math.sin(radToDeg(x)) : (x) => Math.sin(x),
      toTex: (args) => `\\sin\\left(${args[0]}\\right)`,
      arity: 1,
    },
    cos: {
      evaluate: degree ? (x) => Math.cos(radToDeg(x)) : (x) => Math.cos(x),
      toTex: (args) => `\\cos\\left(${args[0]}\\right)`,
      arity: 1,
    },
    tan: {
      evaluate: degree ? (x) => Math.tan(radToDeg(x)) : (x) => Math.tan(x),
      toTex: (args) => `\\tan\\left(${args[0]}\\right)`,
      arity: 1,
    },
    exp: {
      evaluate: Math.exp,
      toTex: (args) => `\\exp\\left(${args[0]}\\right)`,
      arity: 1,
    },
    log: {
      evaluate: Math.log,
      toTex: (args) => `\\ln\\left(${args[0]}\\right)`,
      arity: 1,
    },
    sqrt: {
      evaluate: Math.sqrt,
      toTex: (args) => `\\sqrt{${args[0]}}`,
      arity: 1,
    },
    abs: {
      evaluate: Math.abs,
      toTex: (args) => `\\left|${args[0]}\\right|`,
      arity: 1,
    },
  }
}

/**
 * Retrieve function definition from the registry
 * @param name - name of the mathematical function
 * @param degree - whether to use degree mode for trigonometric functions
 */
export function getFunctionDefinition(name: string, degree: boolean = false): FunctionDefinition {
  const definition = functionRegistry(degree)[name]
  if (!definition) {
    throw new Error(`Unknown function '${name}'. Consider registering it via registerFunction.`)
  }
  return definition
}

/**
 * Check if two numbers are approximately equal within a small epsilon
 * @param a
 * @param b
 * @param epsilon
 */
export function approximatelyEqual(a: number, b: number, epsilon = NUMERIC_EPSILON): boolean {
  return Math.abs(a - b) < epsilon
}

/**
 * Helper checking if a number is approximately zero
 * @param value
 */
export function isApproximatelyZero(value: number): boolean {
  return approximatelyEqual(value, 0)
}

/**
 * Normalize numeric value by rounding to a certain precision
 * @param value
 * @param precision
 */
function normalizeNumeric(value: number, precision = 4): number {
  if (Number.isNaN(value)) return value
  if (!Number.isFinite(value)) return value
  if (isApproximatelyZero(value)) return 0
  const rounded = parseFloat(value.toFixed(precision))
  const nearestInteger = Math.round(rounded)
  if (approximatelyEqual(rounded, nearestInteger)) {
    return nearestInteger
  }
  return rounded
}

/**
 * Helper-Function to compute gcd
 * @param a
 * @param b
 * @returns greatest common divisor
 */
function gcdInteger(a: number, b: number): number {
  let x = Math.abs(Math.round(a))
  let y = Math.abs(Math.round(b))
  if (x === 0 && y === 0) {
    return 1
  }
  while (y !== 0) {
    const temp = x % y
    x = y
    y = temp
  }
  return x === 0 ? 1 : x
}

/**
 * @Alex ist das korrekt?
 *
 * @param base
 * @param exp
 * @param mod
 */
function modPow(base: number, exp: number, mod: number): number {
  if (mod === 0) {
    throw new Error("Modulus cannot be zero.")
  }

  // 1. Convert inputs to BigInt
  const bigBase = BigInt(base)
  let bigExp = BigInt(exp)
  const bigMod = BigInt(mod)

  if (bigExp < 0n) {
    throw new Error("Exponent must be non-negative.")
  }
  if (bigExp === 0n) {
    return Number(1n % bigMod)
  }

  let result = 1n
  let b = bigBase % bigMod

  // 2. Perform all calculations using BigInt arithmetic
  while (bigExp > 0n) {
    // Check if exponent is odd (if the LSB is 1)
    if (bigExp & 1n) {
      result = (result * b) % bigMod
    }

    // Square the base, applying the modulus
    b = (b * b) % bigMod

    // Right-shift (divide by 2) the exponent
    bigExp >>= 1n
  }

  // 3. Convert the final result back to number (if it fits)
  return Number(result)
}

function normalizeFraction(numerator: number, denominator: number): Fraction {
  if (denominator === 0) {
    throw new Error("Cannot normalize fraction with zero denominator")
  }
  let num = Math.round(numerator)
  let den = Math.round(denominator)
  if (den < 0) {
    num = -num
    den = -den
  }
  if (num === 0) {
    return { numerator: 0, denominator: 1 }
  }
  const divisor = gcdInteger(num, den)
  return {
    numerator: num / divisor,
    denominator: den / divisor,
  }
}

function fractionFromDecimal(value: number, precision = 4): Fraction {
  const sign = value < 0 ? -1 : 1
  const absolute = Math.abs(value)
  const str = absolute.toString()
  const decimals =
    str.includes(".") && !str.toLowerCase().includes("e") ? str.split(".")[1].length : precision
  const denominator = Math.pow(10, Math.min(decimals, precision))
  const numerator = Math.round(absolute * denominator)
  return normalizeFraction(sign * numerator, denominator)
}

function approximateFraction(value: number, maxDenominator: number, tolerance: number): Fraction | null {
  if (!Number.isFinite(value)) {
    return null
  }
  if (value === 0) {
    return { numerator: 0, denominator: 1 }
  }

  const sign = value < 0 ? -1 : 1
  const target = Math.abs(value)
  let bestFraction: Fraction | null = null
  let bestError = Number.POSITIVE_INFINITY

  for (let denominator = 1; denominator <= maxDenominator; denominator++) {
    const numerator = Math.round(target * denominator)
    const candidate = normalizeFraction(sign * numerator, denominator)
    const candidateValue = Math.abs(candidate.numerator / candidate.denominator)
    const error = Math.abs(target - candidateValue)

    if (!bestFraction || error < bestError - tolerance) {
      bestFraction = candidate
      bestError = error
    } else if (
      Math.abs(error - bestError) <= tolerance &&
      bestFraction &&
      candidate.denominator < bestFraction.denominator
    ) {
      bestFraction = candidate
      bestError = error
    }

    if (error <= tolerance) {
      break
    }
  }

  return bestFraction
}

function fractionToString(fraction: Fraction, asTex: boolean): string {
  const { numerator, denominator } = fraction
  if (denominator === 1) {
    return numerator.toString()
  }
  if (numerator === 0) {
    return "0"
  }
  const sign = numerator < 0 ? "-" : ""
  const absoluteNumerator = Math.abs(numerator)
  if (asTex) {
    return `${sign}\\dfrac{${absoluteNumerator}}{${denominator}}`
  }
  return `${sign}${absoluteNumerator}/${denominator}`
}

/**
 * Format number as string after normalization
 * @param value
 * @param precision
 */
function formatNumber(value: number, precision = 4): string {
  return formatNumberInternal(value, precision, false)
}

/**
 * Format to Tex
 * @param value
 * @param precision
 */
function formatNumberToTex(value: number, precision = 4): string {
  return formatNumberInternal(value, precision, true)
}

/**
 * Formats number to
 * - NaN if not a number
 * - Infinity/-Infinity if infinite
 * - 0 if zero
 * - integer if integer
 * - fraction otherwise
 * @param value
 * @param precision
 * @param asTex
 */
function formatNumberInternal(value: number, precision = 4, asTex = false): string {
  const normalized = normalizeNumeric(value, precision)
  if (Number.isNaN(normalized)) {
    return "NaN"
  }
  if (!Number.isFinite(normalized)) {
    return normalized.toString()
  }
  if (normalized === 0) {
    return "0"
  }
  if (Number.isInteger(normalized)) {
    return normalized.toString()
  }

  // Approximate as fraction
  const tolerance = 1 / Math.pow(10, precision)
  const approxMaxDenominator = Math.min(MAX_APPROXIMATE_DENOMINATOR, Math.pow(10, precision))
  const approximated = approximateFraction(normalized, approxMaxDenominator, tolerance)
  const fraction =
    approximated && Math.abs(approximated.numerator / approximated.denominator - normalized) <= tolerance
      ? approximated
      : fractionFromDecimal(normalized, precision)

  return fractionToString(fraction, asTex)
}

function ensureWrapped(str: string): string {
  if (str.length >= 2 && str.startsWith("(") && str.endsWith(")")) {
    return str
  }
  return `(${str})`
}

function ensureTexWrapped(str: string): string {
  if (str.startsWith("\\left(") && str.endsWith("\\right)")) {
    return str
  }
  return `\\left(${str}\\right)`
}


/**
 * Converts the result of an evaluation into an ExprNode
 * @param result
 */
function evaluationResultToExpr(result: EvaluationResult): ExprNode {
  if (typeof result === "number") {
    return new ConstantNode(normalizeNumeric(result))
  }
  return result.clone()
}

/**
 * Checks if the evaluation result is numeric, otherwise throws an error
 * @param result
 * @param context
 */
export function expectNumeric(result: EvaluationResult, context: string): number {
  if (typeof result !== "number") {
    throw new Error(`${context}: expected numeric result but received symbolic expression`)
  }
  return result
}

/**
 * Expression Node Base Class
 */
export abstract class ExprNode {
  /**
   * Convert expression to string
   */
  abstract toString(precision?: number): string

  /**
   * Convert expression to LaTeX string
   */
  abstract toTex(precision?: number): string

  /**
   * Evaluate expression with optional variable assignments
   * @param assign - variable assignments
   * @param mod - optional modulus for evaluation
   * @return EvaluationResult
   *         - number if fully evaluated
   *         - ExprNode if symbolic expression remains
   */
  abstract evaluate(assign?: Record<string, number>, mod?: number): EvaluationResult

  /**
   * Check if expression contains any free variables
   */
  abstract containsVariable(): boolean
  abstract getVariables(): Set<string>

  /**
   * Simplify expression
   * TODO
   */
  abstract simplify(): ExprNode

  abstract clone(): ExprNode

  /**
   * Substitute variables with given assignments
   * @param assignments
   */
  abstract substitute(assignments: Record<string, ExprNode>): ExprNode

  /**
   * Generate a canonical key for the expression
   */
  abstract toCanonicalKey(): string
}

/**
 * Represents a constant numeric value in an expression
 */
export class ConstantNode extends ExprNode {
  public value: number

  constructor(value: number) {
    super()
    this.value = normalizeNumeric(value)
  }

  toString(precision = 4) {
    if (this.value < 0) {
      return `(${formatNumber(this.value, precision)})`
    }
    return formatNumber(this.value, precision)
  }

  toTex(precision = 4) {
    if (this.value < 0) {
      return `\\left(${formatNumberToTex(this.value, precision)}\\right)`
    }
    return formatNumberToTex(this.value, precision)
  }

  evaluate(_assign?: Record<string, number>, mod?: number): EvaluationResult {
    if (mod !== undefined) {
      return this.value % mod
    }
    return this.value
  }

  containsVariable() {
    return false
  }

  simplify() {
    const normalized = normalizeNumeric(this.value)
    if (normalized === this.value) {
      return this
    }
    return new ConstantNode(normalized)
  }

  getVariables(): Set<string> {
    return new Set()
  }

  clone(): ExprNode {
    return new ConstantNode(this.value)
  }

  substitute(): ExprNode {
    return this.clone()
  }

  toCanonicalKey(): string {
    return `C:${formatNumber(this.value)}`
  }
}

/**
 * Represents a variable in an expression, possibly with a multiplier
 * Variables should have a individual name (e.g., "x", "y", "z")
 *
 * The multiplier can also be represented as a ConstantNode multiplied with the variable,
 */
export class VariableNode extends ExprNode {
  public multiplier: number

  constructor(
    public name: string,
    multiplier: number = 1,
  ) {
    super()
    this.multiplier = multiplier
  }

  toString() {
    if (approximatelyEqual(this.multiplier, 1)) {
      return this.name
    }
    if (approximatelyEqual(this.multiplier, -1)) {
      return `(-${this.name})`
    }
    if (this.multiplier < 0) {
      return `(${formatNumber(this.multiplier)}${this.name})`
    }
    return `${formatNumber(this.multiplier)}${this.name}`
  }

  toTex() {
    if (approximatelyEqual(this.multiplier, 1)) {
      return this.name
    }
    if (approximatelyEqual(this.multiplier, -1)) {
      return `\\left(-${this.name}\\right)`
    }
    if (this.multiplier < 0) {
      return `\\left(${formatNumberToTex(this.multiplier)}${this.name}\\right)`
    }
    return `${formatNumberToTex(this.multiplier)}${this.name}`
  }

  evaluate(assign?: Record<string, number>, mod?: number): EvaluationResult {
    if (!assign || !Object.prototype.hasOwnProperty.call(assign, this.name)) {
      return this.clone()
    }
    if (mod !== undefined) {
      const value = assign[this.name] % mod
      return normalizeNumeric((this.multiplier * value) % mod)
    }
    const value = assign[this.name]
    return normalizeNumeric(this.multiplier * value)
  }

  containsVariable() {
    return true
  }

  simplify() {
    if (isApproximatelyZero(this.multiplier)) {
      return new ConstantNode(0)
    }
    const normalized = normalizeNumeric(this.multiplier)
    if (approximatelyEqual(normalized, this.multiplier)) {
      return this
    }
    return new VariableNode(this.name, normalized)
  }

  getVariables(): Set<string> {
    return new Set([this.name])
  }

  clone(): ExprNode {
    return new VariableNode(this.name, this.multiplier)
  }

  substitute(assignments: Record<string, ExprNode>): ExprNode {
    const replacement = assignments[this.name]
    if (!replacement) {
      return this.clone()
    }

    const multiplier = this.multiplier
    const clonedReplacement = replacement.clone()

    if (clonedReplacement instanceof ConstantNode) {
      return new ConstantNode(normalizeNumeric(clonedReplacement.value * multiplier))
    }

    if (approximatelyEqual(multiplier, 1)) {
      return clonedReplacement
    }

    return new BinaryNode("*", new ConstantNode(multiplier), clonedReplacement).simplify()
  }

  toCanonicalKey(): string {
    return `V:${this.name}:${formatNumber(normalizeNumeric(this.multiplier))}`
  }
}

/**
 * Class for unary operations
 * (currently only negation)
 *
 * To extend with:
 * - sqrt
 * - e-function
 */
export class UnaryNode extends ExprNode {
  constructor(
    public op: "-",
    public child: ExprNode,
  ) {
    super()
  }

  toString() {
    if (this.child instanceof ConstantNode || this.child instanceof VariableNode) {
      const childStr = this.child.toString()
      if (childStr.length >= 2 && childStr.startsWith("(") && childStr.endsWith(")")) {
        return `-${childStr}`
      }
      if (childStr.startsWith("-")) {
        return `-(${childStr})`
      }
      return `(-${childStr})`
    }

    const childStr = this.child.toString()
    if (childStr.length >= 2 && childStr.startsWith("(") && childStr.endsWith(")")) {
      return `-${childStr}`
    }
    return `-(${childStr})`
  }

  toTex() {
    if (this.child instanceof ConstantNode || this.child instanceof VariableNode) {
      const childTex = this.child.toTex()
      if (childTex.startsWith("\\left(") && childTex.endsWith("\\right)")) {
        return `-${childTex}`
      }
      if (childTex.startsWith("-")) {
        return `-\\left(${childTex}\\right)`
      }
      return `\\left(-${childTex}\\right)`
    }

    const childTex = this.child.toTex()
    if (childTex.startsWith("\\left(") && childTex.endsWith("\\right)")) {
      return `-${childTex}`
    }
    return `-\\left(${childTex}\\right)`
  }

  evaluate(assign?: Record<string, number>, mod?: number): EvaluationResult {
    const childValue = this.child.evaluate(assign, mod)
    if (typeof childValue === "number") {
      if (mod !== undefined) {
        return normalizeNumeric(-childValue % mod)
      }
      return normalizeNumeric(-childValue)
    }
    return new UnaryNode(this.op, evaluationResultToExpr(childValue)).simplify()
  }

  containsVariable() {
    return this.child.containsVariable()
  }

  simplify(): ExprNode {
    const simplifiedChild = this.child.simplify()

    if (simplifiedChild instanceof UnaryNode && simplifiedChild.op === "-") {
      return simplifiedChild.child
    }

    if (simplifiedChild instanceof ConstantNode) {
      return new ConstantNode(-simplifiedChild.value)
    }

    if (simplifiedChild instanceof VariableNode) {
      return new VariableNode(simplifiedChild.name, -simplifiedChild.multiplier)
    }

    return new UnaryNode(this.op, simplifiedChild)
  }

  getVariables(): Set<string> {
    return this.child.getVariables()
  }

  clone(): ExprNode {
    return new UnaryNode(this.op, this.child.clone())
  }

  substitute(assignments: Record<string, ExprNode>): ExprNode {
    return new UnaryNode(this.op, this.child.substitute(assignments))
  }

  toCanonicalKey(): string {
    return `U:${this.op}:${this.child.toCanonicalKey()}`
  }
}

/**
 * Represents a binary operation between two expressions
 * Currently supported:
 * - Addition (+)
 * - Subtraction (-)
 * - Multiplication (*)
 * - Division (/)
 * - Power (^)
 */
export class BinaryNode extends ExprNode {
  constructor(
    public op: ArithmeticOperator,
    public left: ExprNode,
    public right: ExprNode,
  ) {
    super()
  }

  toString() {
    if (this.op === "/") {
      return `(${this.left.toString()} / ${this.right.toString()})`
    }
    if (this.op === "^") {
      const baseNeedsParens =
        !(this.left instanceof ConstantNode && this.left.value >= 0) &&
        !(this.left instanceof VariableNode && this.left.multiplier >= 0)
      const baseRaw = this.left.toString()
      const baseStr = baseNeedsParens ? ensureWrapped(baseRaw) : baseRaw
      const expStr = this.formatChildForString(this.right, false)
      return `${baseStr} ^ ${expStr}`
    }
    const formattedLeft = this.formatChildForString(this.left, true)
    if (this.op === "+") {
      const signInfo = extractSignAndMagnitude(this.right)
      if (signInfo.sign === -1) {
        const formattedRight = this.formatChildForString(signInfo.magnitude, false)
        return `${formattedLeft} - ${formattedRight}`
      }
    }
    if (this.op === "-") {
      const signInfo = extractSignAndMagnitude(this.right)
      if (signInfo.sign === -1) {
        const formattedRight = this.formatChildForString(signInfo.magnitude, false)
        return `${formattedLeft} + ${formattedRight}`
      }
    }
    const formattedRight = this.formatChildForString(this.right, false)
    return `${formattedLeft} ${this.op} ${formattedRight}`
  }

  private formatChildForString(child: ExprNode, isLeft: boolean): string {
    if (
      child instanceof ConstantNode ||
      child instanceof VariableNode ||
      child instanceof FunctionNode
    ) {
      return child.toString()
    }
    if (child instanceof UnaryNode) {
      return child.toString()
    }

    if (child instanceof BinaryNode) {
      if (this.needsParens(child, isLeft)) {
        return ensureWrapped(child.toString())
      }
      return child.toString()
    }
    return child.toString()
  }

  toTex() {
    if (this.op === "/") {
      return `\\dfrac{${this.left.toTex()}}{${this.right.toTex()}}`
    }
    if (this.op === "^") {
      const baseNeedsParens =
        !(this.left instanceof ConstantNode && this.left.value >= 0) &&
        !(this.left instanceof VariableNode && this.left.multiplier >= 0)
      const baseRaw = this.left.toTex()
      const base = baseNeedsParens ? ensureTexWrapped(baseRaw) : baseRaw
      return `{${base}}^{${this.right.toTex()}}`
    }
    if (this.op === "+") {
      const signInfo = extractSignAndMagnitude(this.right)
      if (signInfo.sign === -1) {
        const magnitude = signInfo.magnitude
        const formattedLeft = this.needsParens(this.left, true)
          ? ensureTexWrapped(this.left.toTex())
          : this.left.toTex()
        const formattedRight = this.needsParens(magnitude, false)
          ? ensureTexWrapped(magnitude.toTex())
          : magnitude.toTex()
        return `${formattedLeft} - ${formattedRight}`
      }
    }
    if (this.op === "-") {
      const signInfo = extractSignAndMagnitude(this.right)
      if (signInfo.sign === -1) {
        const magnitude = signInfo.magnitude
        const formattedLeft = this.needsParens(this.left, true)
          ? ensureTexWrapped(this.left.toTex())
          : this.left.toTex()
        const formattedRight = this.needsParens(magnitude, false)
          ? ensureTexWrapped(magnitude.toTex())
          : magnitude.toTex()
        return `${formattedLeft} + ${formattedRight}`
      }
    }

    const needsParensLeft = this.needsParens(this.left, true)
    const needsParensRight = this.needsParens(this.right, false)

    const L = needsParensLeft ? ensureTexWrapped(this.left.toTex()) : this.left.toTex()
    const R = needsParensRight ? ensureTexWrapped(this.right.toTex()) : this.right.toTex()

    return `${L} ${operatorTex(this.op)} ${R}`
  }

  private needsParens(child: ExprNode, isLeft: boolean): boolean {
    if (!(child instanceof BinaryNode)) return false

    const childPrecedence = this.getPrecedence(child.op)
    const parentPrecedence = this.getPrecedence(this.op)

    if (childPrecedence > parentPrecedence) return false
    if (childPrecedence < parentPrecedence) return true
    if (
      child.op !== this.op &&
      !((child.op === "+" || child.op === "-") && (this.op === "+" || this.op === "-"))
    )
      return true
    if (!isLeft && !this.isAssociative()) return true

    return false
  }

  private getPrecedence(op: ArithmeticOperator): number {
    if (op === "^") return 3
    if (op === "*" || op === "/") return 2
    if (op === "+" || op === "-") return 1
    return 0
  }

  private isAssociative(): boolean {
    return this.op === "+" || this.op === "*"
  }

  evaluate(assign?: Record<string, number>, mod?: number): EvaluationResult {
    const leftValue = this.left.evaluate(assign, mod)
    const rightValue = this.right.evaluate(assign, mod)

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      switch (this.op) {
        case "+":
          if (mod !== undefined) {
            return normalizeNumeric((leftValue + rightValue) % mod)
          }
          return normalizeNumeric(leftValue + rightValue)
        case "-":
          if (mod !== undefined) {
            return normalizeNumeric((leftValue - rightValue) % mod)
          }
          return normalizeNumeric(leftValue - rightValue)
        case "*":
          if (mod !== undefined) {
            return normalizeNumeric((leftValue * rightValue) % mod)
          }
          return normalizeNumeric(leftValue * rightValue)
        case "/":
          if (mod !== undefined) {
            return normalizeNumeric(leftValue / rightValue) % mod
          }
          return normalizeNumeric(leftValue / rightValue)
        case "^":
          if (mod !== undefined) {
            return normalizeNumeric(modPow(leftValue, rightValue, mod))
          }
          return normalizeNumeric(leftValue ** rightValue)
      }
    }

    const leftExpr = evaluationResultToExpr(leftValue)
    const rightExpr = evaluationResultToExpr(rightValue)

    switch (this.op) {
      case "+":
        return new BinaryNode("+", leftExpr, rightExpr).simplify()
      case "-":
        return new BinaryNode("-", leftExpr, rightExpr).simplify()
      case "*":
        return new BinaryNode("*", leftExpr, rightExpr).simplify()
      case "/":
        return new BinaryNode("/", leftExpr, rightExpr).simplify()
      case "^":
        return new BinaryNode("^", leftExpr, rightExpr).simplify()
    }
  }

  containsVariable() {
    return this.left.containsVariable() || this.right.containsVariable()
  }

  simplify(): ExprNode {
    const left = this.left.simplify()
    const right = this.right.simplify()

    switch (this.op) {
      case "+":
        return simplifyAddition(left, right, "+")
      case "-":
        return simplifyAddition(left, right, "-")
      case "*":
        return simplifyMultiplication(left, right)
      case "/":
        return simplifyDivision(left, right)
      case "^":
        return simplifyPower(left, right)
      default:
        return new BinaryNode(this.op, left, right)
    }
  }

  getVariables(): Set<string> {
    const vars = new Set<string>()
    for (const v of this.left.getVariables()) vars.add(v)
    for (const v of this.right.getVariables()) vars.add(v)
    return vars
  }

  clone(): ExprNode {
    return new BinaryNode(this.op, this.left.clone(), this.right.clone())
  }

  substitute(assignments: Record<string, ExprNode>): ExprNode {
    return new BinaryNode(this.op, this.left.substitute(assignments), this.right.substitute(assignments))
  }

  toCanonicalKey(): string {
    const leftKey = this.left.toCanonicalKey()
    const rightKey = this.right.toCanonicalKey()
    if (this.op === "+" || this.op === "*") {
      const ordered = [leftKey, rightKey].sort()
      return `B:${this.op}:${ordered[0]}:${ordered[1]}`
    }
    return `B:${this.op}:${leftKey}:${rightKey}`
  }
}

/**
 * Represents a function call with a name and arguments
 * Currently supported functions are defined in the function registry
 */
export class FunctionNode extends ExprNode {
  constructor(
    public name: string,
    public args: ExprNode[],
  ) {
    super()
    const definition = getFunctionDefinition(name)
    if (definition.arity !== undefined && definition.arity !== args.length) {
      throw new Error(
        `Function '${name}' expects ${definition.arity} arguments but received ${args.length}`,
      )
    }
  }

  toString(): string {
    const definition = getFunctionDefinition(this.name)
    const renderedArgs = this.args.map((arg) => arg.toString())
    if (definition.toString) {
      return definition.toString(renderedArgs)
    }
    return `${this.name}(${renderedArgs.join(", ")})`
  }

  toTex(): string {
    const definition = getFunctionDefinition(this.name)
    const renderedArgs = this.args.map((arg) => arg.toTex())
    if (definition.toTex) {
      return definition.toTex(renderedArgs)
    }
    return `\\operatorname{${this.name}}\\left(${renderedArgs.join(", ")}\\right)`
  }

  evaluate(assign?: Record<string, number>, mod?: number): EvaluationResult {
    const definition = getFunctionDefinition(this.name)
    const evaluatedArgs = this.args.map((arg) => arg.evaluate(assign, mod))
    if (evaluatedArgs.every((arg): arg is number => typeof arg === "number")) {
      const numericArgs = evaluatedArgs.map((value) => normalizeNumeric(value))
      if (mod !== undefined) {
        const modArgs = numericArgs.map((value) => value % mod)
        return normalizeNumeric(definition.evaluate(...modArgs, mod) % mod)
      }
      return normalizeNumeric(definition.evaluate(...numericArgs))
    }

    const exprArgs = evaluatedArgs.map((arg) => evaluationResultToExpr(arg))
    return new FunctionNode(this.name, exprArgs).simplify()
  }

  containsVariable() {
    return this.args.some((arg) => arg.containsVariable())
  }

  simplify(): ExprNode {
    const simplifiedArgs = this.args.map((arg) => arg.simplify())
    if (simplifiedArgs.every((arg): arg is ConstantNode => arg instanceof ConstantNode)) {
      const numericArgs = simplifiedArgs.map((arg) => arg.value)
      const definition = getFunctionDefinition(this.name)
      return new ConstantNode(normalizeNumeric(definition.evaluate(...numericArgs)))
    }
    return new FunctionNode(this.name, simplifiedArgs)
  }

  getVariables(): Set<string> {
    const vars = new Set<string>()
    for (const arg of this.args) {
      for (const variable of arg.getVariables()) {
        vars.add(variable)
      }
    }
    return vars
  }

  clone(): ExprNode {
    return new FunctionNode(
      this.name,
      this.args.map((arg) => arg.clone()),
    )
  }

  substitute(assignments: Record<string, ExprNode>): ExprNode {
    return new FunctionNode(
      this.name,
      this.args.map((arg) => arg.substitute(assignments)),
    )
  }

  toCanonicalKey(): string {
    const argsKey = this.args.map((arg) => arg.toCanonicalKey()).join(",")
    return `F:${this.name}:${argsKey}`
  }
}

/**
 * Collect addition terms from an expression tree
 * Helper function for addition simplification
 * @param node
 * @param sign
 * @param terms
 */
function gatherAdditionTerms(node: ExprNode, sign: 1 | -1, terms: SignedTerm[]): void {
  if (node instanceof BinaryNode) {
    if (node.op === "+") {
      gatherAdditionTerms(node.left, sign, terms)
      gatherAdditionTerms(node.right, sign, terms)
      return
    }
    if (node.op === "-") {
      gatherAdditionTerms(node.left, sign, terms)
      gatherAdditionTerms(node.right, sign === 1 ? -1 : 1, terms)
      return
    }
  }
  terms.push({ node, sign })
}


/**
 * Extract linear term from expression node
 * @param node
 */
function extractLinearTerm(node: ExprNode): { coefficient: number; base: ExprNode | null } {
  if (node instanceof ConstantNode) {
    return { coefficient: node.value, base: null }
  }
  if (node instanceof VariableNode) {
    return { coefficient: node.multiplier, base: new VariableNode(node.name, 1) }
  }
  if (node instanceof UnaryNode && node.op === "-") {
    const childResult = extractLinearTerm(node.child)
    return { coefficient: -childResult.coefficient, base: childResult.base }
  }

  const { constant, factors } = splitProduct(node)
  if (factors.length === 0) {
    return { coefficient: constant, base: null }
  }
  const base = buildProductFromFactors(factors)
  return { coefficient: constant, base }
}

/**
 * Split a product expression into its constant and factor components
 * @param node
 */
function splitProduct(node: ExprNode): { constant: number; factors: ExprNode[] } {
  let constant = 1
  const factors: ExprNode[] = []
  const stack: ExprNode[] = [node]

  while (stack.length > 0) {
    const current = stack.pop() as ExprNode
    if (current instanceof BinaryNode && current.op === "*") {
      stack.push(current.left, current.right)
      continue
    }
    if (current instanceof UnaryNode && current.op === "-") {
      constant *= -1
      stack.push(current.child)
      continue
    }
    if (current instanceof ConstantNode) {
      constant *= current.value
      continue
    }
    if (current instanceof VariableNode) {
      constant *= current.multiplier
      factors.push(new VariableNode(current.name, 1))
      continue
    }
    factors.push(current.clone())
  }

  return { constant: normalizeNumeric(constant), factors }
}

/**
 * Build a product expression from a list of factors
 * @param factors
 */
function buildProductFromFactors(factors: ExprNode[]): ExprNode {
  if (factors.length === 0) {
    return new ConstantNode(1)
  }
  const orderedFactors = factors.map((factor) => factor.clone())
  orderedFactors.sort((a, b) => a.toCanonicalKey().localeCompare(b.toCanonicalKey()))

  let result = orderedFactors[0]
  for (let i = 1; i < orderedFactors.length; i++) {
    result = new BinaryNode("*", result, orderedFactors[i])
  }
  return result
}

function buildProductFromComponents(constant: number, factors: ExprNode[]): ExprNode {
  const normalizedConstant = normalizeNumeric(constant)
  if (isApproximatelyZero(normalizedConstant)) {
    return new ConstantNode(0)
  }

  const filteredFactors: ExprNode[] = []
  let accumulatedConstant = normalizedConstant

  for (const factor of factors) {
    if (factor instanceof ConstantNode) {
      accumulatedConstant = normalizeNumeric(accumulatedConstant * factor.value)
    } else if (factor instanceof VariableNode && approximatelyEqual(factor.multiplier, 1)) {
      filteredFactors.push(factor.clone())
    } else if (factor instanceof VariableNode) {
      accumulatedConstant = normalizeNumeric(accumulatedConstant * factor.multiplier)
      filteredFactors.push(new VariableNode(factor.name, 1))
    } else {
      filteredFactors.push(factor.clone())
    }
  }

  if (filteredFactors.length === 0) {
    return new ConstantNode(accumulatedConstant)
  }

  // Convert to UnaryNode if constant is -1
  const product = buildProductFromFactors(filteredFactors)
  if (approximatelyEqual(accumulatedConstant, 1)) {
    return product
  }
  if (approximatelyEqual(accumulatedConstant, -1)) {
    return new UnaryNode("-", product).simplify()
  }

  // If possible, combine constant with single variable factor
  if (filteredFactors.length === 1 && filteredFactors[0] instanceof VariableNode) {
    return applyCoefficientToBase(filteredFactors[0], accumulatedConstant)
  }

  // Avoid calling simplify() here to prevent infinite recursion when the
  // multiplication normalizer feeds back into buildProductFromComponents.
  return new BinaryNode("*", new ConstantNode(accumulatedConstant), product)
}

/**
 * Applies a coefficient to the base of a expression
 * @param base
 * @param coefficient
 */
function applyCoefficientToBase(base: ExprNode, coefficient: number): ExprNode {
  const normalized = normalizeNumeric(coefficient)
  if (isApproximatelyZero(normalized)) {
    return new ConstantNode(0)
  }
  if (base instanceof ConstantNode) {
    return new ConstantNode(normalizeNumeric(base.value * normalized))
  }
  if (base instanceof VariableNode) {
    return new VariableNode(base.name, normalizeNumeric(base.multiplier * normalized))
  }
  return buildProductFromComponents(normalized, [base])
}

function combineAdditionTerms(terms: SignedTerm[]): ExprNode {
  let constantSum = 0
  const buckets = new Map<string, { base: ExprNode; coefficient: number }>()

  for (const { node, sign } of terms) {
    const simplified = node.simplify()
    const { coefficient, base } = extractLinearTerm(simplified)
    const signedCoefficient = normalizeNumeric(coefficient * sign)
    if (base === null) {
      constantSum += signedCoefficient
    } else {
      const key = base.toCanonicalKey()
      const bucket = buckets.get(key)
      if (bucket) {
        bucket.coefficient = normalizeNumeric(bucket.coefficient + signedCoefficient)
      } else {
        buckets.set(key, { base: base.clone(), coefficient: signedCoefficient })
      }
    }
  }

  const resultTerms: ExprNode[] = []
  const normalizedConstant = normalizeNumeric(constantSum)
  if (!isApproximatelyZero(normalizedConstant)) {
    resultTerms.push(new ConstantNode(normalizedConstant))
  }

  const entries = Array.from(buckets.values())
    .map(({ base, coefficient }) => ({ base, coefficient: normalizeNumeric(coefficient) }))
    .filter(({ coefficient }) => !isApproximatelyZero(coefficient))
    .sort((a, b) => a.base.toCanonicalKey().localeCompare(b.base.toCanonicalKey()))

  for (const { base, coefficient } of entries) {
    resultTerms.push(applyCoefficientToBase(base, coefficient))
  }

  if (resultTerms.length === 0) {
    return new ConstantNode(0)
  }

  return buildAdditionChain(resultTerms)
}

function buildAdditionChain(terms: ExprNode[]): ExprNode {
  if (terms.length === 1) {
    return terms[0]
  }

  let result = terms[0]
  for (let i = 1; i < terms.length; i++) {
    const term = terms[i]
    const { sign, magnitude } = extractSignAndMagnitude(term)
    if (sign === -1) {
      result = new BinaryNode("-", result, magnitude)
    } else {
      result = new BinaryNode("+", result, magnitude)
    }
  }
  return result
}

function extractSignAndMagnitude(node: ExprNode): { sign: 1 | -1; magnitude: ExprNode } {
  if (node instanceof ConstantNode) {
    if (node.value < 0) {
      return { sign: -1, magnitude: new ConstantNode(-node.value) }
    }
    return { sign: 1, magnitude: node }
  }
  if (node instanceof VariableNode) {
    if (node.multiplier < 0) {
      return { sign: -1, magnitude: new VariableNode(node.name, -node.multiplier) }
    }
    return { sign: 1, magnitude: node }
  }
  if (node instanceof UnaryNode && node.op === "-") {
    return { sign: -1, magnitude: node.child }
  }
  if (node instanceof BinaryNode && node.op === "*") {
    if (node.left instanceof ConstantNode && node.left.value < 0) {
      const magnitude = new BinaryNode(
        "*",
        new ConstantNode(-node.left.value),
        node.right.clone(),
      ).simplify()
      return { sign: -1, magnitude }
    }
    if (node.right instanceof ConstantNode && node.right.value < 0) {
      const magnitude = new BinaryNode(
        "*",
        node.left.clone(),
        new ConstantNode(-node.right.value),
      ).simplify()
      return { sign: -1, magnitude }
    }
  }
  return { sign: 1, magnitude: node }
}

function simplifyAddition(left: ExprNode, right: ExprNode, op: "+" | "-"): ExprNode {
  const terms: SignedTerm[] = []
  gatherAdditionTerms(left, 1, terms)
  gatherAdditionTerms(right, op === "+" ? 1 : -1, terms)
  return combineAdditionTerms(terms)
}

function simplifyMultiplication(left: ExprNode, right: ExprNode): ExprNode {
  const leftParts = splitProduct(left)
  const rightParts = splitProduct(right)
  const combinedConstant = normalizeNumeric(leftParts.constant * rightParts.constant)
  const combinedFactors = [...leftParts.factors, ...rightParts.factors]
  return buildProductFromComponents(combinedConstant, combinedFactors)
}

function simplifyDivision(left: ExprNode, right: ExprNode): ExprNode {
  if (right instanceof ConstantNode) {
    if (isApproximatelyZero(right.value)) {
      throw new Error("Division by zero")
    }
    const parts = splitProduct(left)
    const newConstant = normalizeNumeric(parts.constant / right.value)
    return buildProductFromComponents(newConstant, parts.factors)
  }

  if (left instanceof ConstantNode && isApproximatelyZero(left.value)) {
    return new ConstantNode(0)
  }

  if (left.toCanonicalKey() === right.toCanonicalKey()) {
    return new ConstantNode(1)
  }

  if (right instanceof ConstantNode && approximatelyEqual(right.value, 1)) {
    return left
  }

  const newNode = new BinaryNode("/", left, right)
  return newNode
}

function simplifyPower(left: ExprNode, right: ExprNode): ExprNode {
  if (right instanceof ConstantNode) {
    if (approximatelyEqual(right.value, 0)) {
      if (left instanceof ConstantNode && approximatelyEqual(left.value, 0)) {
        return new ConstantNode(1)
      }
      return new ConstantNode(1)
    }
    if (approximatelyEqual(right.value, 1)) {
      return left
    }
  }

  if (left instanceof ConstantNode && right instanceof ConstantNode) {
    return new ConstantNode(normalizeNumeric(left.value ** right.value))
  }

  if (left instanceof ConstantNode && approximatelyEqual(left.value, 0)) {
    return new ConstantNode(0)
  }

  return new BinaryNode("^", left, right)
}

export function evaluateExpression(
  expr: ExprNode,
  assignments: SymbolicAssignments = {},
  options: EvaluateOptions = {},
): ExprNode {
  const preparedAssignments: Record<string, ExprNode> = {}
  for (const [name, value] of Object.entries(assignments)) {
    if (typeof value === "number") {
      preparedAssignments[name] = new ConstantNode(value)
    } else {
      preparedAssignments[name] = value.clone()
    }
  }

  const substituted = expr.substitute(preparedAssignments)
  if (options.simplify === false) {
    return substituted
  }
  return substituted.simplify()
}

