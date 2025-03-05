import type {
  FreeTextAnswer,
  FreeTextFormatFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import {
  createRandomGraph,
  runDijkstra,
  type DijkstraResult,
} from "@shared/question-generators/graph-algorithms/utils"
import Random from "@shared/utils/random"
import { t, tFunctional, type Translations } from "@shared/utils/translations"

const translations: Translations = {
  en: {
    name: "Dijkstra's Algorithm: Order",
    description: "Determine node prioritization in Dijkstra’s algorithm.",
    prompt: "Order of node removal:",
    invalid_node: '"{{n}}" is not a node in the graph.',
    feedback_node_count: "The answer does not include the correct number of nodes.",
    feedback_order: "The order is incorrect starting at node {{n}} (position {{i}}).",
    start_node: "Start node",
  },
  de: {
    name: "Dijkstras Algorithmus",
    description: "Bestimme Priorisierung der Knoten im Dijkstra-Algorithmus.",
    prompt: "Reihenfolge der Knotenentfernung:",
    invalid_node: '"{{n}}" ist kein Knoten im Graphen.',
    feedback_node_count: "Die Antwort enthält nicht die richtige Anzahl von Knoten.",
    feedback_order: "Die Reihenfolge ist ab dem Knoten {{n}} (Position {{i}}) falsch.",
    start_node: "Startknoten",
  },
}

function parseNodeOrder(text: string): string[] {
  return text
    .split(/[\s,]+/)
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s !== "")
}

export const DijkstraAlgorithm: QuestionGenerator = {
  id: "dijkstra",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["graph", "dijkstra", "shortest path"],
  languages: ["en", "de"],
  license: "MIT",
  expectedParameters: [
    {
      name: "size",
      description: tFunctional(translations, "description"),
      type: "integer",
      min: 4,
      max: 8,
    },
  ],

  generate: (lang = "en", parameters, seed) => {
    const random = new Random(seed)
    const size = parameters.size as number
    const graph = createRandomGraph(random, size, 0.6)

    const startNode = random.choice(graph.nodes.map((node) => node.label)) ?? "A" // randomized start node
    const result: DijkstraResult = runDijkstra(graph, startNode)
    const correctOrder = result.order ?? []

    const checkFormat: FreeTextFormatFunction = (answer: FreeTextAnswer) => {
      const order = parseNodeOrder(answer.text)

      for (const node of order) {
        if (!graph.nodes.some((n) => n.label === node)) {
          return {
            valid: false,
            message: t(translations, lang, "invalid_node", { n: node }),
          }
        }
      }

      return { valid: true, message: "" }
    }

    const feedback = ({ text }: { text: string }) => {
      const answerOrder = parseNodeOrder(text)

      if (answerOrder.length !== correctOrder.length) {
        return {
          correct: false,
          correctAnswer: correctOrder.join(", "),
          feedbackText: t(translations, lang, "feedback_node_count"),
        }
      }

      for (let i = 0; i < answerOrder.length; i++) {
        if (answerOrder[i] !== correctOrder[i]) {
          return {
            correct: false,
            correctAnswer: correctOrder.join(", "),
            feedbackText: t(translations, lang, "feedback_order", {
              n: answerOrder[i],
              i: (i + 1).toString(),
            }),
          }
        }
      }

      return { correct: true }
    }

    const question: FreeTextQuestion = {
      type: "FreeTextQuestion",
      name: DijkstraAlgorithm.name(lang),
      path: serializeGeneratorCall({ generator: DijkstraAlgorithm, lang, parameters, seed }),
      text: `${t(translations, lang, "description")}\n\n${graph.toMarkdown()}\n\n${t(translations, lang, "start_node")}: **${startNode}**`,
      prompt: t(translations, lang, "prompt"),
      placeholder: "A, B, C, ...",
      checkFormat,
      feedback,
      typingAid: graph.nodes.map((node) => ({
        text: `$${node.label}$`,
        input: `${node.label},`,
        label: `Insert node ${node.label}`,
      })),
    }
    return { question }
  },
}
