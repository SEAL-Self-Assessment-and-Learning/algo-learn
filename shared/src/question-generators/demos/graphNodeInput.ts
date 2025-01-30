import type { MultiFreeTextQuestion, QuestionGenerator } from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { RandomGraph, type Graph } from "@shared/utils/graph.ts"
import Random from "@shared/utils/random"
import { t, tFunctional, type Translations } from "@shared/utils/translations"

/**
 * All displayed text goes into the translations object.
 * Include at least english and german.
 */
const translations: Translations = {
  en: {
    name: "Graph Node Input Question",
    description: "Select specific nodes.",
    text: "Put all nodes labeled with an vocal in one group and the rest in another group. {{0}}",
  },
  de: {
    name: "Graph-Knoten-Eingabefrage",
    description: "Wähle bestimmte Knoten aus.",
    text: "Platziere alle Knoten mit einem Vokal beschriftet in eine Gruppe und die restlichen Knoten in eine andere. {{0}}",
  },
}

/**
 * This question generator generates a simple multiple choice question.
 */
export const DemoGraphNodeInput: QuestionGenerator = {
  id: "demogni",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["demo"],
  languages: ["en", "de"],
  license: "MIT",
  expectedParameters: [],

  /**
   * Generates a new Graph Input question.
   *
   * @param lang The language of the question
   * @param parameters The parameters for the question. In this case none are used.
   * @param seed The seed for the random number generator
   * @returns A new MultipleChoiceQuestion question
   */
  generate: (lang = "en", parameters, seed) => {
    const permaLink = serializeGeneratorCall({
      generator: DemoGraphNodeInput,
      lang,
      parameters,
      seed,
    })
    // initialize the RNG so the question can be generated again
    const random = new Random(seed)

    const graph: Graph = RandomGraph.grid(
      random,
      [6, 3],
      0.7,
      "square-width-diagonals",
      null,
      false,
      false,
    )
    graph.nodeDraggable = false
    graph.nodeClickType = "group"
    graph.edgeClickType = "select"
    graph.nodeGroupMax = 2
    graph.inputFields = true

    // generate the question object
    const question: MultiFreeTextQuestion = {
      type: "MultiFreeTextQuestion",
      name: DemoGraphNodeInput.name(lang),
      path: permaLink,
      text: t(translations, lang, "text", [graph.toMarkdown()]),
    }

    return {
      question,
    }
  },
}
