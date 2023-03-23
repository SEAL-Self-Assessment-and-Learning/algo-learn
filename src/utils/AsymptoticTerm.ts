import Fraction from "fraction.js"
import random from "random"
import shuffleArray from "./shuffle"

import math, {
  baseOfLog,
  exponentToLatex,
  exponentToText,
  log2Fraction,
} from "../utils/math"

/**
 * Represents an iterated logarithm term, such as (log(log(n)))^3. It is
 * normalized in that the logarithms do not have a base.
 *
 * Note that polynomials n^e are represented as iterated logarithms with
 * iteration number i=0.
 */
export class IteratedLogarithms extends Map<number, Fraction> {
  /** Get the exponent e of the iterated logarithm term (log^{(i)}(x))^e. */
  get(i: number): Fraction {
    return super.get(i) ?? new Fraction(0)
  }
}

export type Unbounded = "infty" | "-infty"
/**
 * Represents a product term of functions, such as c * n^2 * log(n)^3. A product
 * term is a multiplication of several factors, where each factor is a term that
 * can be a coefficient, a polynomial, an iterated logarithm, or an
 * exponential.
 *
 * @typedef {Object} ProductTerm
 * @property {Fraction} coefficient - The coefficient of the term.
 * @property {Map<number, Fraction>} logarithmExponents - A map from the number
 *   of times the logarithm function is iterated to the exponent of the term.
 *   For example, if the term is c * n^2 * log(n)^3 * log(log(n))^4 * 5^n, then
 *   the map would be {0: 2, 1: 3, 2: 4}.
 * @property {Fraction} exponentialBase - The base of the exponential term. For
 *   example, if the term is c * n^2 * log(n)^3 * log(log(n))^4 * 5^n, then the
 *   base would be 5.
 */
export class ProductTerm {
  coefficient: Fraction
  logarithmExponents: IteratedLogarithms
  exponentialBase: Fraction

  /**
   * Create a ProductTerm.
   *
   * @param props
   * @param props.coefficient - The coefficient of the term
   * @param props.logarithmExponents - The logarithm exponents
   * @param props.logexponent - The exponent of the logarithm
   * @param props.polyexponent - The exponent of the polynomial term
   * @param props.exponentialBase - The base of the exponential term
   */
  constructor({
    coefficient = 1,
    logarithmExponents = new IteratedLogarithms(),
    exponentialBase = 1,
  }: {
    coefficient?: number | Fraction
    logarithmExponents?: IteratedLogarithms
    exponentialBase?: number | Fraction
  } = {}) {
    this.coefficient = new Fraction(coefficient)
    this.logarithmExponents = logarithmExponents
    this.exponentialBase = new Fraction(exponentialBase)
  }

  /**
   * Returns the representation of the term as a string (can be parsed by
   * math.js)
   *
   * @param variable - The variable to use in the string representation
   * @returns {string} String representation of the term, slightly simplified.
   */
  toString(variable: string = "x"): string {
    const vartex = variable.length === 1 ? variable : `(${variable})`
    const factors = []
    if (this.coefficient.compare(1) !== 0) {
      factors.push(this.coefficient.toFraction())
    }
    for (const i of Array.from(this.logarithmExponents.keys()).sort()) {
      const e = this.logarithmExponents.get(i)
      if (e === undefined) throw new Error("impossible")
      if (e.equals(0)) {
        continue
      }
      let out = ""
      for (let j = 0; j < i; j++) {
        out += "log("
      }
      out += vartex
      for (let j = 0; j < i; j++) {
        out += ")"
      }
      out += exponentToText(e)
      factors.push(out)
    }
    if (!this.exponentialBase.equals(1)) {
      if (this.exponentialBase.d === 1) {
        factors.push(`${this.exponentialBase.n}^${vartex}`)
      } else {
        factors.push(`(${this.exponentialBase.toFraction()})^${vartex}`)
      }
    }
    if (factors.length === 0) {
      return "1"
    } else {
      return factors.join(" * ")
    }
  }

  /**
   * Returns the math.js representation of the term.
   *
   * @param {string} variable - The variable to use.
   * @returns {string} The latex representation of the term.
   */
  toMathNode(variable: string): math.MathNode {
    return math.parse(this.toString(variable))
  }

  /**
   * Returns the latex representation of the term.
   *
   * @param {string} variable - The variable to use.
   * @returns {string} The latex representation of the term.
   */
  toLatex(variable: string): string {
    // const vartex = variable.length === 1 ? variable : `{${variable}}`
    const numerator = []
    const denominator = []
    if (this.coefficient.compare(1) !== 0) {
      numerator.push(this.coefficient.toFraction())
    }
    for (const i of Array.from(this.logarithmExponents.keys()).sort()) {
      const e = this.logarithmExponents.get(i)
      if (e === undefined) throw new Error("impossible")
      if (e.equals(0)) {
        continue
      }
      let out = ""
      for (let j = 0; j < i; j++) {
        out += "log("
      }
      out += `{${variable}}`
      for (let j = 0; j < i; j++) {
        out += ")"
      }
      if (e.compare(0) > 0) {
        out += exponentToText(e)
        numerator.push(out)
      } else {
        out += exponentToText(e.neg())
        denominator.push(out)
      }
    }

    if (!this.exponentialBase.equals(1)) {
      if (this.exponentialBase.d === 1) {
        numerator.push(`${this.exponentialBase.n}^{${variable}}`)
      } else if (this.exponentialBase.n === 1) {
        denominator.push(`${this.exponentialBase.d}^{${variable}}`)
      } else {
        numerator.push(`(${this.exponentialBase.toFraction()})^{${variable}}`)
      }
    }

    if (numerator.length === 0) {
      numerator.push("1")
    }
    if (denominator.length === 0) {
      return numerator.join(" \\cdot ")
    } else if (denominator.length === 1) {
      return numerator.join(" \\cdot ") + " / " + denominator[0]
    } else {
      return (
        numerator.join(" \\cdot ") +
        " / \\Big(" +
        denominator.join(" \\cdot ") +
        "\\Big)"
      )
    }
  }

