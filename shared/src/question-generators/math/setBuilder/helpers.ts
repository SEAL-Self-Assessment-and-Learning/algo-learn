import type { Language } from "@shared/api/Language"
import type Random from "@shared/utils/random"

export type Domain = "N" | "Z"
export type SetProperty = "even" | "odd" | "prime" | "square" | "multiple" | "congruence"
export type BoundsMode = "auto" | "negOnly" | "posOnly"

/** primality test for small n by trial division */
export function isPrime(n: number): boolean {
  if (n < 2) return false
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false
  }
  return true
}

/** returns true iff x is perfect square */
export const isSquare = (x: number) => {
  const r = Math.floor(Math.sqrt(x))
  return r * r === x
}

/** Symbol for domain */
export const domainLatexSymbol = (dom: Domain) => (dom === "N" ? "\\mathbb{N}" : "\\mathbb{Z}")

/**
 * Implicit minimum element for naturals by property.
 * We omit showing the explicit lower bound if the printed bound is this value.
 */
export function implicitLowerBound(dom: Domain, prop: SetProperty): number | null {
  if (dom !== "N") return null
  switch (prop) {
    case "even":
    case "prime":
      return 2
    case "odd":
    case "square":
      return 1
    default:
      return 1
  }
}

/**
 * Pick numeric bounds (low, high) for display and iteration.
 * Supports all-negative, all-positive, or mixed ranges for integers.
 */
export function pickBounds(
  r: Random,
  dom: Domain,
  targetHigh: number,
  minWidth = 4,
  mode: BoundsMode = "auto",
) {
  const width = Math.max(minWidth, 2)

  if (dom === "N") {
    const high = Math.max(targetHigh, width + 1)
    const maxLow = Math.max(1, high - width)
    const low = r.int(1, maxLow)
    return { low, high }
  }

  if (mode === "negOnly") {
    const highNeg = -r.int(1, Math.max(2, Math.floor(targetHigh / 2) + 1))
    const lowMin = highNeg - Math.max(width, 4)
    const low = r.int(lowMin - width, highNeg - width)
    return { low, high: highNeg }
  }

  if (mode === "posOnly") {
    const high = Math.max(targetHigh, width + 1)
    const low = r.int(0, Math.max(0, high - width))
    return { low, high }
  }

  const high = Math.max(targetHigh, width + 1)
  const maxLow = high - width
  const low = r.int(-high, Math.min(maxLow, high - width))
  return { low, high }
}

/**
 * Choose printed inequality operators and derive inclusive iteration bounds
 * so explicit set equals printed interval respecting strictness
 */
export function chooseInequalities(r: Random, low: number, high: number) {
  let leftOp = r.choice(["<", "\\leq"])
  let rightOp = r.choice(["<", "\\leq"])

  const displayLowBound = low
  const displayHighBound = high

  let includeStart = leftOp === "<" ? displayLowBound + 1 : displayLowBound
  let includeEnd = rightOp === "<" ? displayHighBound - 1 : displayHighBound

  if (includeStart > includeEnd) {
    if (rightOp === "<") {
      rightOp = "\\leq"
      includeEnd = displayHighBound
    } else if (leftOp === "<") {
      leftOp = "\\leq"
      includeStart = displayLowBound
    } else {
      includeStart = displayLowBound
      includeEnd = displayLowBound
    }
  }

  return { leftOp, rightOp, displayLowBound, displayHighBound, includeStart, includeEnd }
}

/**
 * For naturals, optionally decorate the domain with its upper bound
 * when the lower bound is omitted due to being implicit.
 */
export function maybeDecorateNaturalDomain(
  dom: Domain,
  rightOp: string,
  displayHighBound: number,
  omitLower: boolean,
  r: Random,
) {
  if (dom !== "N" || !omitLower) return { latex: domainLatexSymbol(dom), embedsUpper: false }
  const useDecoration = r.choice([true, false])
  if (!useDecoration) return { latex: "\\mathbb{N}", embedsUpper: false }
  const tag = rightOp === "<" ? "<" : "\\leq"
  return { latex: `\\mathbb{N}_{${tag}${displayHighBound}}`, embedsUpper: true }
}

/**
 * Build textual bounds clause:
 * - omits lower bound if implicit
 * - avoid duplicating the upper bound if domain is already decorated
 */
export function formatBoundsClause(
  dom: Domain,
  prop: SetProperty,
  displayLowBound: number,
  displayHighBound: number,
  leftOp: string,
  rightOp: string,
  embedsUpper: boolean,
) {
  const implied = implicitLowerBound(dom, prop)
  const omitLower =
    implied !== null && (leftOp === "<" ? displayLowBound + 1 : displayLowBound) <= implied
  if (omitLower && embedsUpper) return ""
  if (omitLower) return `n ${rightOp} ${displayHighBound}`
  if (embedsUpper) return `${displayLowBound} ${leftOp} n`
  return `${displayLowBound} ${leftOp} n ${rightOp} ${displayHighBound}`
}

/** Inclusive integer range [a..b] */
export const rangeArray = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)

/** Per-row, precomputed config for template instance */
export type TemplateConfig = {
  low: number
  high: number
  leftOp: string
  rightOp: string
  displayLowBound: number
  displayHighBound: number
  includeStart: number
  includeEnd: number
  domainLatex: string
  embedsUpper: boolean
  residue?: number // for congruence templates
}

export type SetTemplate = {
  generateConfig: (dom: Domain, param: number, r: Random) => TemplateConfig
  labels: (lang: Language, dom: Domain, param: number, cfg: TemplateConfig) => string[]
  build: (dom: Domain, param: number, cfg: TemplateConfig) => number[]
  paramRange: (r: Random) => number
}
