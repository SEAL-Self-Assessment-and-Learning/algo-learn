import { Language } from "@shared/api/Language"
import {
  MultiFreeTextFeedbackFunction,
  MultiFreeTextFormatFunction,
  MultiFreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import {
  createRandomGraph,
  DijkstraResult,
  runDijkstra,
} from "@shared/question-generators/graph-algorithms/utils"
import { Graph } from "@shared/utils/graph"
import Random from "@shared/utils/random"
import { t, tFunctional, Translations } from "@shared/utils/translations"

const translations: Translations = {
  en: {
    name: "Dijkstra Table",
    description: "Fill in the table with distances between nodes using Dijkstra's algorithm.",
    tableQuestion:
      "Given the following undirected graph with weighted edges, determine the shortest paths from node $A$ to all other nodes using Dijkstra's algorithm.",
    tablePrompt:
      "Fill in the table below. Each row represents a step of the algorithm. Columns $d(n)$ and $p(n)$ should show the current distance and predecessor in the parent array for node $n$. For the set $S$ fill in which node is added to it in each step. You do not need to fill in cells that remain unchanged from the previous row.",
    invalid_set: "Invalid node set.",
    invalid_dist: "Invalid distance.",
    invalid_pred: "Invalid predecessor.",
    inconsistency_error:
      'Input "{{input}}" is inconsistent with the value "{{previous}}" in the previous row.',
  },
  de: {
    name: "Dijkstra Tabelle",
    description:
      "Nutze den Dijkstra-Algorithmus um die Tabelle mit den Entfernungen zwischen Knoten auszufüllen",
    tableQuestion:
      "Nutze den Dijkstra-Algorithmus um im folgenden ungerichteten Graphen mit Kantengewichten die kürzesten Wege vom Knoten $A$ zu allen anderen Knoten u bestimmen.",
    tablePrompt:
      "Fülle dazu die folgende Tabelle aus. Hierbei entspricht jede Zeile einem Schritt des Algorithmus. Die Spalte $d(n)$ soll den aktuellen Abstand, die Spalte $p(n)$ den Vorgänger für den Knoten $n$ im Elternarray enthalten. Gib für die Menge $S$ an, welcher Knoten in jedem Schritt hinzugefügt wird. Es ist nicht notwendig Zellen auszufüllen, die sich nicht von der vorhergehenden Zeile unterscheiden.",
    invalid_set: "keine gültige Knotenmenge.",
    invalid_dist: "keine gültige Distanz.",
    invalid_pred: "kein gültiger Abstand.",
    inconsistency_error:
      'Eingabe "{{input}}" stimmt nicht mit dem Wert "{{previous}}" in der vorherigen Zeile überein.',
  },
}

export const DijkstraTableGenerator: QuestionGenerator = {
  id: "dijktable",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["graph", "dijkstra", "table"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      name: "size",
      type: "integer",
      min: 2,
      max: 8,
    },
  ],

  generate: (lang: Language, parameters, seed) => {
    const random = new Random(seed)

    const { graph, steps } = generateRandomGraphWithValidation(random, parameters.size as number)

    const permalink = serializeGeneratorCall({
      generator: DijkstraTableGenerator,
      lang,
      parameters,
      seed,
    })

    const table = getDijkstraInputTable(steps, graph)
    const feedback = getFeedbackFunction(steps, graph)
    const checkFormat = getCheckFormatFunction(lang, graph)

    console.log("debug:\n", cheatForDebugging(steps, graph))

    const question: MultiFreeTextQuestion = {
      type: "MultiFreeTextQuestion",
      path: permalink,
      name: t(translations, lang, "name"),
      fillOutAll: false,
      text: `${t(translations, lang, "tableQuestion")}\n${graph.toMarkdown()}\n${t(
        translations,
        lang,
        "tablePrompt",
      )}\n\n${table}`,
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
          const expectedDistance = step.distances[nodeLabel] || ""
          const expectedPredecessor = step.predecessors[nodeLabel] || ""
          return `${expectedDistance} | ${expectedPredecessor}`
        })
        .join(" | ")

      return `| ${expectedSet} | ${nodeFeedback} |`
    })
    .join("\n")
}

