import Fraction from "fraction.js"
import random from "random"
import shuffleArray from "./shuffle"

/**
 * A class representing a product term.
 * @class
 * @param {number} coefficient - The coefficient of the term.
 * @param {number} polyexponent - The exponent of the polynomial term.
 * @param {number} logexponent - The exponent of the logarithm term.
 * @param {number} logbasis - The basis of the logarithm term.
 * @param {number} expexponent - The exponent of the exponential term.
 * @param {string} variable - The variable of the term.
 * @example
 * const term = new AsymptoticTerm({
 *   coefficient: 1,
 *   polyexponent: 2,
 *   logexponent: 3,
 *   expexponent: 4,
 * })
 */
export class AsymptoticTerm {
  coefficient: Fraction
  polyexponent: Fraction
  logexponent: Fraction
  logbasis: Fraction
  expBase: Fraction
  variable: string

  constructor({
    coefficient = 1,
    logexponent = 0,
    logbasis = 2,
    expBase = 1,
    polyexponent = 0,
    variable = "n",
  }: {
    coefficient?: number | Fraction
    logexponent?: number | Fraction
    logbasis?: number | Fraction
    expBase?: number | Fraction
    polyexponent?: number | Fraction
    variable?: string
  }) {
    this.coefficient = new Fraction(coefficient)
    this.polyexponent = new Fraction(polyexponent)
    this.logexponent = new Fraction(logexponent)
    this.logbasis = new Fraction(logbasis)
    this.expBase = new Fraction(expBase)
    this.variable = variable
  }

  /**
   * Returns the product of two terms.
   * @param {AsymptoticTerm} t - The term to multiply by.
   * @returns {AsymptoticTerm} The product of the two terms.
   * @example
   * const term1 = new AsymptoticTerm({
   *  coefficient: 1,
   * polyexponent: 2,
   * logexponent: 3,
   * expexponent: 4,
   * })
   * const term2 = new AsymptoticTerm({
   * coefficient: 2,
   * polyexponent: 3,
   * logexponent: 4,
   * expexponent: 5,
   * })
   * term1.multiply(term2).toString() // 2 n^5 log^7 n 20^n
   */
  multiply(t: AsymptoticTerm): AsymptoticTerm {
    return new AsymptoticTerm({
      coefficient: this.coefficient.mul(t.coefficient),
      polyexponent: this.polyexponent.add(t.polyexponent),
      logexponent: this.logexponent.add(t.logexponent),
      logbasis: this.logbasis,
      expBase: this.expBase.mul(t.expBase),
      variable: this.variable,
    })
  }

  /**
   * Returns the latex representation of the term.
   * @param {boolean} omitCoefficient - Whether to omit the coefficient.
   * @param {boolean} omitLogBasis - Whether to omit the basis of the log.
   * @returns {string} The latex representation of the term.
   */
  toLatex(
    omitCoefficient: boolean = false,
    omitLogBasis: boolean = false
  ): string {
    const vartex =
      typeof this.variable == "string" && this.variable.length === 1
        ? this.variable
        : `(${this.variable})`
    let latex = ""
    if (!omitCoefficient && !this.coefficient.equals(1)) {
      latex += this.coefficient.toLatex()
    } else if (
      this.polyexponent.compare(0) <= 0 &&
      this.logexponent.compare(0) <= 0 &&
      this.expBase.compare(1) <= 0
    ) {
      latex += "1"
    }
    if (this.polyexponent.compare(0) == 1) {
      latex += `${vartex}${exp(this.polyexponent)}`
    }
    if (this.logexponent.compare(0) > 0) {
      latex += logToLatex(vartex, this.logexponent, this.logbasis, omitLogBasis)
    }
    if (this.expBase.compare(1) > 0) {
      latex += `${this.expBase.toLatex()}^{${this.variable}}`
    }
    const numNegativeTerms =
      (this.polyexponent.compare(0) < 0 ? 1 : 0) +
      (this.logexponent.compare(0) < 0 ? 1 : 0) +
      (this.expBase.compare(1) < 0 ? 1 : 0)

    if (numNegativeTerms > 0) {
      latex += " / "
    }
    if (numNegativeTerms > 1) {
      latex += "("
    }
    if (this.polyexponent.compare(0) < 0) {
      latex += `${vartex}${exp(this.polyexponent.neg())}`
    }
    if (this.logexponent.compare(0) < 0) {
      latex += logToLatex(
        vartex,
        this.logexponent.neg(),
        this.logbasis,
        omitLogBasis
      )
    }
    if (this.expBase.compare(1) < 0) {
      latex += `${this.expBase.inverse().toLatex()}^${vartex}`
    }
    if (numNegativeTerms > 1) {
      latex += ")"
    }
    return latex
  }

