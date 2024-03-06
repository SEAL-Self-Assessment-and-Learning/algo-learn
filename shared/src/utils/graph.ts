import Random from "./random"

/**
 * A node in a graph.
 * @property id - The unique identifier of the node.
 * @property group - The group to which the node belongs.
 */
export interface Node {
  id?: string | number
  group?: number
}

/**
 * A link between two nodes in a graph.
 * @property source - The source node of the link.
 * @property target - The target node of the link.
 * @property value - The value of the link.
 */
export interface Link {
  source: Node
  target: Node
  value?: number
}

/**
 * A graph.
 * @property nodes - The nodes of the graph.
 * @property links - The links of the graph.
 */
export type Graph = {
  vertices: Node[]
  edges: Link[]
}

/**
 * Parses a graph in the DIMACS graph format.
 * @param plainText - The plain text representation of the graph in the DIMACS graph format.
 * Vertices are numbered from 1 to n. The first line contains n and m, the remaining lines
 * contain the edges.
 * For example:
 * ```
 * 3 2
 * 1 2
 * 2 3
 * ```
 * @returns The parsed graph.
 */
export function parseDimacsGraph(plainText: string): Graph {
  const lines = plainText.split("\n")
  const [n] = lines[0].split(" ").map(Number)
  const vertices = Array.from({ length: n }, (_, i) => ({ id: i + 1 }))
  const edges = lines
    .slice(1)
    .map((line) => {
      const [source, target] = line.split(" ").map(Number)
      return { source: vertices[source - 1], target: vertices[target - 1] }
    })
    .filter((link) => link.source !== undefined && link.target !== undefined)
  return { vertices, edges }
}

/**
 * Returns the graph in the DIMACS graph format.
 * @param graph - The graph to convert to the DIMACS graph format.
 * @returns The graph in the DIMACS graph format.
 */
export function toDimacsGraph(graph: Graph): string {
  const n = graph.vertices.length
  const m = graph.edges.length
  const links = graph.edges.map((link) => `${link.source.id} ${link.target.id}`).join("\n")
  return `${n} ${m}\n${links}`
}

/**
 * Parses a graph in a custom format.
 * @param plainText - The nodes are strings.
 * The first line contains all nodes separated by a space,
 * the remaining lines contain the edges.
 * For example:
 * ```
 * A B C
 * A B
 * B C
 * ```
 * @returns The parsed graph.
 */
export function parseCustomGraph(plainText: string): Graph {
  const lines = plainText.split("\n")
  const vertices = lines[0].split(" ").map((id) => ({ id }))
  const edges = lines.slice(1).map((line) => {
    const [source, target] = line.split(" ")
    return {
      source: vertices.find((node) => node.id === source)!,
      target: vertices.find((node) => node.id === target)!,
    }
  })
  return { vertices, edges }
}

/**
 * Returns the graph in a custom format.
 * @param graph - The graph to convert to the custom format.
 * @returns The graph in the custom format.
 */
export function toCustomGraph(graph: Graph): string {
  const nodes = graph.vertices.map((node) => node.id).join(" ")
  const links = graph.edges.map((link) => `${link.source.id} ${link.target.id}`).join("\n")
  return `${nodes}\n${links}`
}

/** Sample a random graph G(n,m)
 * @param n vertices
 * @param m edges
 * @param random random number generator
 * @return a random graph with n vertices and m edges
 */
export function randomGraph(n: number, m: number, random: Random): Graph | undefined {
  const maxNumEdges = (n * (n - 1)) / 2
  if (n < 0 || m < 0 || m > maxNumEdges) return undefined

  const graph: Graph = { vertices: [], edges: [] }
  for (let i = 1; i <= n; i++) {
    graph.vertices.push({ id: i })
  }

  /** Generate a list of random integers using sparse Fisher-Yates shuffling */
  const state: Record<number, number> = {}
  for (let i = 0; i < m; i++) {
    const j = random.int(i, maxNumEdges)
    if (!(i in state)) state[i] = i
    if (!(j in state)) state[j] = j
    ;[state[i], state[j]] = [state[j], state[i]]
  }

  /** Cantor's unpairing function
   * @param k non-negative integer
   * @return returns the k-th non-negative integer pair (x,y)
   * in the sequence (0,0), (0,1), (1,0), (0,2), (1,1), (2,0), (0,3)...
   */
  function unpair(k: number): [number, number] {
    const z = Math.floor((-1 + Math.sqrt(1 + 8 * k)) / 2)
    return [k - (z * (1 + z)) / 2, (z * (3 + z)) / 2 - k]
  }

  for (let i = 0; i < m; i++) {
    const [x, y] = unpair(state[i])
    const u = graph.vertices[x]
    const v = graph.vertices[n - 1 - y]
    graph.edges.push({ source: u, target: v })
  }
  return graph
}
