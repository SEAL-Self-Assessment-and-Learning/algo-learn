import {
  minimalMultipleChoiceFeedback,
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
    description: "Match set-builder notation with explicit subsets",
    text: "Match the following sets in set-builder notation with their explicit subsets:",
  },
  de: {
    name: "Mengenschreibweise",
    description: "Ordne Mengen in Mengenschreibweise expliziten Mengen zu",
    text: "Ordne die folgenden Mengen in Mengenschreibweise den expliziten Mengen zu:",
  },
}

function isPrime(n: number): boolean {
  if (n < 2) return false
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false
  }
  return true
}

type Domain = "N" | "Z"

type SetTemplate = {
  labels: (lang: string, dom: Domain, param: number) => string[]
  build: (dom: Domain, param: number) => number[]
  paramRange: (random: Random) => number
}

const templates: SetTemplate[] = [
  // even numbers
  {
    labels: (lang, dom, n) => {
      const d = dom === "N" ? "\\mathbb{N}" : "\\mathbb{Z}"
      const even = lang === "en" ? "even" : "gerade"
      return [
        `$\\{ n \\in ${d} : n \\text{ ${even}}, n \\leq ${n} \\}$`,
        `$\\{ n \\in ${d} : n \\equiv 0 \\pmod{2}, n \\leq ${n} \\}$`,
        `$\\{ n \\in ${d} : \\exists k \\in ${d}, n = 2k, n \\leq ${n} \\}$`,
      ]
    },
    build: (dom, n) => {
      const arr: number[] = []
      const low = dom === "N" ? 1 : -n
      for (let x = low; x <= n; x++) if (x % 2 === 0) arr.push(x)
      return arr
    },
    paramRange: (r) => r.int(10, 40),
  },

  // odd numbers
  {
    labels: (lang, dom, n) => {
      const d = dom === "N" ? "\\mathbb{N}" : "\\mathbb{Z}"
      const odd = lang === "en" ? "odd" : "ungerade"
      return [
        `$\\{ n \\in ${d} : n \\text{ ${odd}}, n \\leq ${n} \\}$`,
        `$\\{ n \\in ${d} : n \\equiv 1 \\pmod{2}, n \\leq ${n} \\}$`,
        `$\\{ n \\in ${d} : \\exists k \\in ${d}, n = 2k+1, n \\leq ${n} \\}$`,
      ]
    },
    build: (dom, n) => {
      const arr: number[] = []
      const low = dom === "N" ? 1 : -n
      for (let x = low; x <= n; x++) if (x % 2 !== 0) arr.push(x)
      return arr
    },
    paramRange: (r) => r.int(10, 40),
  },

  // primes
  {
    labels: (lang, dom, n) => {
      const prime = lang === "en" ? "prime" : "prim"
      return [
        `$\\{ n \\in \\mathbb{N} : n \\text{ ${prime}}, n \\leq ${n} \\}$`,
        `$\\{ n \\in \\mathbb{N}_{\\geq 2} : \\forall d \\in \\mathbb{N}, (d \\mid n \\Rightarrow (d=1 \\lor d=n)), n \\leq ${n} \\}$`,
      ]
    },
    build: (dom, n) => Array.from({ length: n }, (_, i) => i + 1).filter((x) => isPrime(x)),
    paramRange: (r) => r.int(20, 50),
  },

  // multiples of m
  {
    labels: (lang, dom, m) => {
      const d = dom === "N" ? "\\mathbb{N}" : "\\mathbb{Z}"
      return [
        `$\\{ n \\in ${d} : n \\equiv 0 \\pmod{${m}}, n \\leq ${3 * m} \\}$`,
        `$\\{ n \\in ${d} : \\exists k \\in ${d}, n = k \\cdot ${m}, n \\leq ${3 * m} \\}$`,
      ]
    },
    build: (dom, m) => {
      const arr: number[] = []
      const low = dom === "N" ? 1 : -3 * m
      for (let x = low; x <= 3 * m; x++) if (x % m === 0) arr.push(x)
      return arr
    },
    paramRange: (r) => r.int(3, 15),
  },

  // squares
  {
    labels: (lang, dom, n) => {
      const issquare = lang === "en" ? "is a square" : "ist eine Quadratzahl"
      return [
        `$\\{ n \\in \\mathbb{N} : n \\text{ ${issquare}}, n \\leq ${n} \\}$`,
        `$\\{ n \\in \\mathbb{N} : \\exists k \\in \\mathbb{N}, n = k^2, n \\leq ${n} \\}$`,
      ]
    },
    build: (dom, n) =>
      Array.from({ length: n }, (_, i) => i + 1).filter((x) => Math.floor(Math.sqrt(x)) ** 2 === x),
    paramRange: (r) => r.int(30, 80),
  },

  // congruence
  {
    labels: (lang, dom, m) => {
      const d = dom === "N" ? "\\mathbb{N}" : "\\mathbb{Z}"
      return [
        `$\\{ n \\in ${d} : n \\equiv 1 \\pmod{${m}}, n \\leq ${3 * m} \\}$`,
        `$\\{ n \\in ${d} : \\exists k \\in ${d}, n = k \\cdot ${m} + 1, n \\leq ${3 * m} \\}$`,
      ]
    },
    build: (dom, m) => {
      const arr: number[] = []
      const low = dom === "N" ? 1 : -3 * m
      for (let x = low; x <= 3 * m; x++) if (x % m === 1) arr.push(x)
      return arr
    },
    paramRange: (r) => r.int(4, 12),
  },
]

export const SetBuilderQuestion: QuestionGenerator = {
  id: "setmatch",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["dismod", "sets"],
  languages: ["en", "de"],
  license: "MIT",
  expectedParameters: [],

  generate: (lang = "en", parameters, seed) => {
    const random = new Random(seed)

    const nSets = random.int(5, 8)
    const left: string[] = []
    const rights: string[] = []

    while (left.length < nSets) {
      const template = random.choice(templates)
      const domain: Domain = random.choice(["N", "Z"])
      const param = template.paramRange(random)
      const elements = template.build(domain, param)
      if (elements.length === 0) continue

      let elementsSorted = Array.from(new Set(elements)).sort((a, b) => a - b)
      if (elementsSorted.length > 8) {
        elementsSorted = random.subset(elementsSorted, 8).sort((a, b) => a - b)
      }

      const explicit = `$\\{ ${elementsSorted.join(", ")} \\}$`
      if (rights.includes(explicit)) continue

      const variants = template.labels(lang, domain, param)
      const label = random.choice(variants)

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
      path: serializeGeneratorCall({
        generator: SetBuilderQuestion,
        lang,
        parameters,
        seed,
      }),
      sorting: true,
      matching: true,
      text: t(translations, lang, "text"),
      left,
      answers: rightShuffled,
      feedback,
    }

    return { question }
  },
}