  /**
   * Check if the product term is a constant.
   *
   * @returns {boolean} - If not null, the constant represented by the term.
   */
  isConstant(): boolean {
    if (this.coefficient.equals(0)) return true
    if (!this.exponentialBase.equals(1)) return false
    for (const [, e] of this.logarithmExponents) {
      if (!e.equals(0)) return false
    }
    return true
  }

  /**
   * Check if the product term is unbounded.
   *
   * @returns {boolean} - True if the product term is unbounded, false
   *   otherwise.
   */
  isUnbounded(): boolean {
    if (this.exponentialBase.compare(1) > 0) return true
    if (this.exponentialBase.compare(1) < 0) return false
    for (const [, e] of this.logarithmExponents) {
      if (e.compare(0) > 0) {
        return true
      } else if (e.compare(0) < 0) {
        return false
      }
    }
    return false
  }

  /**
   * Compute the limit of a as the variable approaches infinity.
   *
   * @returns {Fraction} The limit of the product term.
   */
  limit(): Fraction | Unbounded {
    if (this.isConstant()) return this.coefficient
    if (this.isUnbounded())
      return this.coefficient.compare(0) > 0 ? "infty" : "-infty"
    else return new Fraction(0)
  }

  /**
   * Compute the absolute value of a product term.
   *
   * @returns {ProductTerm} The absolute value of the product term.
   */
  abs(): ProductTerm {
    return new ProductTerm({
      coefficient: this.coefficient.abs(),
      logarithmExponents: this.logarithmExponents,
      exponentialBase: this.exponentialBase,
    })
  }

  /**
   * Compute the negation of a product term.
   *
   * @returns {ProductTerm} The negation of the product term.
   */
  neg(): ProductTerm {
    return new ProductTerm({
      coefficient: this.coefficient.neg(),
      logarithmExponents: this.logarithmExponents,
      exponentialBase: this.exponentialBase,
    })
  }

  /**
   * Compute the multiplicative inverse of a product term.
   *
   * @returns {ProductTerm} The multiplicative inverse of the product term.
   */
  inv(): ProductTerm {
    return new ProductTerm({
      coefficient: this.coefficient.inverse(),
      logarithmExponents: new IteratedLogarithms(
        usedIterationNumbers([this]).map((i) => [
          i,
          this.logarithmExponents.get(i).neg(),
        ])
      ),
      exponentialBase: this.exponentialBase.inverse(),
    })
  }

  /**
   * Add two product terms. (Note that this only preserves the asymptotic
   * behaviour.)
   *
   * @param {ProductTerm} t - The second product term.
   * @returns {ProductTerm} The sum of the two product terms.
   */
  add(t: ProductTerm): ProductTerm {
    if (!this.abs().Theta(t.abs())) {
      throw new Error(
        "Cannot add ProductTerms with different asymptotic behaviour!"
      )
    }
    return new ProductTerm({
      coefficient: this.coefficient.add(t.coefficient),
      logarithmExponents: this.logarithmExponents,
      exponentialBase: this.exponentialBase,
    })
    // let cmp
    // if (this.coefficient.compare(0) > 0 && t.coefficient.compare(0) < 0) {
    //   cmp = this.compare(t.neg())
    // } else if (
    //   this.coefficient.compare(0) < 0 &&
    //   t.coefficient.compare(0) > 0
    // ) {
    //   cmp = -this.compare(t.neg())
    // } else if (this.coefficient.compare(0) > 0) {
    //   cmp = this.compare(t)
    // } else {
    //   cmp = -this.compare(t)
    // }
    // if (cmp === 0) {
    //   return new ProductTerm({
    //     coefficient: this.coefficient.add(t.coefficient),
    //     logarithmExponents: this.logarithmExponents,
    //     exponentialBase: this.exponentialBase,
    //   })
    // } else if (cmp > 0) {
    //   return this
    // } else {
    //   return t
    // }
  }

  /**
   * Subtract another product term from this one. (Note that this only preserves
   * the asymptotic behaviour.)
   *
   * @param {ProductTerm} t - The second product term.
   * @returns {ProductTerm} The difference of the two product terms.
   */
  sub(t: ProductTerm): ProductTerm {
    return this.add(t.neg())
  }

