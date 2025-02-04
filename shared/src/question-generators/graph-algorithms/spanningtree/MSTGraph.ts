import type { Language } from "@shared/api/Language.ts"
import type {
  MultiFreeTextFeedbackFunction,
  MultiFreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { kruskalAlgorithm } from "@shared/question-generators/graph-algorithms/spanningtree/kruskalAlgo.ts"
import { primAlgorithm } from "@shared/question-generators/graph-algorithms/spanningtree/primAlgo.ts"
import { type Graph, RandomGraph } from "@shared/utils/graph.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, type Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Minimum Spanning Tree (Graph)",
    description: "Compute a minimum spanning tree",
    task: `Given the graph $G$: {{0}} 
           Compute a minimum spanning tree by selecting the edges in the graph above.`,
    fdEdgeAmount: `You have selected $ {{0}} $ edges, but the minimum spanning tree includes exactly $ {{1}} $ edges.`,
  },
  de: {},
}

export const MSTGraphGen: QuestionGenerator = {
  id: "mstgraph",
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
      min: 3, // 2
      max: 3, // 4
    },
  ],

  generate: (lang = "en", parameters, seed) => {
    const permaLink = serializeGeneratorCall({
      generator: MSTGraphGen,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)
    const size = parameters.size as number

    // Todo: Change this graph something more random
    const G = RandomGraph.grid(random, [size, size], 1, "square-width-diagonals", "random", false, false)
    G.edgeClickType = "select"

    const question: MultiFreeTextQuestion = {
      type: "MultiFreeTextQuestion",
      name: MSTGraphGen.name(lang),
      path: permaLink,
      text: t(translations, lang, "task", [G.toMarkdown()]),
      feedback: getFeedback(G, random, lang),
    }
    return { question }
  },
}

function getFeedback(graph: Graph, random: Random, lang: Language): MultiFreeTextFeedbackFunction {
  return () => {
    const MST = random.bool()
      ? kruskalAlgorithm(graph)
      : primAlgorithm(graph, random.choice(graph.nodes))
    const selectedEdges = graph.edges.flat().filter((x) => x.group !== null && x.group !== undefined)
    if (selectedEdges.length !== graph.getNumNodes() - 1) {
      return {
        correct: false,
        correctAnswer: graph.toMarkdown(),
        feedbackText: t(translations, lang, "fdEdgeAmount", [
          selectedEdges.length.toString(),
          MST.length.toString(),
        ]),
      }
    }

    return {
      correct: true,
    }
  }
}
