import type { Language } from "@shared/api/Language"
import {
  minimalMultipleChoiceFeedback,
  type FreeTextAnswer,
  type FreeTextFeedback,
  type FreeTextQuestion,
  type MultipleChoiceAnswer,
  type MultipleChoiceFeedback,
  type MultipleChoiceFeedbackFunction,
  type MultipleChoiceQuestion,
  type QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import Random from "@shared/utils/random"
import { t, tFunctional } from "@shared/utils/translations"
import type { Domain } from "./helpers"
import { templates } from "./templates"
import { translations } from "./translations"

const maxMatchSize = 8
const maxAttempts = 100

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

/** helper to add row-by-row correctness into MultipleChoice feedback */
function matchingRowFeedback(correctMapping: number[], base: MultipleChoiceFeedbackFunction) {
  return async (answer: MultipleChoiceAnswer): Promise<MultipleChoiceFeedback> => {
    const result = await Promise.resolve(base(answer))
    const rowCorrectness = correctMapping.map((c, i) => answer.choice[i] === c)
    return { ...result, rowCorrectness }
  }
}

function generateMatchVariant(lang: Language, path: string, random: Random) {
  const nSets = random.int(4, 5)
  const fixed: string[] = []
  const movable: string[] = []

  let attempts = 0
  while (fixed.length < nSets && attempts < maxAttempts) {
    attempts++

    const template = random.choice(templates)
    const domain: Domain = random.choice(["N", "Z"])
    const param = template.paramRange(random)

    // generate once and share between build/labels
    const cfg = template.generateConfig(domain, param, random)

    const elements = template.build(domain, param, cfg)
    if (elements.length === 0) continue

    // full explicit set, sorted and deduped
    const elementsSorted = Array.from(new Set(elements)).sort((a, b) => a - b)

    // skip sets that would be too large for matching
    if (elementsSorted.length > maxMatchSize) continue

    const explicit = `$\\{ ${elementsSorted.join(", ")} \\}$`
    if (movable.includes(explicit)) continue

    const variants = template.labels(lang, domain, param, cfg)
    const label = `\\[` + random.choice(variants) + `\\]`

    fixed.push(label)
    movable.push(explicit)
  }

  if (fixed.length < nSets) {
    throw new Error("Could not generate enough small sets for matching")
  }

  const movableShuffled = random.shuffle([...movable])
  const solution = movable.map((exp) => movableShuffled.indexOf(exp))

  const baseFeedback = minimalMultipleChoiceFeedback({
    correctAnswerIndex: solution,
    sorting: true,
  })

  const feedback = matchingRowFeedback(solution, baseFeedback)

  const question: MultipleChoiceQuestion = {
    type: "MultipleChoiceQuestion",
    name: SetBuilderQuestion.name(lang),
    path: path,
    sorting: true,
    matching: true,
    text: t(translations, lang, "match"),
    fixedItems: fixed,
    answers: movableShuffled,
    feedback,
  }

  return { question }
}

function generateFreeTextVariant(lang: Language, path: string, random: Random) {
  const template = random.choice(templates)
  const dom: Domain = random.choice(["N", "Z"])
  const param = template.paramRange(random)

  const cfg = template.generateConfig(dom, param, random)
  const elements = template.build(dom, param, cfg)

  const sorted = Array.from(new Set(elements)).sort((a, b) => a - b)
  const correctSet = new Set(sorted)
  const expression = random.choice(template.labels(lang, dom, param, cfg))

  // also accept negative integers
  const checkFormat = (a: FreeTextAnswer) => {
    const input = a.text.trim()
    const isValid = /^\{\s*(-?\d+)(\s*,\s*-?\d+)*\s*\}$/.test(input)
    return isValid ? { valid: true } : { valid: false, message: t(translations, lang, "checkFormat") }
  }

  const feedback = (a: FreeTextAnswer): FreeTextFeedback => {
    const match = a.text.trim().match(/^\{\s*(.*?)\s*\}$/)
    if (!match) return { correct: false }

    const user = match[1]
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
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

export { translations } from "./translations"