  /**
   * Multiply this product term with another one.
   *
   * @param {ProductTerm} t - The second product term.
   * @returns {ProductTerm} The product of the two product terms.
   */
  mul(t: ProductTerm): ProductTerm {
    return new ProductTerm({
      coefficient: this.coefficient.mul(t.coefficient),
      logarithmExponents: new IteratedLogarithms(
        usedIterationNumbers([this, t]).map((i) => [
          i,
          this.logarithmExponents.get(i).add(t.logarithmExponents.get(i)),
        ])
      ),
      exponentialBase: this.exponentialBase.mul(t.exponentialBase),
    })
  }

  /**
   * Divide this product term by another one.
   *
   * @param {ProductTerm} t - The second product term.
   * @returns {ProductTerm} The quotient of the two product terms.
   */
  div(t: ProductTerm): ProductTerm {
    return this.mul(t.inv())
  }

  /**
   * Compare two product terms by computing the product term a/b and then the
   * limit of this ratio.
   *
   * @param {ProductTerm} t - The second product term.
   * @param {boolean} strict - If true, equality holds only if the limit is 1.
   * @returns {number} Negative if a << b, 0 if a ~~ b, and positive if a >> b.
   */
  compare(t: ProductTerm, strict: boolean = false): number {
    if (
      t.coefficient.equals(0) ||
      this.coefficient.compare(0) * t.coefficient.compare(0) < 0
    ) {
      return this.coefficient.compare(0)
    }
    if (this.coefficient.equals(0)) {
      return -t.coefficient.compare(0)
    }
    // Now both a.coefficient and b.coefficient are non-zero and have the same sign.
    const sign = this.coefficient.compare(0) > 0 ? 1 : -1
    const lim = this.mul(t.inv()).limit()
    if (lim === "infty") return sign
    else if (lim === "-infty") return -sign
    if (strict) return sign * lim.compare(1)
    else if (lim.equals(0)) return -sign
    else return 0
  }

  /** Landau-Oh */
  Oh(t: ProductTerm): boolean {
    return this.compare(t) <= 0
  }

  /** Landau-oh */
  oh(t: ProductTerm): boolean {
    return this.compare(t) < 0
  }

  /** Landau-Omega */
  Omega(t: ProductTerm): boolean {
    return this.compare(t) >= 0
  }

  /** Landau-omega */
  omega(t: ProductTerm): boolean {
    return this.compare(t) > 0
  }

  /** Landau-Theta */
  Theta(t: ProductTerm): boolean {
    return this.compare(t) === 0
  }

  /** Tilde notation (Sedgewick-Wayne) */
  tilde(t: ProductTerm): boolean {
    return this.compare(t, true) === 0
  }

  /**
   * Return true if the product term is of the form c * log(x).
   *
   * @returns {boolean} True if the given product term is of the form c *
   *   log(x).
   */
  isLogarithmic(): boolean {
    if (this.coefficient.equals(0)) return true
    if (this.exponentialBase.compare(1) !== 0) return false
    for (const [i, e] of this.logarithmExponents) {
      if (!(i === 1 && e.equals(1))) return false
    }
    return true
  }

  /**
   * Return true if the product term is of the form c * x.
   *
   * @returns {boolean} True if the given product term is of the form c * x.
   */
  isLinear(): boolean {
    if (this.coefficient.equals(0)) return true
    if (this.exponentialBase.compare(1) !== 0) return false
    for (const [i, e] of this.logarithmExponents) {
      if (!(i === 0 && e.equals(1))) return false
    }
    return true
  }

  /**
   * Return the power of a given ProductTerm.
   *
   * @param exponent The exponent
   * @returns The power of t to the exponent
   */
  pow(exponent: ProductTerm): ProductTerm {
    const b = this.coefficient
    const e = exponent.coefficient
    if (exponent.isConstant()) {
      return new ProductTerm({
        coefficient: b.pow(e),
        logarithmExponents: new IteratedLogarithms(
          usedIterationNumbers([this]).map((i) => [
            i,
            this.logarithmExponents.get(i).mul(e),
          ])
        ),
        exponentialBase: this.exponentialBase.pow(e),
      })
    } else if (exponent.isLogarithmic() && this.isConstant()) {
      // b^(e log(x))= 2^(log(b) e log(x)) = x^(e log(b))
      return createProductTerm({
        polyexponent: e.mul(log2Fraction(b.valueOf())),
      })
    } else if (exponent.isLinear() && this.isConstant()) {
      // b^(ex) = (b^e)^x
      return createProductTerm({
        exponentialBase: b.pow(e),
      })
    }
    throw new TooComplex(
      this,
      `taking ${this.toString()} to the power of ${exponent.toString()} is not implemented yet.`
    )
  }

