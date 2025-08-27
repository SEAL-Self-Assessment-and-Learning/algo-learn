import type { Language } from "@shared/api/Language"
import {
  minimalMultipleChoiceFeedback,
  type FreeTextAnswer,
  type FreeTextFeedback,
  type FreeTextQuestion,
  type MultipleChoiceAnswer,
  type MultipleChoiceFeedback,
  type MultipleChoiceQuestion,
  type QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import Random from "@shared/utils/random"
import { t, tFunctional, type Translations } from "@shared/utils/translations"

const translations: Translations = {
  en: {
    name: "Set Builder Notation",
    description: "Given a set in set-builder notation, determine all its elements explicitly.",
    match: "Match each set given in set-builder notation with its explicit list of elements:",
    free: "Write out all elements of the following set explicitly:",
    checkFormat: "{a, b, c}",
  },
  de: {
    name: "Mengenschreibweise",
    description: "Bestimme zu einer Menge in Mengenschreibweise alle ihre Elemente explizit.",
    match:
      "Ordne jeder in Mengenschreibweise gegebenen Menge ihre explizite Aufzählung der Elemente zu:",
    free: "Schreibe alle Elemente der folgenden Menge explizit auf:",
    checkFormat: "{a, b, c}",
  },
}

function isPrime(n: number): boolean {
  if (n < 2) return false
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false
  }
  return true
}

const isSquare = (x: number) => {
  const r = Math.floor(Math.sqrt(x))
  return r * r === x
}

type Domain = "N" | "Z"
type SetProperty = "even" | "odd" | "prime" | "square" | "multiple" | "congruence"

type BoundsMode = "auto" | "negOnly" | "posOnly"

const domainLatexSymbol = (dom: Domain) => (dom === "N" ? "\\mathbb{N}" : "\\mathbb{Z}")

