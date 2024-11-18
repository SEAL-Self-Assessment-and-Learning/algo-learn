import {
  FreeTextAnswer,
  FreeTextFormatFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { Graph, RandomGraph } from "@shared/utils/graph"
import { t, tFunctional, Translations } from "@shared/utils/translations"
import Random from "@shared/utils/random"

const translations: Translations = {
  en: {
    name: "Dijkstra's Algorithm",
    description:
      "Determine the node order removed from the priority queue when running Dijkstra's algorithm.",
    prompt: "Order of node removal:",
    invalid_node: '"{{n}}" is not a node in the graph.',
    feedback_node_count: "The answer does not include the correct number of nodes.",
    feedback_order: "The order is incorrect starting at node {{n}} (position {{i}}).",
  },
  de: {
    name: "Dijkstras Algorithmus",
    description: "Gib die Reihenfolge der Knoten an, wie sie aus der Prioritätswarteschlange entfernt werden.",
    prompt: "Reihenfolge der Knotenentfernung:",
    invalid_node: '"{{n}}" ist kein Knoten im Graphen.',
    feedback_node_count: "Die Antwort enthält nicht die richtige Anzahl von Knoten.",
    feedback_order: "Die Reihenfolge ist ab dem Knoten {{n}} (Position {{i}}) falsch.",
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
      min: 2,
      max: 6,
    },
  ],

  generate: (lang = "en", parameters, seed) => {
    const random = new Random(seed)
    const sizeRange = parameters.size as number;
    const width = random.int(2, sizeRange);
    const height = random.int(2, sizeRange);

    const graph = RandomGraph.grid(
      random,
      [width, height],
      0.6,
      random.choice(["square", "square-width-diagonals", "triangle"]),
      "unique",
      true,
      true,
    );
    graph.nodeDraggable = false;

    const startNode = graph.nodes[0].label ?? "A"
    const correctOrder = runDijkstra(graph, startNode)

    console.log("Expected Order of Node Removal:", correctOrder.join(", "))

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
      text: `${t(translations, lang, "description")}\n\nStart node: **${startNode}**\n\n${graph.toMarkdown()}`,
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

function runDijkstra(graph: Graph, startLabel: string): string[] {
  const distances: Record<string, number> = {}
  const visited: Set<string> = new Set()
  const priorityQueue: [string, number][] = []

  graph.nodes.forEach((node) => {
    const label = node.label ?? ""
    distances[label] = Infinity
  })
  distances[startLabel] = 0
  priorityQueue.push([startLabel, 0])

  const orderOfRemoval: string[] = []

  while (priorityQueue.length > 0) {
    // sort queue by distance and remove the node with the smallest distance
    priorityQueue.sort((a, b) => a[1] - b[1])
    const [currentNode, currentDist] = priorityQueue.shift() as [string, number]
    if (visited.has(currentNode)) continue

    visited.add(currentNode)
    orderOfRemoval.push(currentNode)

    // explore neighbors
    const currentNodeIndex = graph.nodes.findIndex((n) => n.label === currentNode)
    if (currentNodeIndex === -1) continue

    graph.getNeighbors(currentNodeIndex).forEach((edge) => {
      const neighborLabel = graph.nodes[edge.target]?.label
      if (!neighborLabel) return
      const edgeWeight = edge.value ?? Infinity

      if (distances[neighborLabel] > currentDist + edgeWeight) {
        distances[neighborLabel] = currentDist + edgeWeight
        priorityQueue.push([neighborLabel, distances[neighborLabel]])
      }
    })
  }

  return orderOfRemoval
}