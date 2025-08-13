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
    name: "Matching",
    description: "Match Greek letters with their symbols",
    text: "Match the following Greek letters with their symbols:",
  },
  de: {
    name: "Zuordnung",
    description: "Ordne griechische Buchstaben ihren Symbolen zu",
    text: "Ordne die folgenden griechischen Buchstaben ihren Symbolen zu:",
  },
}

// full set of pairings
const pairs: [string, string][] = [
  ["Alpha", "$\\alpha$"],
  ["Beta", "$\\beta$"],
  ["Gamma", "$\\gamma$"],
  ["Delta", "$\\delta$"],
  ["Epsilon", "$\\epsilon$"],
  ["Zeta", "$\\zeta$"],
  ["Eta", "$\\eta$"],
  ["Theta", "$\\theta$"],
  ["Iota", "$\\iota$"],
  ["Kappa", "$\\kappa$"],
  ["Lambda", "$\\lambda$"],
  ["Mu", "$\\mu$"],
  ["Nu", "$\\nu$"],
  ["Xi", "$\\xi$"],
  ["Omicron", "$\\omicron$"],
  ["Pi", "$\\pi$"],
  ["Rho", "$\\rho$"],
  ["Sigma", "$\\sigma$"],
  ["Tau", "$\\tau$"],
  ["Upsilon", "$\\upsilon$"],
  ["Phi", "$\\phi$"],
  ["Chi", "$\\chi$"],
  ["Psi", "$\\psi$"],
  ["Omega", "$\\omega$"],
]

export const DemoMatching: QuestionGenerator = {
  id: "demom",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["demo"],
  languages: ["en", "de"],
  license: "MIT",
  expectedParameters: [],

  generate: (lang = "en", parameters, seed) => {
    const random = new Random(seed)

    const n = random.int(5, 11)
    const chosenPairs = random.subset(pairs, n)

    // shuffle chosen pairs
    const shuffledPairs = random.shuffle(chosenPairs)

    const left = shuffledPairs.map(([l]) => l)
    const right = shuffledPairs.map(([, r]) => r)

    // shuffle sortable column
    const rightShuffled = random.shuffle(right)

    // correct order mapping
    const solution = left.map((l) => rightShuffled.indexOf(chosenPairs.find(([pl]) => pl === l)![1]))

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
      name: DemoMatching.name(lang),
      path: serializeGeneratorCall({
        generator: DemoMatching,
        lang,
        parameters,
        seed,
      }),
      sorting: true,
      matching: true,
      text: t(translations, lang, "text"),
      left, // fixed column
      answers: rightShuffled, // sortable column
      feedback,
    }

    return { question }
  },
}