  /**
   * Returns the representation of the term as a string (compatible with nerdamer).
   * @returns {string} String representation of the term, not simplified in any way.
   */
  toString(): string {
    const vartex =
      typeof this.variable == "string" && this.variable.length === 1
        ? this.variable
        : `(${this.variable})`
    return `${this.coefficient.toFraction()} * ${vartex}^(${this.polyexponent.toFraction()}) * (log(${vartex}))^(${this.logexponent.toFraction()}) * (${this.expBase.toFraction()})^${vartex}`
  }

  compare(t: AsymptoticTerm): number {
    let cmp = this.expBase.compare(t.expBase)
    if (cmp != 0) {
      return cmp
    }

    cmp = this.polyexponent.compare(t.polyexponent)
    if (cmp != 0) {
      return cmp
    }

    return this.logexponent.compare(t.logexponent)
  }
}

function exp(x: Fraction) {
  return x.equals(1) ? "" : `^{${x.toFraction()}}`
}

function logToLatex(
  vartex: string,
  logexponent: Fraction,
  logbasis: Fraction,
  omitLogBasis = false,
  verboseStyle = true
) {
  if (logexponent.equals(0)) return "1"

  const basis = omitLogBasis ? "" : `_{${logbasis.toString()}}`
  if (!verboseStyle) return `\\log${exp(logexponent)}${basis}{${vartex}}`

  let latex = ""
  if (exp(logexponent) !== "") {
    latex += "("
  }
  latex += `\\log${basis}{${vartex}}`
  if (exp(logexponent) !== "") {
    latex += ")" + exp(logexponent)
  }
  return latex
}

/*******************************************************/
/*******************************************************/
/*******************************************************/

/** Generate a random fraction
 *
 * @param  {Object} options
 * @param  {number} options.oneProbability approximate probability of generating 1
 * @param  {number} options.fractionProbability probability of generating a fraction
 * @param  {number} options.minInt minimum integer to generate
 * @param  {number} options.maxInt maximum integer to generate
 * @param  {number} options.maxDenominator maximum denominator to generate
 * @return {Fraction} a random fraction
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
 * @param {string | ReactNode} variable variable name to use
 * @param {number} variant what kind of terms to generate
 * @returns {AsymptoticTerm} term
 */
export function sampleTerm(
  variable: string = "n",
  variant: TermVariants = "pure"
): AsymptoticTerm {
  switch (variant) {
    case "log": {
      return new AsymptoticTerm({
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
      return new AsymptoticTerm({
        coefficient: sampleFraction({
          fractionProbability: 1 / 3,
        }),
        polyexponent: sampleFraction({
          fractionProbability: 0,
        }),
      })
    }
    case "exp": {
      return new AsymptoticTerm({
        coefficient: sampleFraction({
          fractionProbability: 1 / 3,
        }),
        expBase: sampleFraction({
          fractionProbability: 0,
          minInt: 2,
        }),
      })
    }
    // case "pureSimple": {
    //   const C = sampleFraction({
    //     oneProbability: 2 / 3,
    //     fractionProbability: 0,
    //   })
    //   if (random.int(1, 3) == 1) {
    //     return new AsymptoticTerm({
    //       coefficient: C,
    //       logexponent: sampleFraction({
    //         fractionProbability: 0,
    //         maxInt: 3,
    //       }),
    //       logbasis: sampleFraction({
    //         fractionProbability: 0,
    //         minInt: 2,
    //         maxInt: 7,
    //       }),
    //       variable,
    //     })
    //   } else {
    //     return new AsymptoticTerm({
    //       coefficient: C,
    //       polyexponent: sampleFraction({
    //         fractionProbability: 0,
    //         maxInt: 17,
    //       }),
    //       variable,
    //     })
    //   }
    // }
    case "pure": {
      const C = sampleFraction({
        fractionProbability: 1 / 3,
      })
      if (random.int(1, 3) == 1) {
        return new AsymptoticTerm({
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
        return new AsymptoticTerm({
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
      return new AsymptoticTerm({
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
      return new AsymptoticTerm({
        coefficient: sampleFraction({
          fractionProbability: 1 / 3,
        }),
        expBase: sampleFraction({
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
 * @param {Object} options
 * @param {number} options.numTerms number of terms to generate
 * @param {string | node} options.variable variable name to use
 * @param {number} options.difficulty difficulty level
 * @returns {Array} of asymptotically distinct terms
 */
export function sampleTermSet({
  variable = "n",
  numTerms = 4,
  variant = "start",
}: {
  variable?: string
  numTerms?: number
  variant?: TermSetVariants
}): Array<AsymptoticTerm> {
  const set = [] as Array<AsymptoticTerm>
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
