import type { FreeTextQuestion, QuestionGenerator } from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { kruskalAlgorithm } from "@shared/question-generators/graph-algorithms/spanningtree/kruskalAlgo.ts"
import { RandomGraph } from "@shared/utils/graph.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, type Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Kruskal Algorithm",
    description: "Correctly execute the Kruskal algorithm",
    param_size: "Tree size",
    task: "Given the graph $G$: {{0}} Please provide",
  },
  de: {},
}

export const Kruskal: QuestionGenerator = {
  id: "kruskal",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: [],
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
      generator: Kruskal,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)
    const size = parameters.size as number

    const G = RandomGraph.grid(random, [size, size], 1, "square-width-diagonals", "random", false, false)
    kruskalAlgorithm(G)

    const question: FreeTextQuestion = {
      type: "FreeTextQuestion",
      name: Kruskal.name(lang),
      path: permaLink,
      text: t(translations, lang, "task", [G.toMarkdown()]),
      placeholder: "A, B, C, ...",
    }

    return { question }
  },
}