  /**
   * Compute the logarithm of a given ProductTerm. Note that the logarithm of a
   * product term is a SumProductTerm.
   *
   * @param base The base of the logarithm
   * @returns The logarithm of t in base base, or undefined if t <= 0
   */
  log(base = 2): SumProductTerm {
    if (this.coefficient.compare(0) <= 0)
      throw new Error("logarithm is only defined for positive terms")
    const newTerms: ProductTerm[] = []

    // logarithm of the coefficient
    newTerms.push(
      createProductTerm({
        coefficient: math.log(this.coefficient.valueOf(), base),
      })
    )

    // logarithm of each iterated-log factor
    // (Note that log((log^(i)(n))^e) = e * log^(i+1)(n) holds)
    for (const [i, e] of this.logarithmExponents) {
      newTerms.push(
        new ProductTerm({
          coefficient: e,
          logarithmExponents: new IteratedLogarithms([
            [i + 1, new Fraction(1)],
          ]),
          exponentialBase: new Fraction(1),
        })
      )
    }

    // logarithm of the exponential term
    // (Note that log(c^n) = n * log(c) holds)
    if (this.exponentialBase.compare(1) !== 0) {
      newTerms.push(
        createProductTerm({
          coefficient: math.log(this.exponentialBase.valueOf(), base),
          polyexponent: 1,
        })
      )
    }

    return new SumProductTerm(newTerms)
  }
}

export function createProductTerm({
  coefficient = 1,
  polyexponent,
  logexponent,
  exponentialBase = 1,
}: {
  coefficient?: number | Fraction
  polyexponent?: number | Fraction
  logexponent?: number | Fraction
  exponentialBase?: number | Fraction
} = {}): ProductTerm {
  const logarithmExponents = new IteratedLogarithms()
  if (polyexponent !== undefined) {
    logarithmExponents.set(0, new Fraction(polyexponent))
  }
  if (logexponent !== undefined) {
    logarithmExponents.set(1, new Fraction(logexponent))
  }
  return new ProductTerm({
    coefficient: new Fraction(coefficient),
    logarithmExponents: logarithmExponents,
    exponentialBase: new Fraction(exponentialBase),
  })
}

export class SumProductTerm {
  private terms: ProductTerm[] // Should only be modified by constructor and normalize
  constructor(x?: SumProductTerm | Array<ProductTerm> | ProductTerm) {
    this.terms = []
    if (x instanceof ProductTerm) {
      this.terms.push(x)
    } else if (x instanceof SumProductTerm) {
      this.terms.push(...x.terms)
    } else if (x instanceof Array<ProductTerm>) {
      this.terms.push(...x)
    }
    this.normalize()
  }

  /**
   * Normalize the sum of product terms. To do so, we sort the terms in
   * descending order, and then collect all terms that are asymptotically equal.
   * This is done in-place.
   *
   * @returns {SumProductTerm} A reference to the same sum of product terms.
   */
  private normalize(): SumProductTerm {
    this.terms.sort((a, b) => -a.abs().compare(b.abs()))
    const newTerms = []
    let x
    for (const t of this.terms) {
      if (x === undefined) x = t
      else if (x.abs().Theta(t.abs())) x = x.add(t)
      else {
        if (!x.coefficient.equals(0)) newTerms.push(x)
        x = t
      }
    }
    if (x !== undefined && !x.coefficient.equals(0)) newTerms.push(x)
    this.terms = newTerms
    return this
  }

  /**
   * Return a copy of the terms in the sum of product terms.
   *
   * @returns {ProductTerm[]} The terms
   */
  getTerms(): ProductTerm[] {
    return this.terms.slice()
  }

  /**
   * Return the dominant term of the sum of product terms.
   *
   * @returns {ProductTerm} The dominant term.
   */
  dominantTerm(): ProductTerm {
    if (this.terms.length === 0) {
      return createProductTerm({ coefficient: 0 })
    } else {
      return this.terms[0]
    }
  }

  /**
   * Add this term to another term. Does not modify the original terms.
   *
   * @param x The term to add.
   * @returns {SumProductTerm} The sum of the two terms.
   */
  add(x: ProductTerm | SumProductTerm): SumProductTerm {
    const newTerms = this.terms.slice()
    if (x instanceof ProductTerm) {
      newTerms.push(x)
    } else if (x instanceof SumProductTerm) {
      newTerms.push(...x.terms)
    }
    return new SumProductTerm(newTerms)
  }

  /**
   * Negate the sum. Does not modify the original terms.
   *
   * @returns {SumProductTerm} The negated sum.
   */
  neg(): SumProductTerm {
    return new SumProductTerm(this.terms.map((t) => t.neg()))
  }

  sub(x: ProductTerm | SumProductTerm) {
    return this.add(x.neg())
  }

  /**
   * Multiply this term with another term.
   *
   * @param x The term to multiply with.
   * @returns {SumProductTerm} The product of the two terms.
   */
  mul(x: ProductTerm | SumProductTerm): SumProductTerm {
    if (x instanceof ProductTerm) {
      x = new SumProductTerm(x)
    }
    const newTerms = []
    for (const t1 of this.terms) {
      for (const t2 of x.terms) {
        newTerms.push(t1.mul(t2))
      }
    }
    return new SumProductTerm(newTerms)
  }

  /**
   * Divide this term by a product term.
   *
   * @param x The term to divide by.
   * @returns {SumProductTerm} The quotient of the two terms.
   */
  div(x: ProductTerm | SumProductTerm): SumProductTerm {
    if (x instanceof SumProductTerm) {
      if (x.terms.length !== 1) {
        throw new Error("Division by sum of product terms not supported")
      }
      x = x.terms[0]
    }
    const newTerms = []
    for (const t of this.terms) {
      newTerms.push(t.div(x))
    }
    return new SumProductTerm(newTerms)
  }

