import type { MultiFreeTextQuestion, QuestionGenerator} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { RandomGraph, RootedTree } from "@shared/utils/graph.ts"
import Random from "@shared/utils/random"
import { t, tFunctional, type Translations } from "@shared/utils/translations"

/**
 * All displayed text goes into the translations object.
 * Include at least english and german.
 */
const translations: Translations = {
  en: {
    name: "Graph Generators",
    description: "Shows graph examples",
    text: "Directed: {{directed}}\n\nUndriected:{{undirected}}\n\nDraggable Nodes:{{interactive}}\n\nTrees:{{tree}}",
  },
}

/**
 * This question generator generates a simple multiple choice question.
 */
export const DemoGraphs: QuestionGenerator = {
  id: "demogg",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["demo"],
  languages: ["en", "de"],
  license: "MIT",
  expectedParameters: [],

  /**
   * @param lang The language of the question
   * @param parameters The parameters for the question. In this case none are used.
   * @param seed The seed for the random number generator
   * @returns
   */
  generate(lang = "en", parameters, seed) {
    const random = new Random(seed)

    const graphs = {
      directed: RandomGraph.grid(
        random,
        [5, 4],
        0.3,
        random.choice(["square", "triangle", "square-width-diagonals"]),
        random.choice(["random", "unique", null]),
        true,
        random.bool(),
        false,
      ).toMarkdown(),
      undirected: RandomGraph.grid(
        random,
        [5, 4],
        0.3,
        random.choice(["square", "triangle", "square-width-diagonals"]),
        random.choice(["random", "unique", null]),
        false,
        random.bool(),
        random.bool(),
      ).toMarkdown(),
      interactive: RandomGraph.grid(
        random,
        [5, 4],
        0.3,
        random.choice(["square", "triangle", "square-width-diagonals"]),
        random.choice(["random", "unique", null]),
        random.bool(),
        random.bool(),
        random.bool(),
      )
        .setDraggable(true)
        .toMarkdown(),
      tree: RootedTree.random({ min: 2, max: 4 }, { min: 2, max: 3 }, random).toGraph().toMarkdown(),
    }

    const question: MultiFreeTextQuestion = {
      type: "MultiFreeTextQuestion",
      name: DemoGraphs.name(lang),
      path: serializeGeneratorCall({
        generator: DemoGraphs,
        lang,
        parameters,
        seed,
      }),
      text: t(translations, lang, "text", graphs),
      feedback: () => {
        return { correct: false }
      },
    }

    return {
      question,
    }
  },
}