// implicit lower bounds for naturals by property
function implicitLowerBound(dom: Domain, prop: SetProperty): number | null {
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

// random bounds with optional negative-only ranges for integers
function pickBounds(
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

// choose inequalities, compute displayed bounds and iterator bounds
// iterator bounds are derived prom displayed bounds to keep them equal
function chooseInequalities(r: Random, low: number, high: number) {
  // pick display operators
  let leftOp = r.choice(["<", "\\leq"])
  let rightOp = r.choice(["<", "\\leq"])

  // values printed
  const displayLowBound = low
  const displayHighBound = high

  // derive inclusive iteration bounds
  let includeStart = leftOp === "<" ? displayLowBound + 1 : displayLowBound
  let includeEnd = rightOp === "<" ? displayHighBound - 1 : displayHighBound

  // normalize if empty by relaxing strictness in printed operators
  if (includeStart > includeEnd) {
    if (rightOp === "<") {
      rightOp = "\\leq"
      includeEnd = displayHighBound
    } else if (leftOp === "<") {
      leftOp = "\\leq"
      includeStart = displayLowBound
    } else {
      // degenerate: clamp single point
      includeStart = displayLowBound
      includeEnd = displayLowBound
    }
  }

  return { leftOp, rightOp, displayLowBound, displayHighBound, includeStart, includeEnd }
}

// optionally decorate N with an upper constraint when lower bound is implicit
// returns whether upper bound is already embedded to avoid duplication
function maybeDecorateNaturalDomain(
  dom: Domain,
  rightOp: string,
  displayHighBound: number,
  omitLower: boolean,
  r: Random,
) {
  if (dom !== "N" || !omitLower) return { latex: "\\mathbb{N}", embedsUpper: false }
  const useDecoration = r.choice([true, false])
  if (!useDecoration) return { latex: "\\mathbb{N}", embedsUpper: false }
  const tag = rightOp === "<" ? "<" : "\\leq"
  return { latex: `\\mathbb{N}_{${tag}${displayHighBound}}`, embedsUpper: true }
}

// omit lower when implicit; avoid duplicating upper when domain is decorated
function formatBoundsClause(
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
  if (omitLower && embedsUpper) return "" // domain already encodes upper; drop entire clause
  if (omitLower) return `n ${rightOp} ${displayHighBound}` // only show upper
  if (embedsUpper) return `${displayLowBound} ${leftOp} n` // only show lower
  return `${displayLowBound} ${leftOp} n ${rightOp} ${displayHighBound}`
}

// build range array
const rangeArray = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)

// unified template config
type TemplateConfig = {
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
  residue?: number // used by congruence
}

type SetTemplate = {
  // compute all randomness only once then pass via config
  generateConfig: (dom: Domain, param: number, r: Random) => TemplateConfig
  labels: (lang: string, dom: Domain, param: number, cfg: TemplateConfig) => string[]
  build: (dom: Domain, param: number, cfg: TemplateConfig) => number[]
  paramRange: (random: Random) => number
}

const templates: SetTemplate[] = [
  // even numbers
  {
    generateConfig: (dom, n, r) => {
      const prop: SetProperty = "even"
      const mode: BoundsMode = dom === "Z" && r.choice([true, false]) ? "negOnly" : "auto"
      const { low, high } = pickBounds(r, dom, n, 4, mode)
      const { leftOp, rightOp, displayLowBound, displayHighBound, includeStart, includeEnd } =
        chooseInequalities(r, low, high)
      const implied = implicitLowerBound(dom, prop)
      const omitLower =
        implied !== null && (leftOp === "<" ? displayLowBound + 1 : displayLowBound) <= implied
      const natDecor = maybeDecorateNaturalDomain(dom, rightOp, displayHighBound, omitLower, r)
      const domainLatex = dom === "N" ? natDecor.latex : domainLatexSymbol(dom)
      return {
        low,
        high,
        leftOp,
        rightOp,
        displayLowBound,
        displayHighBound,
        includeStart,
        includeEnd,
        domainLatex,
        embedsUpper: natDecor.embedsUpper,
      }
    },
    labels: (lang, dom, _n, cfg) => {
      const word = lang === "en" ? "even" : "gerade"
      const bounds = formatBoundsClause(
        dom,
        "even",
        cfg.displayLowBound,
        cfg.displayHighBound,
        cfg.leftOp,
        cfg.rightOp,
        cfg.embedsUpper,
      )
      const clause = bounds ? `, ${bounds}` : ""
      return [
        `\\{ n \\in ${cfg.domainLatex} : n \\text{ ${word}}${clause} \\}`,
        `\\{ n \\in ${cfg.domainLatex} : n \\equiv 0 \\pmod{2}${clause} \\}`,
        `\\{ n \\in ${cfg.domainLatex} : \\exists k \\in ${cfg.domainLatex}, n = 2k${clause} \\}`,
      ]
    },
    build: (dom, _n, cfg) => {
      const start = dom === "N" ? Math.max(1, cfg.includeStart) : cfg.includeStart
      const arr: number[] = []
      for (let x = start; x <= cfg.includeEnd; x++) if (x % 2 === 0) arr.push(x)
      return arr
    },
    paramRange: (r) => r.int(10, 40),
  },

  // odd numbers
  {
    generateConfig: (dom, n, r) => {
      const prop: SetProperty = "odd"
      const mode: BoundsMode = dom === "Z" && r.choice([true, false]) ? "negOnly" : "auto"
      const { low, high } = pickBounds(r, dom, n, 4, mode)
      const { leftOp, rightOp, displayLowBound, displayHighBound, includeStart, includeEnd } =
        chooseInequalities(r, low, high)
      const implied = implicitLowerBound(dom, prop)
      const omitLower =
        implied !== null && (leftOp === "<" ? displayLowBound + 1 : displayLowBound) <= implied
      const natDecor = maybeDecorateNaturalDomain(dom, rightOp, displayHighBound, omitLower, r)
      const domainLatex = dom === "N" ? natDecor.latex : domainLatexSymbol(dom)
      return {
        low,
        high,
        leftOp,
        rightOp,
        displayLowBound,
        displayHighBound,
        includeStart,
        includeEnd,
        domainLatex,
        embedsUpper: natDecor.embedsUpper,
      }
    },
    labels: (lang, dom, _n, cfg) => {
      const word = lang === "en" ? "odd" : "ungerade"
      const bounds = formatBoundsClause(
        dom,
        "odd",
        cfg.displayLowBound,
        cfg.displayHighBound,
        cfg.leftOp,
        cfg.rightOp,
        cfg.embedsUpper,
      )
      const clause = bounds ? `, ${bounds}` : ""
      return [
        `\\{ n \\in ${cfg.domainLatex} : n \\text{ ${word}}${clause} \\}`,
        `\\{ n \\in ${cfg.domainLatex} : n \\equiv 1 \\pmod{2}${clause} \\}`,
        `\\{ n \\in ${cfg.domainLatex} : \\exists k \\in ${cfg.domainLatex}, n = 2k+1${clause} \\}`,
      ]
    },
    build: (dom, _n, cfg) => {
      const start = dom === "N" ? Math.max(1, cfg.includeStart) : cfg.includeStart
      const arr: number[] = []
      for (let x = start; x <= cfg.includeEnd; x++) if (x % 2 !== 0) arr.push(x)
      return arr
    },
    paramRange: (r) => r.int(10, 40),
  },

  // primes in N
  {
    generateConfig: (_dom, n, r) => {
      const low = 2
      const high = n
      const { leftOp, rightOp, displayLowBound, displayHighBound, includeStart, includeEnd } =
        chooseInequalities(r, low, high)
      const natDecor = maybeDecorateNaturalDomain("N", rightOp, displayHighBound, true, r)
      return {
        low,
        high,
        leftOp,
        rightOp,
        displayLowBound,
        displayHighBound,
        includeStart,
        includeEnd,
        domainLatex: natDecor.latex,
        embedsUpper: natDecor.embedsUpper,
      }
    },
    labels: (lang, _dom, _n, cfg) => {
      const word = lang === "en" ? "prime" : "prim"
      const bounds = formatBoundsClause(
        "N",
        "prime",
        cfg.displayLowBound,
        cfg.displayHighBound,
        cfg.leftOp,
        cfg.rightOp,
        cfg.embedsUpper,
      )
      const clause = bounds ? `, ${bounds}` : ""
      return [
        `\\{ n \\in ${cfg.domainLatex} : n \\geq 2 \\wedge n \\text{ ${word}}${clause} \\}`,
        `\\{ n \\in ${cfg.domainLatex} : n \\geq 2 \\wedge \\forall d \\in \\mathbb{N}, (d \\mid n \\Rightarrow (d=1 \\lor d=n))${clause} \\}`,
      ]
    },
    build: (_dom, _n, cfg) => {
      const start = Math.max(2, cfg.includeStart)
      const end = cfg.includeEnd
      return start <= end ? rangeArray(start, end).filter(isPrime) : []
    },
    paramRange: (r) => r.int(20, 50),
  },

  // multiples of m in N or Z
  {
    generateConfig: (dom, m, r) => {
      const prop: SetProperty = "multiple"
      const cap = 3 * m
      const mode: BoundsMode = dom === "Z" && r.choice([true, false]) ? "negOnly" : "auto"
      const { low, high } = pickBounds(r, dom, cap, 4, mode)
      const { leftOp, rightOp, displayLowBound, displayHighBound, includeStart, includeEnd } =
        chooseInequalities(r, low, high)
      const implied = implicitLowerBound(dom, prop)
      const omitLower =
        implied !== null && (leftOp === "<" ? displayLowBound + 1 : displayLowBound) <= implied
      const natDecor = maybeDecorateNaturalDomain(dom, rightOp, displayHighBound, omitLower, r)
      const domainLatex = dom === "N" ? natDecor.latex : domainLatexSymbol(dom)
      return {
        low,
        high,
        leftOp,
        rightOp,
        displayLowBound,
        displayHighBound,
        includeStart,
        includeEnd,
        domainLatex,
        embedsUpper: natDecor.embedsUpper,
      }
    },
    labels: (_lang, dom, m, cfg) => {
      const bounds = formatBoundsClause(
        dom,
        "multiple",
        cfg.displayLowBound,
        cfg.displayHighBound,
        cfg.leftOp,
        cfg.rightOp,
        cfg.embedsUpper,
      )
      const clause = bounds ? `, ${bounds}` : ""
      return [
        `\\{ n \\in ${cfg.domainLatex} : ${m} \\mid n${clause} \\}`,
        `\\{ n \\in ${cfg.domainLatex} : \\exists k \\in ${cfg.domainLatex}, n = k \\cdot ${m}${clause} \\}`,
      ]
    },
    build: (dom, m, cfg) => {
      const start = dom === "N" ? Math.max(1, cfg.includeStart) : cfg.includeStart
      const arr: number[] = []
      for (let x = start; x <= cfg.includeEnd; x++) if (x % m === 0) arr.push(x)
      return arr
    },
    paramRange: (r) => r.int(3, 15),
  },

  // squares in N
  {
    generateConfig: (_dom, n, r) => {
      const low = 1
      const high = n
      const { leftOp, rightOp, displayLowBound, displayHighBound, includeStart, includeEnd } =
        chooseInequalities(r, low, high)
      const natDecor = maybeDecorateNaturalDomain("N", rightOp, displayHighBound, true, r)
      return {
        low,
        high,
        leftOp,
        rightOp,
        displayLowBound,
        displayHighBound,
        includeStart,
        includeEnd,
        domainLatex: natDecor.latex,
        embedsUpper: natDecor.embedsUpper,
      }
    },
    labels: (lang, _dom, _n, cfg) => {
      const word = lang === "en" ? "is a square" : "ist eine Quadratzahl"
      const bounds = formatBoundsClause(
        "N",
        "square",
        cfg.displayLowBound,
        cfg.displayHighBound,
        cfg.leftOp,
        cfg.rightOp,
        cfg.embedsUpper,
      )
      const clause = bounds ? `, ${bounds}` : ""
      return [
        `\\{ n \\in ${cfg.domainLatex} : n \\text{ ${word}}${clause} \\}`,
        `\\{ n \\in ${cfg.domainLatex} : \\exists k \\in \\mathbb{N}, n = k^2${clause} \\}`,
      ]
    },
    build: (_dom, _n, cfg) => rangeArray(cfg.includeStart, cfg.includeEnd).filter(isSquare),
    paramRange: (r) => r.int(30, 80),
  },

  // congruence in N or Z
  {
    generateConfig: (dom, m, r) => {
      const cap = 3 * m
      const mode: BoundsMode = dom === "Z" && r.choice([true, false]) ? "negOnly" : "auto"
      const { low, high } = pickBounds(r, dom, cap, 4, mode)
      const { leftOp, rightOp, displayLowBound, displayHighBound, includeStart, includeEnd } =
        chooseInequalities(r, low, high)
      const implied = implicitLowerBound(dom, "congruence")
      const omitLower =
        implied !== null && (leftOp === "<" ? displayLowBound + 1 : displayLowBound) <= implied
      const natDecor = maybeDecorateNaturalDomain(dom, rightOp, displayHighBound, omitLower, r)
      const domainLatex = dom === "N" ? natDecor.latex : domainLatexSymbol(dom)
      const residue = m > 1 ? r.int(1, m - 1) : 0
      return {
        low,
        high,
        leftOp,
        rightOp,
        displayLowBound,
        displayHighBound,
        includeStart,
        includeEnd,
        domainLatex,
        embedsUpper: natDecor.embedsUpper,
        residue,
      }
    },
    labels: (_lang, dom, m, cfg) => {
      const bounds = formatBoundsClause(
        dom,
        "congruence",
        cfg.displayLowBound,
        cfg.displayHighBound,
        cfg.leftOp,
        cfg.rightOp,
        cfg.embedsUpper,
      )
      const clause = bounds ? `, ${bounds}` : ""
      const rVal = cfg.residue ?? 0
      return [
        `\\{ n \\in ${cfg.domainLatex} : n \\equiv ${rVal} \\pmod{${m}}${clause} \\}`,
        `\\{ n \\in ${cfg.domainLatex} : \\exists k \\in ${cfg.domainLatex}, n = k \\cdot ${m} + ${rVal}${clause} \\}`,
      ]
    },
    build: (dom, m, cfg) => {
      const start = dom === "N" ? Math.max(1, cfg.includeStart) : cfg.includeStart
      const rVal = cfg.residue ?? 0
      const arr: number[] = []
      for (let x = start; x <= cfg.includeEnd; x++) if (x % m === rVal) arr.push(x)
      return arr
    },
    paramRange: (r) => r.int(4, 12),
  },
]

export const SetBuilderQuestion: QuestionGenerator = {
  id: "setbuild",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["dismod", "sets"],
  languages: ["en", "de"],
  license: "MIT",
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["match", "freetext"],
    },
  ],

  generate: (lang, parameters, seed) => {
    const path = serializeGeneratorCall({ generator: SetBuilderQuestion, lang, parameters, seed })
    const variant = parameters.variant as "match" | "freetext"
    const random = new Random(seed)

    switch (variant) {
      case "match":
        return generateMatchVariant(lang, path, random)
      case "freetext":
        return generateFreeTextVariant(lang, path, random)
      default:
        throw new Error("Unknown variant")
    }
  },
}