  /**
   * Raise this term to a power.
   *
   * @param e The exponent.
   * @returns {SumProductTerm} The power of the term.
   */
  pow(e: SumProductTerm): SumProductTerm {
    if (e.isIdenticallyZero()) {
      return new SumProductTerm(createProductTerm()) // *^0 equals 1
    } else if (this.terms.length === 0) {
      return new SumProductTerm([]) // 0^(non-zero) equals 0
    } else if (this.terms.length === 1 && e.terms.length === 1) {
      return new SumProductTerm(this.terms[0].pow(e.terms[0]))
    } else if (
      e.terms.length === 1 &&
      e.terms[0].isConstant() &&
      e.terms[0].coefficient.d === 1
    ) {
      // For integer exponents, we naively multiply the terms
      let x = new SumProductTerm(createProductTerm()) // set x to 1
      for (let i = 0; i < e.terms[0].coefficient.n; i++) {
        x = this.mul(this)
      }
      return x
    }
    throw new TooComplex(
      this,
      `Raising ${this.toString()} to the power of ${e.toString()} is not implemented`
    )
  }

  /** Return the logarithm of a given SumProductTerm. */
  log(base: number = 2): SumProductTerm {
    if (this.terms.length === 0) {
      throw new Error("Cannot take the logarithm of 0")
    } else if (this.terms.length === 1) {
      return new SumProductTerm(this.terms[0].log(base))
    } else {
      throw new TooComplex(
        this,
        `Taking the logarithm of ${this.toString()} is not implemented.`
      )
    }
  }

  toString(variable: string = "x"): string {
    if (this.terms.length === 0) {
      return "0"
    } else {
      return this.terms.map((t) => t.toString(variable)).join(" + ")
    }
  }

  /**
   * Compute the limit of this SumProductTerm.
   *
   * @returns {Fraction | Unbounded} The limit.
   */
  limit(): Fraction | Unbounded {
    if (this.terms.length === 0) {
      return new Fraction(0)
    } else {
      return this.dominantTerm().limit()
    }
  }

  /**
   * Return the only term in the sum of product terms.
   *
   * @returns {ProductTerm} The term.
   * @throws {Error} If there are multiple terms in the sum.
   */
  getOnlyTerm(): ProductTerm {
    if (this.terms.length === 0) {
      return createProductTerm({ coefficient: 0 })
    } else if (this.terms.length === 1) {
      return this.terms[0]
    } else {
      throw new Error("getOnlyTerm(): Multiple terms in sum")
    }
  }
  isConstant(): boolean {
    return this.terms.every((t) => t.isConstant())
  }
  isIdenticallyZero(): boolean {
    return this.isConstant() && this.terms.length === 0
  }
  isLinear(): boolean {
    return this.terms.every((t) => t.isLinear())
  }
  isLogarithmic(): boolean {
    return this.terms.every((t) => t.isLogarithmic())
  }
  compare(x: SumProductTerm | ProductTerm): number {
    if (x instanceof SumProductTerm) {
      x = x.dominantTerm()
    }
    return this.dominantTerm().compare(x)
  }
  Oh(x: SumProductTerm): boolean {
    return this.dominantTerm().Oh(x.dominantTerm())
  }
  Omega(x: SumProductTerm): boolean {
    return this.dominantTerm().Omega(x.dominantTerm())
  }
  oh(x: SumProductTerm): boolean {
    return this.dominantTerm().oh(x.dominantTerm())
  }
  omega(x: SumProductTerm): boolean {
    return this.dominantTerm().omega(x.dominantTerm())
  }
  Theta(x: SumProductTerm): boolean {
    return this.dominantTerm().Theta(x.dominantTerm())
  }
  tilde(x: SumProductTerm): boolean {
    return this.dominantTerm().tilde(x.dominantTerm())
  }
}

/**
 * Returns all logarithm iteration numbers that are used in the given product
 * terms.
 *
 * @param {ProductTerm[]} terms - The product terms.
 * @returns {number[]} The used logarithm iteration numbers.
 */
export function usedIterationNumbers(
  terms: ProductTerm | ProductTerm[]
): number[] {
  if (terms instanceof ProductTerm) terms = [terms]
  const S = new Set<number>()
  terms.forEach((t) => t.logarithmExponents.forEach((_, i) => S.add(i)))
  return Array.from(S).sort()
}

/**
 * Like the function mathNodeToAsymptoticTerm below, but for ProductTerms.
 *
 * @param {math.MathNode} node - The MathNode to convert.
 * @returns {SumProductTerm} The product term.
 */
