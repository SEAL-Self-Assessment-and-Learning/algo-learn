import Random from "./random"

type NodeId = number
type NodeList = Node[]
type EdgeList = Edge[][]

/**
 * A node in a graph.
 * @property id - The unique identifier of the node.
 * @property group - The group to which the node belongs.
 */
export interface Node {
  id?: NodeId // todo remove?
  label?: string
  group?: number
  coords: { x: number; y: number }
}

/**
 * A link between two nodes in a graph.
 * @property source - The source node of the link.
 * @property target - The target node of the link.
 * @property value - The value of the link.
 */
export interface Edge {
  source: NodeId
  target: NodeId
  value?: number
  group?: number | null
}

/**
 * A graph.
 * @property nodes - The nodes of the graph.
 * @property links - The links of the graph.
 */
export class Graph {
  nodes: NodeList
  edges: EdgeList
  weighted: boolean
  directed: boolean

  constructor(nodes: NodeList, edges: EdgeList, directed: boolean, weighted: boolean) {
    this.nodes = nodes
    this.edges = edges
    this.directed = directed
    this.weighted = weighted
  }

  public getDimensions(): {
    minX: number
    maxX: number
    minY: number
    maxY: number
    width: number
    height: number
  } {
    const dims = {
      minX: this.nodes[0].coords.x,
      maxX: this.nodes[0].coords.x,
      minY: this.nodes[0].coords.y,
      maxY: this.nodes[0].coords.y,
      width: 0,
      height: 0,
    }
    this.nodes.forEach((u) => {
      dims.minX = Math.min(dims.minX, u.coords.x)
      dims.maxX = Math.max(dims.maxX, u.coords.x)
      dims.minY = Math.min(dims.minY, u.coords.y)
      dims.maxY = Math.max(dims.maxY, u.coords.y)
    })

    dims.width = dims.maxX - dims.minX
    dims.height = dims.maxY - dims.minY

    return dims
  }

  public toString(): string {
    let graphStr = `${this.nodes.length} ${this.getNumEdges()} ${this.directed ? "1" : "0"} ${this.weighted ? "1" : "0"}\n`

    for (const node of this.nodes) {
      graphStr += `${Math.round(node.coords.x * 100) / 100} ${Math.round(node.coords.y * 100) / 100} ${node.group ?? 0} "${node.label ?? ""}"\n`
    }

    for (const neighbors of this.edges) {
      for (const edge of neighbors) {
        if (this.weighted) graphStr += `${edge.source} ${edge.target} ${edge.group ?? 0} ${edge.value}\n`
        else graphStr += `${edge.source} ${edge.target} ${edge.group ?? 0}\n`
      }
    }

    return graphStr
  }

  public static parse(graphStr: string): Graph {
    const lines = graphStr.split("\n")
    const graphMetaData = lines[0].match(/^(\d+) (\d+) ([01]) ([01])$/)

    if (graphMetaData === null) throw Error("Input error: graph data has invalid meta data")

    const numNodes = parseInt(graphMetaData[1])
    const numEdges = parseInt(graphMetaData[2])
    const directed = graphMetaData[3] === "1"
    const weighted = graphMetaData[4] === "1"

    if (lines.length < numNodes + numEdges + 1) throw Error("Input error: graph data is incomplete")

    const nodes: Node[] = []
    const nodesEnd = numNodes + 1
    for (let i = 1; i < nodesEnd; i++) {
      const nodeData = lines[i].match(/^(-?\d+(?:\.\d{1,2})?) (-?\d+(?:\.\d{1,2})?) (\d+) "(.*)"$/)
      if (nodeData === null) throw Error("Input error: invalid node data: " + lines[i])

      nodes.push({
        coords: { x: parseFloat(nodeData[1]), y: parseFloat(nodeData[2]) },
        group: parseInt(nodeData[3]),
        label: nodeData[4],
      })
    }

    const edgeEnd = nodesEnd + numEdges
    const edgeRegex = weighted ? /^(\d+) (\d+) (\d+) (\d+)$/ : /^(\d+) (\d+) (\d+)$/

    const edges: EdgeList = Array.from(Array(numNodes), () => [])

    for (let i = nodesEnd; i < edgeEnd; i++) {
      const edgeData = lines[i].match(edgeRegex)
      if (edgeData === null) throw Error("Input error: invalid edge data: " + graphStr)

      const source = parseInt(edgeData[1])
      edges[source].push({
        source: source,
        target: parseInt(edgeData[2]),
        group: parseInt(edgeData[3]),
        value: edgeData[4] !== undefined ? parseInt(edgeData[4]) : undefined,
      })
    }

    return new Graph(nodes, edges, directed, weighted)
  }

  public getNeighbors(u: NodeId) {
    return this.edges[u]
  }

  public getEdge(u: NodeId, v: NodeId) {
    for (const e of this.edges[u]) {
      if (e.target === v) return e
    }

    throw new Error("Input Error: Edge does not exist")
  }

  public getNumNodes(): number {
    return this.nodes.length
  }

  /**
   * Returns the number of directed edges. For an undirected graph this number is twice the actual edges.
   */
  public getNumEdges() {
    let numEdges = 0
    for (const neighbors of this.edges) numEdges += neighbors.length

    return numEdges
  }

  public setEdgeWeight(u: NodeId, v: NodeId, weight: number): void {
    this.getEdge(u, v).value = weight
    if (!this.directed) this.getEdge(v, u).value = weight
  }

  public setNodeGroup(u: NodeId, group: number): void {
    this.nodes[u].group = group
  }