function generateMatchVariant(lang: Language, path: string, random: Random) {
  const nSets = random.int(5, 8)
  const left: string[] = []
  const rights: string[] = []

  while (left.length < nSets) {
    const template = random.choice(templates)
    const domain: Domain = random.choice(["N", "Z"])
    const param = template.paramRange(random)

    // generate once and share between build/labels
    const cfg = template.generateConfig(domain, param, random)

    const elements = template.build(domain, param, cfg)
    if (elements.length === 0) continue

    // full explicit set, sorted and deduped
    const elementsSorted = Array.from(new Set(elements)).sort((a, b) => a - b)
    const explicit = `$\\{ ${elementsSorted.join(", ")} \\}$`
    if (rights.includes(explicit)) continue

    const variants = template.labels(lang, domain, param, cfg)
    const label = `\\[` + random.choice(variants) + `\\]`

    left.push(label)
    rights.push(explicit)
  }

  const rightShuffled = random.shuffle([...rights])
  const solution = rights.map((exp) => rightShuffled.indexOf(exp))

  const baseFeedback = minimalMultipleChoiceFeedback({
    correctAnswerIndex: solution,
    sorting: true,
  })

  const feedback = async (answer: MultipleChoiceAnswer): Promise<MultipleChoiceFeedback> => {
    const result = await baseFeedback(answer)
    const rowCorrectness = solution.map((c, i) => answer.choice[i] === c)
    return { ...result, rowCorrectness }
  }

  const question: MultipleChoiceQuestion = {
    type: "MultipleChoiceQuestion",
    name: SetBuilderQuestion.name(lang),
    path: path,
    sorting: true,
    matching: true,
    text: t(translations, lang, "match"),
    left,
    answers: rightShuffled,
    feedback,
  }

  return { question }
}