export function mathNodeToSumProductTerm(node: math.MathNode): SumProductTerm {
  if (node.type === "ConstantNode") {
    const n = node as math.ConstantNode
    return new SumProductTerm(
      createProductTerm({ coefficient: new Fraction(n.value) })
    )
  } else if (node.type === "OperatorNode") {
    const n = node as math.OperatorNode
    if (n.op === "*") {
      return n.args.map(mathNodeToSumProductTerm).reduce((a, b) => a.mul(b))
    } else if (n.op === "/") {
      if (n.args.length !== 2)
        throw new Error("Invalid number of arguments for /")
      return mathNodeToSumProductTerm(n.args[0]).div(
        mathNodeToSumProductTerm(n.args[1])
      )
    } else if (n.op === "+") {
      return n.args.map(mathNodeToSumProductTerm).reduce((a, b) => a.add(b))
    } else if (n.op === "-") {
      if (n.args.length === 1) {
        return mathNodeToSumProductTerm(n.args[0]).neg()
      } else if (n.args.length === 2) {
        return mathNodeToSumProductTerm(n.args[0]).sub(
          mathNodeToSumProductTerm(n.args[1])
        )
      } else {
        throw new Error("Invalid number of arguments for -")
      }
    } else if (n.op === "^") {
      if (n.args.length !== 2) throw new Error("Invalid number of arguments")
      const base = mathNodeToSumProductTerm(n.args[0])
      const exponent = mathNodeToSumProductTerm(n.args[1])
      return base.pow(exponent)
    }
  } else if (node.type === "FunctionNode") {
    const n = node as math.FunctionNode
    const base = baseOfLog(n.fn.name)
    const arg = mathNodeToSumProductTerm(n.args[0])
    if (base) {
      const l = arg.log(base)
      if (l !== undefined) {
        return l
      }
    }
  } else if (node.type === "ParenthesisNode") {
    const n = node as math.ParenthesisNode
    return mathNodeToSumProductTerm(n.content)
  } else if (node.type === "SymbolNode") {
    // const n = node as math.SymbolNode
    // We silently assume here that the symbol is indeed the unique variable.
    return new SumProductTerm(
      createProductTerm({
        polyexponent: new Fraction(1),
      })
    )
  }
  throw new TooComplex(node)
}

/**
 * Output a logarithm as a LaTeX string.
 *
 * @param {string} vartex - The LaTeX string for the variable.
 * @param {Fraction} logexponent - The exponent of the logarithm.
 * @param {Fraction} logbasis - The base of the logarithm.
 * @param {boolean} omitLogBasis - If true, the log basis is omitted.
 * @param {boolean} verboseStyle - If true, the log is wrapped in parentheses
 *   and the exponent is written as a superscript.
 * @returns {string} The LaTeX string.
 */
function logToLatex(
  vartex: string,
  logexponent: Fraction,
  logbasis: Fraction,
  omitLogBasis: boolean = false,
  verboseStyle: boolean = true
): string {
  if (logexponent.equals(0)) return "1"

  const basis = omitLogBasis ? "" : `_{${logbasis.toString()}}`
  if (!verboseStyle)
    return `\\log${exponentToLatex(logexponent)}${basis}{${vartex}}`

  let latex = ""
  if (exponentToLatex(logexponent) !== "") {
    latex += "("
  }
  latex += `\\log${basis}{${vartex}}`
  if (exponentToLatex(logexponent) !== "") {
    latex += ")" + exponentToLatex(logexponent)
  }
  return latex
}

/***/
/***/
/***/

/**
 * Generate a random fraction
 *
 * @param {Object} options
 * @param {number} options.oneProbability Approximate probability of generating
 *   1
 * @param {number} options.fractionProbability Probability of generating a
 *   fraction
 * @param {number} options.minInt Minimum integer to generate
 * @param {number} options.maxInt Maximum integer to generate
 * @param {number} options.maxDenominator Maximum denominator to generate
 * @returns {Fraction} A random fraction
 */
export function sampleFraction({
  oneProbability,
  fractionProbability = 0.3,
  minInt = 1,
  maxInt = 99,
  maxDenominator = 9,
}: {
  oneProbability?: number
  fractionProbability?: number
  minInt?: number
  maxInt?: number
  maxDenominator?: number
}): Fraction {
  const uniform = random.uniform(0, 1)
  if (oneProbability && uniform() <= oneProbability) {
    return new Fraction(1)
  }
  if (fractionProbability && uniform() <= fractionProbability) {
    const denominator = random.int(2, maxDenominator)
    const numerator = random.int(1, denominator - 1)
    return new Fraction(numerator, denominator)
  }
  return new Fraction(random.int(minInt, maxInt))
}

export type TermVariants =
  | "log" // C * (log_b (n))^c
  | "poly" // C * n^c
  | "exp" // C * b^n
  // | "pureSimple" // C * (log_b (n))^c or C * n^c, no fractions
  | "pure" // like pureSimple, but simple fractions allowed
  | "polylog" // C * n^c * (log_b (n))^d
  | "polylogexp" // C * n^c * (log_b (n))^d

/**
 * Generate a term (no sums)
 *
 * @param {string | ReactNode} variable Variable name to use
 * @param {number} variant What kind of terms to generate
 * @returns {SimpleAsymptoticTerm} Term
 */
