import { Language } from "@shared/api/Language"
import {
  MultiFreeTextFeedbackFunction,
  MultiFreeTextFormatFunction,
  MultiFreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { Graph, RandomGraph } from "@shared/utils/graph"
import Random from "@shared/utils/random"
import { t, tFunctional, Translations } from "@shared/utils/translations"

const translations: Translations = {
  en: {
    name: "Dijkstra Table",
    description: "Fill in the table with distances between nodes using Dijkstra's algorithm.",
    tableQuestion:
      "Given the following undirected graph with weighted edges, determine the shortest paths from node $A$ to all other nodes using Dijkstra's algorithm.",
    tablePrompt:
      "To do this, fill in the table below, where each row corresponds to a step of the algorithm. The column $d$ should contain the current distance value of the node, the column $p$ the current predecessor of the node in the parent array.",
    invalid_set: "Invalid node set.",
    invalid_dist: "Invalid distance.",
    invalid_pred: "Invalid predecessor.",
    set: "Set",
  },
  de: {
    name: "Dijkstra Tabelle",
    description:
      "Nutze den Dijkstra-Algorithmus um die Tabelle mit den Entfernungen zwischen Knoten auszufüllen",
    tableQuestion:
      "Nutze den Dijkstra-Algorithmus um im folgenden ungerichteten Graphen mit Kantengewichten die kürzesten Wege vom Knoten $A$ zu allen anderen Knoten u bestimmen.",
    tablePrompt:
      "Fülle dazu die Tabelle aus, wobei jede Zeile einem Schritt des Algorithmus entspricht. Die Spalte $d$ soll den aktuellen Entfernungswert des Knotens enthalten, die Spalte $p$ den aktuellen Vorgänger des Knotens im Elternarray.",
    invalid_set: "keine gültige Knotenmenge.",
    invalid_dist: "keine gültige Distanz.",
    invalid_pred: "kein gültiger Abstand.",
    set: "Menge",
  },
}

export const DijkstraTableGenerator: QuestionGenerator = {
  id: "dijkstraTable",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["graph", "dijkstra", "table"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      name: "size",
      type: "integer",
      min: 1,
      max: 3,
    },
  ],

  generate: (lang: Language, parameters, seed) => {
    const random = new Random(seed)
    const graph = generateRandomGraph(random, parameters.size as number)
    const startNode = graph.nodes[0].label ?? "A"
    const { steps } = generateDijkstraSteps(graph, startNode)
    const permalink = serializeGeneratorCall({
      generator: DijkstraTableGenerator,
      lang,
      parameters,
      seed,
    })

    const table = getDijkstraInputTable(steps, graph, lang)
    const feedback = getFeedbackFunction(steps, graph)
    const checkFormat = getCheckFormatFunction(lang, graph)

    console.log("debug", cheatForDebugging(steps, graph))

    const question: MultiFreeTextQuestion = {
      type: "MultiFreeTextQuestion",
      path: permalink,
      name: t(translations, lang, "name"),
      fillOutAll: true,
      text: `${t(translations, lang, "tableQuestion")}\n${graph.toMarkdown()}\n${t(translations, lang, "tablePrompt")}\n\n${table}`,
      feedback,
      checkFormat,
    }

    return { question }
  },
}

function cheatForDebugging(
  steps: Array<{
    set: Set<string>
    distances: Record<string, string>
    predecessors: Record<string, string>
  }>,
  graph: Graph,
): string {
  return steps
    .map((step) => {
      const expectedSet = `{${[...step.set].join(", ")}}`
      const nodeFeedback = graph.nodes
        .map((node) => {
          const nodeLabel = node.label!
          const expectedDistance = step.distances[nodeLabel] || "-"
          const expectedPredecessor = step.predecessors[nodeLabel] || "-"
          return `${expectedDistance} | ${expectedPredecessor}`
        })
        .join(" | ")

      return `| ${expectedSet} | ${nodeFeedback} |`
    })
    .join("\n")
}

function generateRandomGraph(random: Random, size: number): Graph {
  const width = random.int(1, size)
  const height = random.int(1, size)

  return RandomGraph.grid(
    random,
    [width, height],
    0.6,
    random.choice(["square", "square-width-diagonals", "triangle"]),
    "unique",
    false,
    true,
  )
}

function getDijkstraInputTable(
  steps: Array<{
    set: Set<string>
    distances: Record<string, string>
    predecessors: Record<string, string>
  }>,
  graph: Graph,
  lang: Language,
): string {
  const nodes = graph.nodes.map((n) => n.label!)

  const headerRow = `| ${t(translations, lang, "set")} $S$ | ${nodes.map((n) => `${n} | |`).join("")}\n`
  const subHeaderRow = `|   | ${nodes.map(() => "d | p |").join("")}\n`
  const separatorRow = `|---|${nodes.map(() => "---:|---|").join("")}\n`

  const rows = steps
    .map((_, stepIndex) => {
      const setField = `step${stepIndex}_s`
      const nodeFields = nodes
        .map((node) => `{{step${stepIndex}_${node}_d#TL#}} | {{step${stepIndex}_${node}_p#TL#}}`)
        .join(" | ")

      return `| {{${setField}#TL#}} | ${nodeFields} |`
    })
    .join("\n")

  return `${headerRow}${separatorRow}${subHeaderRow}${rows}`
}