function generateFreeTextVariant(lang: Language, path: string, random: Random) {
  const tplt = random.choice(templates)
  const dom: Domain = random.choice(["N", "Z"])
  const param = tplt.paramRange(random)

  const cfg = tplt.generateConfig(dom, param, random)
  const elems = tplt.build(dom, param, cfg)

  const sorted = Array.from(new Set(elems)).sort((a, b) => a - b)
  const correctSet = new Set(sorted)
  const expression = random.choice(tplt.labels(lang, dom, param, cfg))

  const checkFormat = (a: FreeTextAnswer) => {
    const input = a.text.trim()
    const isValid = /^\{(\s*\d+\s*,)*\s*\d+\s*\}$/.test(input)
    return isValid ? { valid: true } : { valid: false, message: t(translations, lang, "checkFormat") }
  }

  const feedback = (a: FreeTextAnswer): FreeTextFeedback => {
    const match = a.text.trim().match(/^\{(.*?)\}$/)
    if (!match) return { correct: false }

    const user = match[1]
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((x) => !isNaN(x))

    const correct = user.length === correctSet.size && [...correctSet].every((x) => user.includes(x))
    return { correct }
  }

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: t(translations, lang, "name"),
    path,
    text: `${t(translations, lang, "free")}\\[${expression}\\]`,
    checkFormat,
    feedback,
    typingAid: [
      { text: "{", input: "{", label: "{" },
      { text: "}", input: "}", label: "}" },
      { text: ",", input: ",", label: "," },
    ],
  }

  return { question }
}
