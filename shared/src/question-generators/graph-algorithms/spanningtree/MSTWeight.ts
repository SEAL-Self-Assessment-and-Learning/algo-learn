import type { Language } from "@shared/api/Language.ts"
import type {
  FreeTextFeedbackFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { computeAllMST } from "@shared/question-generators/graph-algorithms/spanningtree/primAlgo.ts"
import { RandomGraph } from "@shared/utils/graph.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, type Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Minimum Spanning Tree (Weight)",
    description: "Compute the weight of a minimum spanning tree",
    task: "Given the graph $G$: {{0}} Compute the weight of the minimum spanning tree.",
    fdParse: "Your response could not be converted into an integer.",
  },
  de: {
    name: "Minimaler Spannbaum (Gewicht)",
    description: "Berechne das Gewicht eines minimalen Spannbaums",
    task: "Gegeben ist der Graph $G$: {{0}} Berechne das Gewicht des minimalen Spannbaums.",
    fdParse: "Deine Antwort konnte nicht in eine ganze Zahl umgewandelt werden.",
  },
}

export const MSTWeightGen: QuestionGenerator = {
  id: "mstweight",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["MST"],
  languages: ["en", "de"],
  license: "MIT",
  expectedParameters: [
    {
      name: "size",
      description: tFunctional(translations, "param_size"),
      type: "integer",
      min: 2,
      max: 4,
    },
  ],

  generate: (lang = "en", parameters, seed) => {
    const permaLink = serializeGeneratorCall({
      generator: MSTWeightGen,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)
    const size = parameters.size as number

    // Todo: Change this graph to something more random
    const G = RandomGraph.grid(random, [size, size], 1, "square-width-diagonals", "random", false, false)
    G.edgeClickType = "select"
    G.nodeDraggable = false
    const startNode = random.choice(G.nodes)
    const MST = computeAllMST(G, startNode)[0].mst
    const mstWeight = MST.reduce((acc, x) => acc + (x.value ?? 1), 0)

    const question: FreeTextQuestion = {
      type: "FreeTextQuestion",
      name: MSTWeightGen.name(lang),
      path: permaLink,
      text: t(translations, lang, "task", [G.toMarkdown()]),
      feedback: getFeedback(mstWeight, lang),
    }
    return { question }
  },
}

/**
 * Feedback function parsing the user input and checking for correctness
 * @param mstWeight
 * @param lang
 */
function getFeedback(mstWeight: number, lang: Language): FreeTextFeedbackFunction {
  return ({ text }) => {
    if (text.trim() === "") {
      return { correct: false, correctAnswer: mstWeight.toString() }
    }
    const answer = text.replaceAll(" ", "")
    const answerValue = Number.parseInt(answer, 10)

    if (Number.isNaN(answerValue)) {
      return {
        correct: false,
        correctAnswer: mstWeight.toString(),
        feedbackText: t(translations, lang, "fdParse"),
      }
    }
    if (answerValue !== mstWeight) {
      return { correct: false, correctAnswer: mstWeight.toString() }
    }

    return {
      correct: true,
    }
  }
}