function getCheckFormatFunction(lang: Language, graph: Graph): MultiFreeTextFormatFunction {
  const nodeLabels = new Set(graph.nodes.map((node) => node.label ?? ""))
  return ({ text }, fieldID) => {
    const input = text[fieldID]?.trim()
    if (!input) return { valid: false, message: "" }

    if (fieldID.includes("_s")) {
      const isValidSet = /^\{[A-Z](, *[A-Z])*\}$/i.test(input)
      const setElements = input
        .replace(/[{}]/g, "") // Remove curly braces
        .split(/,\s*/)
        .filter((label) => label) // Split and filter non-empty labels
      const allValidNodes = setElements.every((label) => nodeLabels.has(label))
      return {
        valid: isValidSet && allValidNodes,
        message: isValidSet && allValidNodes ? "" : t(translations, lang, "invalid_set"),
      }
    }

    return fieldID.includes("_d")
      ? {
          valid: /^[-0-9]+$/i.test(input),
          message: /^[-0-9]+$/i.test(input) ? "" : t(translations, lang, "invalid_dist"),
        }
      : fieldID.includes("_p")
        ? {
            valid: /^[-A-Z]+$/i.test(input) && (input === "-" || nodeLabels.has(input)),
            message:
              /^[-A-Z]+$/i.test(input) && (input === "-" || nodeLabels.has(input))
                ? ""
                : t(translations, lang, "invalid_pred"),
          }
        : { valid: false, message: "" }
  }
}

function getFeedbackFunction(
  steps: Array<{
    set: Set<string>
    distances: Record<string, string>
    predecessors: Record<string, string>
  }>,
  graph: Graph,
): MultiFreeTextFeedbackFunction {
  return ({ text }) => {
    let allStepsCorrect = true
    console.log("debug:")
    const feedbackDetails = steps
      .map((step, stepIndex) => {
        const setField = `step${stepIndex}_s`
        const userSet = text[setField]?.trim() || "-"
        const expectedSet = `{${[...step.set].join(", ")}}`
        console.log("${expectedSet}")

        if (userSet !== expectedSet) allStepsCorrect = false

        const nodeFeedback = graph.nodes
          .map((node) => {
            const nodeLabel = node.label!

            const distanceField = `step${stepIndex}_${nodeLabel}_d`
            const userDistance = text[distanceField]?.trim() || "-"
            const expectedDistance = step.distances[nodeLabel] || "-"

            const predecessorField = `step${stepIndex}_${nodeLabel}_p`
            const userPredecessor = text[predecessorField]?.trim() || "-"
            const expectedPredecessor = step.predecessors[nodeLabel] || "-"

            if (userDistance !== expectedDistance || userPredecessor !== expectedPredecessor) {
              allStepsCorrect = false
            }
            console.log("${step.distances[nodeLabel]} | ${step.predecessors[nodeLabel]}")
            return `${expectedDistance} | ${expectedPredecessor}`
          })
          .join(" | ")

        return `| {{${setField}#${userSet}}} | ${nodeFeedback} |`
      })
      .join("\n")

    return {
      correct: allStepsCorrect,
      correctAnswer: feedbackDetails,
    }
  }
}

function generateDijkstraSteps(graph: Graph, startLabel: string) {
  const distances: Record<string, number> = {}
  const predecessors: Record<string, string> = {}
  const visited = new Set<string>()
  const priorityQueue: [string, number][] = []
  const steps: Array<{
    set: Set<string>
    distances: Record<string, string>
    predecessors: Record<string, string>
  }> = []

  graph.nodes.forEach((node) => {
    const label = node.label ?? ""
    distances[label] = Infinity
    predecessors[label] = "-"
  })
  distances[startLabel] = 0
  priorityQueue.push([startLabel, 0])

  while (priorityQueue.length > 0) {
    priorityQueue.sort((a, b) => a[1] - b[1])
    const [currentNode, currentDist] = priorityQueue.shift()!
    if (visited.has(currentNode)) continue

    visited.add(currentNode)

    const currentDistances = mapDistances(distances)
    const currentPredecessors = { ...predecessors }

    steps.push({
      set: new Set(visited),
      distances: currentDistances,
      predecessors: currentPredecessors,
    })

    updateNeighbors(graph, currentNode, currentDist, distances, predecessors, priorityQueue)
  }

  return { steps }
}

function mapDistances(distances: Record<string, number>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(distances).map(([key, value]) => [key, value === Infinity ? "-" : value.toString()]),
  )
}

function updateNeighbors(
  graph: Graph,
  currentNode: string,
  currentDist: number,
  distances: Record<string, number>,
  predecessors: Record<string, string>,
  priorityQueue: [string, number][],
): void {
  const currentNodeIndex = graph.nodes.findIndex((n) => n.label === currentNode)
  if (currentNodeIndex === -1) return

  graph.getNeighbors(currentNodeIndex).forEach((edge) => {
    const neighborLabel = graph.nodes[edge.target]?.label
    if (!neighborLabel) return

    const edgeWeight = edge.value ?? Infinity

    if (distances[neighborLabel] > currentDist + edgeWeight) {
      distances[neighborLabel] = currentDist + edgeWeight
      predecessors[neighborLabel] = currentNode
      priorityQueue.push([neighborLabel, distances[neighborLabel]])
    }
  })
}