  public setEdgeGroup(u: NodeId, v: NodeId, group: number): void {
    this.getEdge(u, v).group = group
    if (!this.directed) this.getEdge(v, u).group = group
  }
}

export class RandomGraph {
  private static getLabel(i: number): string {
    let label: string = ""
    do {
      const a = i % 26
      i = (i - a) / 26
      label = String.fromCharCode(65 + a) + label
    } while (i > 0)

    return label
  }

  /**
   * Generates planar grid graphs in various shapes
   * @param random
   * @param width Number of nodes in a row
   * @param height number of rows of nodes
   * @param p Probability for an edge to exist
   * @param shape
   * @param weights
   * @param directed
   * @param shakeUpNodePosition
   */
  public static grid(
    random: Random,
    [width, height]: [number, number],
    p: number,
    shape: "square" | "square-width-diagonals" | "triangle",
    weights: "random" | "unique" | null,
    directed: boolean = false,
    shakeUpNodePosition: boolean = false,
  ): Graph {
    const scale = 3
    const vertices: NodeList = []

    function posToNodeId(row: number, col: number): NodeId {
      return row * width + col
    }

    function nodeIdToPos(u: NodeId): [number, number] {
      const col = u % width
      const row = (u - col) / width
      return [row, col]
    }

    function isOdd(row: number): boolean {
      return row % 2 === 1
    }

    const shakeup = shakeUpNodePosition ? () => random.float(-0.5, 0.5) : () => 0

    for (let row = 0; row < height; row++) {
      const xOffset = shape === "triangle" && isOdd(row) ? scale / 2 : 0
      for (let col = 0; col < width; col++) {
        const nodeId: NodeId = posToNodeId(row, col)
        vertices.push({
          // id: nodeId,
          label: RandomGraph.getLabel(nodeId),
          coords: {
            x: col * scale - xOffset + shakeup(),
            y: row * scale + shakeup(),
          },
        })
      }
    }

    function getSquareNeighbors(u: NodeId): NodeId[] {
      const neighbors: NodeId[] = []

      const [row, col] = nodeIdToPos(u)

      if (directed) {
        if (col > 0) neighbors.push(posToNodeId(row, col - 1))
        if (row > 0) neighbors.push(posToNodeId(row - 1, col))
      }

      if (col < width - 1) neighbors.push(posToNodeId(row, col + 1))
      if (row < height - 1) neighbors.push(posToNodeId(row + 1, col))

      return neighbors
    }

    function getTriangleNeighbors(u: NodeId): NodeId[] {
      const neighbors = getSquareNeighbors(u)

      const [row, col] = nodeIdToPos(u)

      if (isOdd(row) && col > 0) {
        if (directed && row > 0) neighbors.push(posToNodeId(row - 1, col - 1))
        if (row > height - 1) neighbors.push(posToNodeId(row + 1, col - 1))
      } else if (!isOdd(row) && col < width - 1) {
        if (directed && row > 0) neighbors.push(posToNodeId(row - 1, col + 1))
        if (row > height - 1) neighbors.push(posToNodeId(row + 1, col + 1))
      }

      return neighbors
    }

    // interpret 0 as left to right and 1 as right to left diagonal
    const diagonalDirections =
      shape === "square-width-diagonals" ? Array(width * (height - 1)).map(() => random.int(0, 1)) : []

    function getSquareWDiagonalsNeighbors(u: NodeId): NodeId[] {
      const neighbors: NodeId[] = getSquareNeighbors(u)

      const [row, col] = nodeIdToPos(u)

      if (directed && row > 0) {
        if (col > 0 && diagonalDirections[posToNodeId(row - 1, col - 1)] === 1)
          neighbors.push(posToNodeId(row - 1, col - 1))
        if (col < width - 1 && diagonalDirections[posToNodeId(row - 1, col)] === 0)
          neighbors.push(posToNodeId(row - 1, col + 1))
      }

      if (row < height - 1) {
        if (col > 0 && diagonalDirections[posToNodeId(row, col - 1)] === 0)
          neighbors.push(posToNodeId(row + 1, col - 1))
        if (col < width - 1 && diagonalDirections[u] === 1) neighbors.push(posToNodeId(row + 1, col + 1))
      }

      return neighbors
    }

    const getPossibleNeighbors =
      shape === "triangle"
        ? getTriangleNeighbors
        : shape === "square-width-diagonals"
          ? getSquareWDiagonalsNeighbors
          : getSquareNeighbors

    let numEdges = 0

    const links: EdgeList = Array.from(Array(vertices.length), () => [])
    links.forEach((outEdges, u: NodeId) => {
      getPossibleNeighbors(u).forEach((v: NodeId) => {
        // todo refactor
        if (random.float(0, 1) < p) {
          numEdges++
          outEdges.push({ source: u, target: v })
          if (!directed) links[v].push({ source: v, target: u })
        }
      })
    })

    const graph = new Graph(vertices, links, directed, weights !== null)

    if (weights === null) return graph

    function* getWeight() {
      if (weights === "random") {
        while (true) {
          yield random.int(1, 20)
        }
      } else {
        const weightList = random.shuffle(Array.from(Array(numEdges), (_, i) => i + 1))
        for (const w of weightList) yield w
      }

      return 0
    }

    const weightGen = getWeight()

    for (let u: NodeId = 0; u < vertices.length; u++) {
      for (const { target: v } of graph.getNeighbors(u)) {
        if (directed || u < v) {
          const weight = weightGen.next().value
          graph.setEdgeWeight(u, v, weight)
        }
      }
    }

    return graph
  }

  // public static tree(): Graph {}
  // public static bipartite: Graph {}
}
