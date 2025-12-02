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
  arity?: number
}

export interface Fraction {
  numerator: number
  denominator: number
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

const NUMERIC_EPSILON = 1e-7
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
export function normalizeNumeric(value: number, precision = 8): number {
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

function fractionFromDecimal(value: number, precision = 8): Fraction {
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

function fractionToString(fraction: Fraction): string {
  const { numerator, denominator } = fraction
  if (denominator === 1) {
    return numerator.toString()
  }
  if (numerator === 0) {
    return "0"
  }
  const sign = numerator < 0 ? "-" : ""
  const absoluteNumerator = Math.abs(numerator)
  return `${sign}\\dfrac{${absoluteNumerator}}{${denominator}}`
}

/**
 * Format to Tex
 * @param value
 * @param precision
 */
function formatNumberToTex(value: number, precision = 8): string {
  return formatNumberInternal(value, precision)
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
 */
function formatNumberInternal(value: number, precision = 8): string {
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

  return fractionToString(fraction)
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
 *
 * Does not provide toString method, use toTex instead
 */
export abstract class ExprNode {
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

  toTex(precision = 8) {
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
    // Todo just a placeholder for now
    return this
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

  toTex() {
    if (approximatelyEqual(this.multiplier, 1)) {
      return this.name
    }
    if (approximatelyEqual(this.multiplier, -1)) {
      return `-${this.name}`
    }
    if (this.multiplier < 0) {
      return `${formatNumberToTex(this.multiplier)}${this.name}`
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
    // If multiplier is zero, return constant zero
    if (isApproximatelyZero(this.multiplier)) {
      return new ConstantNode(0)
    }
    // Otherwise, normalize multiplier using the standard precision
    return new VariableNode(this.name, normalizeNumeric(this.multiplier))
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

  toTex() {
    const childTex = this.child.toTex()
    const requiresGrouping = this.childRequiresGrouping(childTex)
    if (!requiresGrouping) {
      return `-${childTex}`
    }
    if (childTex.startsWith("\\left(") && childTex.endsWith("\\right)")) {
      return `-${childTex}`
    }
    return `-\\left(${childTex}\\right)`
  }

  private childRequiresGrouping(childTex: string): boolean {
    if (this.child instanceof BinaryNode) {
      if (this.child.op === "+" || this.child.op === "-") {
        return true
      }
      if (this.child.op === "*") {
        return childTex.startsWith("-")
      }
      return false
    }
    if (this.child instanceof UnaryNode) {
      return true
    }
    if (this.child instanceof ConstantNode) {
      return this.child.value < 0
    }
    if (this.child instanceof VariableNode) {
      return this.child.multiplier < 0
    }
    if (childTex.startsWith("-")) {
      return true
    }
    return false
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
    // Todo just a placeholder for now
    return this
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

  toTex() {
    if (this.op === "/") {
      return `\\dfrac{${this.left.toTex()}}{${this.right.toTex()}}`
    }
    if (this.op === "^") {
      const base = this.formatPowerBase(this.left)
      const exponent = this.formatPowerExponent(this.right)
      return `${base}^{${exponent}}`
    }
    if (this.op === "+") {
      const L = this.formatAdditiveChild(this.left, true)
      const R = this.formatAdditiveChild(this.right, false)
      return `${L} + ${R}`
    }
    if (this.op === "-") {
      const L = this.formatAdditiveChild(this.left, true)
      const R = this.formatAdditiveChild(this.right, false)
      return `${L} - ${R}`
    }
    if (this.op === "*") {
      return this.formatProductTex()
    }

    const L = this.formatMultiplicativeChild(this.left, true)
    const R = this.formatMultiplicativeChild(this.right, false)

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

  private formatAdditiveChild(child: ExprNode, isLeft: boolean): string {
    if (child instanceof BinaryNode && child.op === "*") {
      const wrapLeadingNegative = this.shouldWrapMultiplicationLeadingFactor(child, isLeft)
      if (wrapLeadingNegative) {
        return child.formatProductTex(true)
      }
    }
    const tex = child.toTex()
    if (this.op === "+" && child instanceof BinaryNode && child.op === "-") {
      const firstSeparator = tex.indexOf(" - ")
      if (firstSeparator > 0) {
        const first = tex.slice(0, firstSeparator)
        if (!first.startsWith("\\left(") && first.trim().startsWith("-")) {
          const wrappedFirst = ensureTexWrapped(first)
          return `${wrappedFirst}${tex.slice(firstSeparator)}`
        }
      }
    }
    if (child instanceof BinaryNode && this.needsParens(child, isLeft)) {
      return ensureTexWrapped(tex)
    }
    if (this.op === "+" && this.isNegativeLiteral(child)) {
      const wrapLeftConstant = isLeft && child instanceof ConstantNode
      if (!isLeft || wrapLeftConstant) {
        return ensureTexWrapped(tex)
      }
    }
    if (this.op === "-" && !isLeft && this.isNegativeLiteral(child)) {
      return ensureTexWrapped(tex)
    }
    return tex
  }

  private formatMultiplicativeChild(child: ExprNode, isLeft: boolean): string {
    const tex = child.toTex()
    if (child instanceof BinaryNode && child.op === "/") {
      return tex
    }
    if (child instanceof BinaryNode && this.needsParens(child, isLeft)) {
      return ensureTexWrapped(tex)
    }
    if (!isLeft && this.isNegativeLiteral(child)) {
      return ensureTexWrapped(tex)
    }
    return tex
  }

  private formatPowerBase(child: ExprNode): string {
    const tex = child.toTex()
    if (child instanceof ConstantNode && child.value >= 0) {
      return tex
    }
    if (child instanceof VariableNode && child.multiplier >= 0) {
      return tex
    }
    if (child instanceof FunctionNode) {
      return tex
    }
    return ensureTexWrapped(tex)
  }

  private formatPowerExponent(child: ExprNode): string {
    return child.toTex()
  }

  private isNegativeLiteral(node: ExprNode): boolean {
    if (node instanceof ConstantNode) {
      return node.value < 0
    }
    if (node instanceof VariableNode) {
      return node.multiplier < 0
    }
    return node instanceof UnaryNode && node.op === "-"
  }

  private isNumericLiteral(node: ExprNode): boolean {
    if (node instanceof ConstantNode) {
      return true
    }
    if (node instanceof VariableNode) {
      return /^\d+$/.test(node.name)
    }
    if (node instanceof UnaryNode && node.op === "-") {
      return this.isNumericLiteral(node.child)
    }
    return false
  }

  private isSimpleSymbol(node: ExprNode): boolean {
    if (node instanceof VariableNode) {
      return /^[a-zA-Z]+$/.test(node.name) && approximatelyEqual(node.multiplier, 1)
    }
    return false
  }

  private formatProductTex(forceWrapFirstNegative = false): string {
    const factors: ExprNode[] = []
    this.collectMultiplicativeFactors(this, factors)
    if (factors.length === 0) {
      return "1"
    }

    const pieces: string[] = []
    for (let i = 0; i < factors.length; i++) {
      const current = factors[i]
      const next = factors[i + 1]

      if (next && !(forceWrapFirstNegative && i === 0)) {
        const concatenated =
          this.tryConcatenateNumericWithSymbol(current, next) ??
          this.tryConcatenateSymbolPair(current, next)
        if (concatenated) {
          pieces.push(concatenated)
          i += 1
          continue
        }
      }

      let formatted = this.formatMultiplicativeFactor(current, pieces.length === 0)
      if (forceWrapFirstNegative && i === 0 && this.factorLooksNegative(current, formatted)) {
        formatted = ensureTexWrapped(formatted)
      }
      pieces.push(formatted)
    }

    return pieces.join(" \\cdot ")
  }

  private collectMultiplicativeFactors(node: ExprNode, result: ExprNode[]): void {
    if (node instanceof BinaryNode && node.op === "*") {
      this.collectMultiplicativeFactors(node.left, result)
      this.collectMultiplicativeFactors(node.right, result)
      return
    }
    result.push(node)
  }

  private formatMultiplicativeFactor(child: ExprNode, isFirst: boolean): string {
    return this.formatMultiplicativeChild(child, isFirst)
  }

  private tryConcatenateNumericWithSymbol(
    numericCandidate: ExprNode,
    symbolCandidate: ExprNode,
  ): string | null {
    if (!this.isNumericLiteral(numericCandidate)) {
      return null
    }
    if (!this.isSimpleSymbol(symbolCandidate)) {
      return null
    }

    const numericTex = this.renderNumericLiteralTex(numericCandidate)
    const symbolTex = (symbolCandidate as VariableNode).toTex()

    if (numericTex === "1") {
      return symbolTex
    }
    if (numericTex === "-1") {
      return null
    }
    return `${numericTex}${symbolTex}`
  }

  private tryConcatenateSymbolPair(first: ExprNode, second: ExprNode): string | null {
    if (!this.isSimpleSymbol(first) || !this.isSimpleSymbol(second)) {
      return null
    }
    if (this.isNegativeLiteral(first) || this.isNegativeLiteral(second)) {
      return null
    }
    const firstTex = (first as VariableNode).toTex()
    const secondTex = (second as VariableNode).toTex()
    return `${firstTex}${secondTex}`
  }

  private factorLooksNegative(node: ExprNode, rendered: string): boolean {
    if (this.isNegativeLiteral(node)) {
      return true
    }
    return rendered.startsWith("-")
  }

  private shouldWrapMultiplicationLeadingFactor(child: BinaryNode, isLeft: boolean): boolean {
    if (child.op !== "*") {
      return false
    }
    if (!child.multiplicationStartsWithNegativeFactor()) {
      return false
    }
    if (this.op === "+" && !isLeft) {
      return true
    }
    if (this.op === "-" && !isLeft) {
      return true
    }
    return false
  }

  private multiplicationStartsWithNegativeFactor(): boolean {
    if (this.op !== "*") {
      return false
    }
    const factors: ExprNode[] = []
    this.collectMultiplicativeFactors(this, factors)
    if (factors.length === 0) {
      return false
    }
    return this.isNegativeLiteral(factors[0])
  }

  private renderNumericLiteralTex(node: ExprNode): string {
    if (node instanceof ConstantNode) {
      return node.toTex()
    }
    if (node instanceof VariableNode) {
      return node.toTex()
    }
    if (node instanceof UnaryNode && node.op === "-") {
      const inner = this.renderNumericLiteralTex(node.child)
      return `-${inner}`
    }
    return node.toTex()
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
    // Todo just a placeholder for now
    return this
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
    // Todo just a placeholder for now
    return this
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
  orderedFactors.sort((a, b) => {
    const ka = a.toTex()
    const kb = b.toTex()
    const cmp = ka.localeCompare(kb)
    if (cmp !== 0) return cmp
    // tie-breaker: constructor name ensures deterministic ordering for same TeX
    return a.constructor.name.localeCompare(b.constructor.name)
  })

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
  const product = buildNormalizedProductFromFactors(filteredFactors)
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

function buildNormalizedProductFromFactors(factors: ExprNode[]): ExprNode {
  if (factors.length === 0) {
    return new ConstantNode(1)
  }

  const varExponentMap = new Map<string, number>()
  const varNodes = new Map<string, VariableNode>()
  const otherFactors: ExprNode[] = []

  for (const factor of factors) {
    if (factor instanceof VariableNode && approximatelyEqual(factor.multiplier, 1)) {
      const key = factor.name
      varNodes.set(key, factor.clone() as VariableNode)
      varExponentMap.set(key, (varExponentMap.get(key) || 0) + 1)
      continue
    }
    if (
      factor instanceof BinaryNode &&
      factor.op === "^" &&
      factor.left instanceof VariableNode &&
      approximatelyEqual(factor.left.multiplier, 1) &&
      factor.right instanceof ConstantNode
    ) {
      const key = factor.left.name
      varNodes.set(key, factor.left.clone() as VariableNode)
      varExponentMap.set(key, (varExponentMap.get(key) || 0) + factor.right.value)
      continue
    }
    otherFactors.push(factor.clone())
  }

  const normalizedFactors: ExprNode[] = [...otherFactors]
  for (const [name, exponent] of varExponentMap.entries()) {
    const normalizedExp = normalizeNumeric(exponent)
    const baseNode = varNodes.get(name) ?? new VariableNode(name)
    if (approximatelyEqual(normalizedExp, 1)) {
      normalizedFactors.push(new VariableNode(baseNode.name, 1))
    } else {
      normalizedFactors.push(
        new BinaryNode("^", new VariableNode(baseNode.name, 1), new ConstantNode(normalizedExp)),
      )
    }
  }

  if (normalizedFactors.length === 0) {
    return new ConstantNode(1)
  }

  return buildProductFromFactors(normalizedFactors)
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