export function sampleTerm(
  variable: string = "n",
  variant: TermVariants = "pure"
): SimpleAsymptoticTerm {
  switch (variant) {
    case "log": {
      return new SimpleAsymptoticTerm({
        variable,
        coefficient: sampleFraction({
          fractionProbability: 1 / 3,
        }),
        logexponent: sampleFraction({
          fractionProbability: 0,
        }),
        logbasis: sampleFraction({
          fractionProbability: 0,
        }),
      })
    }
    case "poly": {
      return new SimpleAsymptoticTerm({
        variable,
        coefficient: sampleFraction({
          fractionProbability: 1 / 3,
        }),
        polyexponent: sampleFraction({
          fractionProbability: 0,
        }),
      })
    }
    case "exp": {
      return new SimpleAsymptoticTerm({
        variable,
        coefficient: sampleFraction({
          fractionProbability: 1 / 3,
        }),
        exponentialBase: sampleFraction({
          fractionProbability: 0,
          minInt: 2,
        }),
      })
    }
    case "pure": {
      const C = sampleFraction({
        fractionProbability: 1 / 3,
      })
      if (random.int(1, 3) == 1) {
        return new SimpleAsymptoticTerm({
          coefficient: C,
          logexponent: sampleFraction({
            fractionProbability: 0,
            maxInt: 3,
          }),
          logbasis: sampleFraction({
            fractionProbability: 0,
            minInt: 2,
            maxInt: 7,
          }),
          variable,
        })
      } else {
        return new SimpleAsymptoticTerm({
          coefficient: C,
          polyexponent: sampleFraction({
            fractionProbability: 1 / 3,
            maxInt: 3,
            maxDenominator: 3,
          }),
          variable,
        })
      }
    }
    case "polylog":
      return new SimpleAsymptoticTerm({
        coefficient: sampleFraction({
          fractionProbability: 1 / 3,
        }),
        polyexponent: sampleFraction({
          fractionProbability: 1 / 3,
          maxInt: 3,
          maxDenominator: 3,
        }),
        logexponent: sampleFraction({
          fractionProbability: 0,
          minInt: -17,
          maxInt: 17,
        }),
        logbasis: sampleFraction({
          fractionProbability: 0,
          minInt: 2,
          maxInt: 7,
        }),
        variable,
      })
    case "polylogexp":
      return new SimpleAsymptoticTerm({
        coefficient: sampleFraction({
          fractionProbability: 1 / 3,
        }),
        exponentialBase: sampleFraction({
          fractionProbability: 0,
          maxInt: 10,
        }),
        polyexponent: sampleFraction({
          fractionProbability: 1 / 3,
          maxInt: 3,
          maxDenominator: 3,
        }),
        logexponent: sampleFraction({
          fractionProbability: 0,
          minInt: -17,
          maxInt: 17,
        }),
        logbasis: sampleFraction({
          fractionProbability: 0,
          minInt: 2,
          maxInt: 7,
        }),
        variable,
      })
  }
}

export type TermSetVariants =
  | "start" // log, poly, exp, at least one of each
  | TermVariants

/**
 * Generate a random set of asymptotically distinct terms
 *
 * @param {Object} options
 * @param {number} options.numTerms Number of terms to generate
 * @param {string | node} options.variable Variable name to use
 * @param {number} options.difficulty Difficulty level
 * @returns {Array} Of asymptotically distinct terms
 */
export function sampleTermSet({
  variable = "n",
  numTerms = 4,
  variant = "start",
}: {
  variable?: string
  numTerms?: number
  variant?: TermSetVariants
}): Array<SimpleAsymptoticTerm> {
  const set = [] as Array<SimpleAsymptoticTerm>
  if (variant === "start") {
    set.push(sampleTerm(variable, "log"))
    set.push(sampleTerm(variable, "poly"))
    set.push(sampleTerm(variable, "exp"))
  }
  const sample =
    variant === "start"
      ? () =>
          sampleTerm(
            variable,
            random.choice<TermVariants>(["log", "poly", "exp"])
          )
      : () => sampleTerm(variable, variant)
  let trials = 0
  while (set.length < numTerms) {
    let t = sample()
    while (set.some((t2) => t.compare(t2) == 0)) {
      trials++
      if (trials > 1000)
        throw new Error(`Unable to generate ${numTerms} distinct terms`)
      t = sample()
    }
    set.push(t)
  }
  return shuffleArray(set)
}

interface GeneratedAsymptoticTerm {
  toLatex(
    variable?: string,
    omitCoefficient?: boolean,
    omitLogBasis?: boolean
  ): string
  toString(variable: string): string
  toMathNode(variable: string): math.MathNode
  toSumProductTerm(variable: string): SumProductTerm
  // compare(other: AsymptoticTerm): number
  // Oh(other: AsymptoticTerm): boolean
  // oh(other: AsymptoticTerm): boolean
  // Omega(other: AsymptoticTerm): boolean
  // omega(other: AsymptoticTerm): boolean
  // Theta(other: AsymptoticTerm): boolean
  // tilde(other: AsymptoticTerm): boolean
}

/**
 * A class representing a simple product term.
 *
 * @example
 *   const term = new AsymptoticTerm({
 *     coefficient: 1,
 *     polyexponent: 2,
 *     logexponent: 3,
 *     expexponent: 4,
 *   })
 *
 * @class
 * @param {number} coefficient - The coefficient of the term.
 * @param {number} polyexponent - The exponent of the polynomial term.
 * @param {number} logexponent - The exponent of the logarithm term.
 * @param {number} logbasis - The basis of the logarithm term.
 * @param {number} expexponent - The exponent of the exponential term.
 * @param {string} variable - The variable of the term.
 */
