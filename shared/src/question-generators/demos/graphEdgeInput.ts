import type { MultiFreeTextQuestion, QuestionGenerator } from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { bfs, mapNumberToNodeLabel } from "@shared/question-generators/demos/graphNodeInput.ts"
import { RandomGraph, type Graph, type Node } from "@shared/utils/graph.ts"
import Random from "@shared/utils/random"
import { t, tFunctional, type Translations } from "@shared/utils/translations"

/**
 * All displayed text goes into the translation object.
 * Include at least english and german.
 */
const translations: Translations = {
  en: {
    name: "Graph Edge Input Question",
    description: "Select all edges of a path.",
    text: "Select all edges on any path starting from node $ {{1}}$ reaching node $ {{2}}$. {{0}}",
  },
  de: {
    name: "Graph-Kanten-Eingabefrage",
    description: "Wähle Kanten von einem Pfad aus.",
    text: "Wähle alle Kanten auf irgendeinem Pfad aus, der bei Knoten ${{1}}$ beginnt und bei Knoten ${{2}}$ endet. {{0}}",
  },
}

/**
 * This question generator generates a simple multiple choice question.
 */
export const DemoGraphEdgeInput: QuestionGenerator = {
  id: "demogei",
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
      generator: DemoGraphEdgeInput,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)

    let graph: Graph
    let startNode: Node
    let reachableNodesIDs: number[]
    do {
      graph = RandomGraph.grid(random, [6, 3], 0.6, "square-width-diagonals", null, false, false)
      graph.nodeDraggable = false
      graph.edgeClickType = "select"
      graph.edgeGroupMax = 3
      graph.inputFields = true

      startNode = random.choice(graph.nodes)
      reachableNodesIDs = bfs(graph, startNode)
    } while (reachableNodesIDs.length < 2)

    const reachableNodesLabels = mapNumberToNodeLabel(reachableNodesIDs)
    const endNode = random.choice(reachableNodesLabels.filter((node) => node !== startNode.label!))

    const question: MultiFreeTextQuestion = {
      type: "MultiFreeTextQuestion",
      name: DemoGraphEdgeInput.name(lang),
      path: permaLink,
      text: t(translations, lang, "text", [graph.toMarkdown(), startNode.label!, endNode]),
      // The Graph will handle checkFormat on its own
      // feedback: getFeedback(reachableNodesIDs, graph, lang),
    }

    return {
      question,
    }
  },
}
