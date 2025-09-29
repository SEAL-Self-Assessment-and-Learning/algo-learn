import type { MultiFreeTextQuestion, QuestionGenerator } from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { RandomGraph } from "@shared/utils/graph.ts"
import Random from "@shared/utils/random"
import { t, tFunctional, type Translations } from "@shared/utils/translations"

/**
 * All displayed text goes into the translations object.
 * Include at least english and german.
 */
const translations: Translations = {
  en: {
    name: "Draggable Graph Generators",
    description: "Shows draggable graph examples",
    text: "Dragging Nodes and Edges:{{0}}",
  },
}

/**
 * This question generator generates a simple multiple free text question.
 */
export const DemoDraggingGraphs: QuestionGenerator = {
  id: "demoggdrag",
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

    const graphInteractive = RandomGraph.grid(
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
      .toMarkdown()

    const question: MultiFreeTextQuestion = {
      type: "MultiFreeTextQuestion",
      name: DemoDraggingGraphs.name(lang),
      path: serializeGeneratorCall({
        generator: DemoDraggingGraphs,
        lang,
        parameters,
        seed,
      }),
      text: t(translations, lang, "text", [graphInteractive]),
      feedback: () => {
        return { correct: false }
      },
    }

    return {
      question,
    }
  },
}