export class SimpleAsymptoticTerm implements GeneratedAsymptoticTerm {
  coefficient: Fraction
  polyexponent: Fraction
  logexponent: Fraction
  logbasis: Fraction
  exponentialBase: Fraction
  variable: string

  constructor({
    coefficient = 1,
    logexponent = 0,
    logbasis = 2,
    exponentialBase = 1,
    polyexponent = 0,
    variable,
  }: {
    coefficient?: number | Fraction
    logexponent?: number | Fraction
    logbasis?: number | Fraction
    exponentialBase?: number | Fraction
    polyexponent?: number | Fraction
    variable: string
  }) {
    this.coefficient = new Fraction(coefficient)
    this.polyexponent = new Fraction(polyexponent)
    this.logexponent = new Fraction(logexponent)
    this.logbasis = new Fraction(logbasis)
    this.exponentialBase = new Fraction(exponentialBase)
    this.variable = variable
  }

  /** Returns the ProductTerm representation. */
  toSumProductTerm(): SumProductTerm {
    return new SumProductTerm(
      createProductTerm({
        coefficient: this.coefficient,
        polyexponent: this.polyexponent,
        logexponent: this.logexponent,
        exponentialBase: this.exponentialBase,
      })
    )
  }

  /**
   * Returns the math.js representation of the term.
   *
   * @param {string} variable - The variable to use.
   * @returns {string} The latex representation of the term.
   */
  toMathNode(variable: string): math.MathNode {
    return math.parse(this.toString(variable))
  }

  /**
   * Returns the latex representation of the term.
   *
   * @param {boolean} omitCoefficient - Whether to omit the coefficient.
   * @param {boolean} omitLogBasis - Whether to omit the basis of the log.
   * @returns {string} The latex representation of the term.
   */
  toLatex(
    variable?: string,
    omitCoefficient: boolean = false,
    omitLogBasis: boolean = false
  ): string {
    variable = variable || this.variable
    variable = variable.length === 1 ? variable : `(${variable})`
    let latex = ""
    if (!omitCoefficient && !this.coefficient.equals(1)) {
      latex += this.coefficient.toLatex()
    } else if (
      this.polyexponent.compare(0) <= 0 &&
      this.logexponent.compare(0) <= 0 &&
      this.exponentialBase.compare(1) <= 0
    ) {
      latex += "1"
    }
    if (this.polyexponent.compare(0) == 1) {
      latex += `${variable}${exponentToLatex(this.polyexponent)}`
    }
    if (this.logexponent.compare(0) > 0) {
      latex += logToLatex(
        variable,
        this.logexponent,
        this.logbasis,
        omitLogBasis
      )
    }
    if (this.exponentialBase.compare(1) > 0) {
      latex += `${this.exponentialBase.toLatex()}^{${this.variable}}`
    }
    const numNegativeTerms =
      (this.polyexponent.compare(0) < 0 ? 1 : 0) +
      (this.logexponent.compare(0) < 0 ? 1 : 0) +
      (this.exponentialBase.compare(1) < 0 ? 1 : 0)

    if (numNegativeTerms > 0) {
      latex += " / "
    }
    if (numNegativeTerms > 1) {
      latex += "("
    }
    if (this.polyexponent.compare(0) < 0) {
      latex += `${variable}${exponentToLatex(this.polyexponent.neg())}`
    }
    if (this.logexponent.compare(0) < 0) {
      latex += logToLatex(
        variable,
        this.logexponent.neg(),
        this.logbasis,
        omitLogBasis
      )
    }
    if (this.exponentialBase.compare(1) < 0) {
      latex += `${this.exponentialBase.inverse().toLatex()}^${variable}`
    }
    if (numNegativeTerms > 1) {
      latex += ")"
    }
    return latex
  }

  /**
   * Returns the representation of the term as a string (compatible with
   * nerdamer).
   *
   * @param {string} variable - The variable to use.
   * @returns {string} String representation of the term, not simplified in any
   *   way.
   */
  toString(variable: string = "x"): string {
    variable = variable.length === 1 ? variable : `(${variable})`
    return `${this.coefficient.toFraction()} * ${variable}^(${this.polyexponent.toFraction()}) * (log(${variable}))^(${this.logexponent.toFraction()}) * (${this.exponentialBase.toFraction()})^${variable}`
  }

  compare(t: SimpleAsymptoticTerm): number {
    return this.toSumProductTerm().compare(t.toSumProductTerm())
  }
}

/**
 * Define an Error "TooComplex" that is thrown when an expression is too complex
 * to be parsed.
 *
 * @class
 * @extends Error
 * @param {string} message - The error message.
 * @returns {TooComplex} - The TooComplex error.
 */
export class TooComplex extends Error {
  node: math.MathNode | SumProductTerm | ProductTerm
  constructor(
    node: math.MathNode | SumProductTerm | ProductTerm,
    message?: string
  ) {
    if (!message) {
      message =
        "The given node is too complex to be parsed: '" + node.toString()
      if ("isNode" in node) {
        message += "' (type: " + node.type + ")"
        if (node.type === "OperatorNode") {
          message += " (op: " + ((node as math.OperatorNode).op as string) + ")"
        }
      }
    }

    super(message)
    this.name = "TooComplex"
    this.node = node
  }
}