function generateRandomGraphWithValidation(random: Random, size: number): DijkstraResult {
  const maxRetries = 100
  let retries = 0
  let edgeChance = 0.6

  // guarantee more than one row in the algorithm
  while (retries < maxRetries) {
    const graph = createRandomGraph(random, size, edgeChance)
    const steps = validateDijkstraSteps(graph)
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

function validateDijkstraSteps(graph: Graph): DijkstraResult["steps"] | null {
  const startNode = graph.nodes[0]?.label ?? "A"
  const { steps } = runDijkstra(graph, startNode)
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
): string {
  const nodes = graph.nodes.map((n) => n.label!)
  const headerRow = `| | | | | ${nodes.map((n) => `${n} | |`).join("")}\n`
  const subHeaderRow = `| | | | | ${nodes.map((n) => `$d(${n})$ | $p(${n})$ |`).join("")}\n`

  const rows = steps
    .map((step, stepIndex) => {
      const setField = `step${stepIndex}_s`

      // prefill first row
      if (stepIndex === 0) {
        const prefilledSet = `$${[...step.set].join(", ")}$`
        const prefilledFields = nodes
          .map((node) => {
            const prefilledDistance = step.distances[node] || ""
            const prefilledPredecessor = step.predecessors[node] || ""
            return `${prefilledDistance} | ${prefilledPredecessor}`
          })
          .join(" | ")

        return `|  $S=$ | $\\{$ |${prefilledSet}| $\\}$ | ${prefilledFields} |`
      }

      const nodeFields = nodes
        .map((node) => `{{step${stepIndex}_${node}_d#TL#}} | {{step${stepIndex}_${node}_p#TL#}}`)
        .join(" | ")

      return `| $\\cup$ | $\\{$ | {{${setField}#TL#}} | $\\}$ | ${nodeFields} |`
    })
    .filter(Boolean) // ensure no undefined rows
    .join("\n")

  const additionalStyling = "|#div_my-5?border_none?av_middle?ah_center?table_w-full#| |\n"

  return `${headerRow}${subHeaderRow}${rows}${additionalStyling}`
}

function getCheckFormatFunction(lang: Language, graph: Graph): MultiFreeTextFormatFunction {
  const nodeLabels = new Set(graph.nodes.map((node) => node.label ?? ""))

  // function to find the fieldID of the same node in the previous step
  const getPreviousFieldID = (currentFieldID: string) => {
    const match = currentFieldID.match(/^step(\d+)_(.+)$/)
    if (match) {
      const stepIndex = parseInt(match[1])
      const fieldType = match[2] // e.g., node_d or node_p
      if (stepIndex > 0) {
        return `step${stepIndex - 1}_${fieldType}`
      }
    }
    return null
  }

  // function to validate consistency with the previous row
  const checkConsistency = (input: string, previousInput: string | undefined) =>
    input !== "" && previousInput && input !== previousInput
      ? {
          valid: false,
          message: t(translations, lang, "inconsistency_error", { input, previous: previousInput }),
        }
      : { valid: true, message: "" }

  // function to validate the format of a field
  const validateField = (input: string, type: string): { valid: boolean; message: string } => {
    switch (type) {
      case "_s": {
        const setElements = input.replace(/\s+/g, "").split(",")
        const allValidNodes = setElements.every((label) => nodeLabels.has(label))
        return allValidNodes
          ? { valid: true, message: "" }
          : { valid: false, message: t(translations, lang, "invalid_set") }
      }
      case "_d":
        return /^[-0-9]*$/i.test(input)
          ? { valid: true, message: "" }
          : { valid: false, message: t(translations, lang, "invalid_dist") }
      case "_p": {
        const isValidPredecessor = /^[-A-Z]+$/i.test(input)
        const isKnownNode = input === "" || nodeLabels.has(input)
        return isValidPredecessor && isKnownNode
          ? { valid: true, message: "" }
          : { valid: false, message: t(translations, lang, "invalid_pred") }
      }
      default:
        return { valid: false, message: "" }
    }
  }

  return ({ text }, fieldID) => {
    const input = text[fieldID]?.trim() || ""

    const fieldType = fieldID.match(/_(s|d|p)$/)?.[1]
    if (!fieldType) return { valid: false, message: "" }

    // validate format
    const validationResult = validateField(input, `_${fieldType}`)
    if (!validationResult.valid) return validationResult

    // perform consistency checks
    if (fieldType === "s") return { valid: true, message: "" } // skip Set column
    const prevFieldID = getPreviousFieldID(fieldID)
    if (prevFieldID && text[prevFieldID]) {
      const previousInput = text[prevFieldID]?.trim() || ""
      return checkConsistency(input, previousInput)
    }

    return { valid: true, message: "" }
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
          const nodeFeedback = graph.nodes.map(() => `$( , )$`).join(" | ")
          return `| $\\{${graph.nodes[0].label}\\}$ | ${nodeFeedback} |`
        }

        // handle user input rows
        const setField = `step${stepIndex}_s`
        const expectedSet = `{${[...step.set].join(", ")}}`
        const userNewNode = text[setField]?.trim() || ""
        const expectedNewNode = [...step.set].filter((node) => !steps[stepIndex - 1]?.set.has(node))[0]

        if (userNewNode !== expectedNewNode) allStepsCorrect = false

        const previousStep = steps[stepIndex - 1]
        const rowContent = graph.nodes
          .map((node) => {
            const nodeLabel = node.label!

            const distanceField = `step${stepIndex}_${nodeLabel}_d`
            const userDistance = text[distanceField]?.trim().replace(/^\s*$/, "") || ""
            const expectedDistance = step.distances[nodeLabel] || previousStep.distances[nodeLabel] || ""

            const predecessorField = `step${stepIndex}_${nodeLabel}_p`
            const userPredecessor = text[predecessorField]?.trim().replace(/^\s*$/, "") || ""
            const expectedPredecessor =
              step.predecessors[nodeLabel] || previousStep.predecessors[nodeLabel] || ""

            if (
              (userDistance !== "" && userDistance !== expectedDistance) ||
              (userPredecessor !== "" && userPredecessor !== expectedPredecessor)
            ) {
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
    //console.log("Generated Feedback Table:\n", completeTable)

    return {
      correct: allStepsCorrect,
      correctAnswer: completeTable,
    }
  }
}
