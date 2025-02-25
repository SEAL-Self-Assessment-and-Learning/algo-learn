import type { Graph} from "@shared/utils/graph";
import { RandomGraph } from "@shared/utils/graph"
import type Random from "@shared/utils/random"

/**
 * Interface for graphs and their Dijkstra's algorithm results
 */
export interface DijkstraResult {
  graph: Graph
  steps: Array<{
    set: Set<string>
    distances: Record<string, string>
    predecessors: Record<string, string>
  }>
  order?: string[] // optional property for order of node removal
}

/**
 * Cuts off nodes from a given graph until only a specified number of nodes remain.
 * @param graph Graph to modify
 * @param size Target number of nodes
 */
export function trimGraph(graph: Graph, size: number): void {
  graph.nodes = graph.nodes.slice(0, size)
  graph.edges = graph.edges
    .slice(0, size)
    .map((edgeList) => edgeList.filter((edge) => edge.target < size))
}

/**
 * Generates a random planar graph of specified size.
 * @param random Random seed
 * @param size Number of desired nodes
 * @param edgeChance Chance for two nodes to be connected
 * @returns Graph of desired size
 */
export function createRandomGraph(random: Random, size: number, edgeChance: number = 0.6): Graph {
  // calculate grid size large enough to accomodate desired amount of nodes
  const width = Math.ceil(Math.sqrt(size))
  let height = Math.ceil(size / width)
  while (width * height < size) height++

  const graph = RandomGraph.grid(
    random,
    [width, height],
    edgeChance,
    random.choice(["square", "square-width-diagonals", "triangle"]),
    "unique",
    false,
    random.bool(),
  )

  trimGraph(graph, size) // trim away excess nodes
  return graph
}

/**
 * Utility function to change format of numerical distances.
 * @param distances Map of distances in graph
 * @returns Map of parsed values
 */
function mapDistances(distances: Record<string, number>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(distances).map(([key, value]) => [key, value === Infinity ? "" : value.toString()]),
  )
}

/**
 * Updates the neighbors of the current node during Dijkstra's algorithm.
 * @param graph Graph being traversed
 * @param currentNode Current node being processed
 * @param currentDist Current distance from start node
 * @param distances Map of distances
 * @param predecessors Map of predecessors
 * @param priorityQueue Priority queue used for node traversal
 */
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

/**
 * Runs Dijkstra's algorithm to compute the shortest paths from a start node.
 * @param graph Graph on which to perform Dijkstra's algorithm
 * @param startLabel Label of the starting node
 * @returns Instance of DijkstraResult containing the graph, steps, and order of node removal
 */
export function runDijkstra(graph: Graph, startLabel: string): DijkstraResult {
  const distances: Record<string, number> = {}
  const predecessors: Record<string, string> = {}
  const visited = new Set<string>()
  const priorityQueue: [string, number][] = []
  const steps: DijkstraResult["steps"] = []
  const order: string[] = []

  graph.nodes.forEach((node) => {
    if (!node.label) {
      throw new Error("Node label is undefined.")
    }
    distances[node.label] = Infinity
    predecessors[node.label] = ""
  })

  distances[startLabel] = 0
  priorityQueue.push([startLabel, 0])

  while (priorityQueue.length > 0) {
    priorityQueue.sort((a, b) => a[1] - b[1])
    const [currentNode, currentDist] = priorityQueue.shift()!
    if (visited.has(currentNode)) continue

    visited.add(currentNode)
    order.push(currentNode)

    steps.push({
      set: new Set(visited),
      distances: mapDistances(distances),
      predecessors: { ...predecessors },
    })

    updateNeighbors(graph, currentNode, currentDist, distances, predecessors, priorityQueue)
  }

  return { graph, steps, order }
}
