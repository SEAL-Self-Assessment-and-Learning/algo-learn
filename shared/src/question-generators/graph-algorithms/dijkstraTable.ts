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
      min: 2,
      max: 4,
    },
  ],

  generate: (lang: Language, parameters, seed) => {
    const random = new Random(seed)

    const { graph, steps } = generateRandomGraphWithSteps(random, parameters.size as number)

    const permalink = serializeGeneratorCall({
      generator: DijkstraTableGenerator,
      lang,
      parameters,
      seed,
    })

    const table = getDijkstraInputTable(steps, graph, lang)
    const feedback = getFeedbackFunction(steps, graph)
    const checkFormat = getCheckFormatFunction(lang, graph)

    console.log("debug:\n", cheatForDebugging(steps, graph))

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

interface DijkstraResult {
  graph: Graph
  steps: Array<{
    set: Set<string>
    distances: Record<string, string>
    predecessors: Record<string, string>
  }>
}

function generateRandomGraphWithSteps(random: Random, size: number): DijkstraResult {
  const maxRetries = 100
  let retries = 0
  let edgeChance = 0.6

  // guarantee more than one row in the algorithm
  while (retries < maxRetries) {
    const graph = createRandomGraph(random, size, edgeChance)
    const steps = getDijkstraStepsIfValid(graph)
    if (steps && steps.length > 1) {
      return { graph, steps }
    }

    // increment retries and adjust edgeChance for next attempt
    retries++
    edgeChance += 0.1 // make graph denser on retry
    console.log("retries so far:", retries)
  }

  throw new Error("Unable to generate a valid graph with more than one row after 100 retries.")
}

function createRandomGraph(random: Random, size: number, edgeChance: number): Graph {
  const width = random.int(2, size)
  const height = random.int(1, size)

  return RandomGraph.grid(
    random,
    [width, height],
    edgeChance,
    random.choice(["square", "square-width-diagonals", "triangle"]),
    "unique",
    false,
    true,
  )
}

function getDijkstraStepsIfValid(graph: Graph): DijkstraResult["steps"] | null {
  const startNode = graph.nodes[0]?.label ?? "A"
  const { steps } = generateDijkstraSteps(graph, startNode)
  // return steps only if algorithm is long enough
  return steps.length > 1 ? steps : null
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

  const headerRow = `|  | ${nodes.map((n) => `${n} | |`).join("")}\n`
  const subHeaderRow = `|  ${t(translations, lang, "set")} $S$ | ${nodes.map((n) => `$d(${n})$ | $p(${n})$ |`).join("")}\n`

  const rows = steps
    .map((step, stepIndex) => {
      const setField = `step${stepIndex}_s`

      // prefill first row
      if (stepIndex === 0) {
        const prefilledSet = `$\\{${[...step.set].join(", ")}\\}$`
        const prefilledFields = nodes
          .map((node) => {
            const prefilledDistance = step.distances[node] || "$-$"
            const prefilledPredecessor = step.predecessors[node] || "$-$"
            return `$${prefilledDistance}$ | $${prefilledPredecessor}$`
          })
          .join(" | ")

        return `| ${prefilledSet} | ${prefilledFields} |`
      }

      const nodeFields = nodes
        .map((node) => `{{step${stepIndex}_${node}_d#TL#}} | {{step${stepIndex}_${node}_p#TL#}}`)
        .join(" | ")

      return `| {{${setField}#TL#}} | ${nodeFields} |`
    })
    .filter(Boolean) // ensure no undefined rows
    .join("\n")

  return `${headerRow}${subHeaderRow}${rows}`
}

function getCheckFormatFunction(lang: Language, graph: Graph): MultiFreeTextFormatFunction {
  const nodeLabels = new Set(graph.nodes.map((node) => node.label ?? ""))
  return ({ text }, fieldID) => {
    const input = text[fieldID]?.trim()
    if (!input) return { valid: false, message: "" }

    if (fieldID.includes("_s")) {
      const isValidSet = /^\{[A-Z](, *[A-Z])*\}$/i.test(input)
      const setElements = input.replace(/[{}]/g, "").split(/,\s*/)
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

    // generate feedback table
    const headerRow = `| $S$ | ${graph.nodes.map((n) => `$(d(${n.label} ), p(${n.label} ))$ |`).join(" ")}`
    const separatorRow = `| --- | ${graph.nodes.map(() => "---:|").join(" ")}`

    const feedbackDetails = steps
      .map((step, stepIndex) => {
        // handle prefilled row
        if (stepIndex === 0) {
          const nodeFeedback = graph.nodes.map(() => `$( - , - )$`).join(" | ")
          return `| $\\{${graph.nodes[0].label}\\}$ | ${nodeFeedback} |`
        }

        // handle user input rows
        const setField = `step${stepIndex}_s`
        const userSet = text[setField]?.trim() || "-"
        const expectedSet = `{${[...step.set].join(", ")}}`

        if (userSet.replace(/\s/g, "") !== expectedSet.replace(/\s/g, "")) allStepsCorrect = false

        const rowContent = graph.nodes
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

            return `$(${expectedDistance}, ${expectedPredecessor})$`
          })
          .join(" | ")

        return `| $\\{${expectedSet}\\}$ | ${rowContent} |`
      })
      .join("\n")

    // final table structure
    const completeTable = `${headerRow}\n${separatorRow}\n${feedbackDetails}`
    console.log("Generated Feedback Table:\n", completeTable)

    return {
      correct: allStepsCorrect,
      correctAnswer: completeTable,
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
