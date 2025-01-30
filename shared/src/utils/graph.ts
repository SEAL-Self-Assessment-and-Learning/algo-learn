import type Random from "./random"

type NodeId = number
type NodeList = Node[]
type EdgeList = Edge[][]
type ClickEventType = "none" | "select" | "group"

/**
 * A node in a graph.
 * @property label - A name of the node.
 * @property group - The group to which the node belongs. Can be used e.g. for node coloring
 * @property coords - The coordinates the node is placed.
 */
export interface Node {
  label?: string
  group?: number | null
  coords: { x: number; y: number }
}

/**
 * An edge between two nodes in a graph.
 * @property source - The source node of the edge.
 * @property target - The target node of the edge.
 * @property value - The value of the edge, e.g. weight or travel time
 * @property group - Can be used e.g. for edge coloring
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
  public inputFields: boolean
  public nodeDraggable: boolean
  public nodeClickType: ClickEventType
  public edgeClickType: ClickEventType
  // groups are counted from 0 to [node|edge]GroupMax -1
  public nodeGroupMax: number
  public edgeGroupMax: number

  constructor(
    nodes: NodeList,
    edges: EdgeList,
    directed: boolean,
    weighted: boolean,
    inputFields: boolean = false,
    nodeDraggable: boolean = true,
    nodeClick: ClickEventType = "none",
    edgeClick: ClickEventType = "none",
    nodeGroupMax: number = 0,
    edgeGroupMax: number = 0,
  ) {
    this.nodes = nodes
    this.edges = edges
    this.directed = directed
    this.weighted = weighted
    this.inputFields = inputFields
    this.nodeDraggable = nodeDraggable
    this.nodeClickType = nodeClick
    this.edgeClickType = edgeClick
    this.nodeGroupMax = nodeGroupMax
    this.edgeGroupMax = edgeGroupMax
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
    const clickTypeMapping: Record<ClickEventType, string> = { none: "0", select: "1", group: "2" }
    let graphStr = `${this.nodes.length} ${this.getNumEdges()} ${this.directed ? "1" : "0"} ${this.weighted ? "1" : "0"} ${this.inputFields ? "1" : "0"} ${this.nodeDraggable ? "1" : "0"} ${clickTypeMapping[this.nodeClickType]} ${clickTypeMapping[this.edgeClickType]} ${this.nodeGroupMax ?? "0"} ${this.edgeGroupMax ?? "0"}\n`

    for (const node of this.nodes) {
      graphStr += `${Math.round(node.coords.x * 100) / 100} ${Math.round(node.coords.y * 100) / 100} ${node.group ?? "-"} "${node.label ?? ""}"\n`
    }

    for (const neighbors of this.edges) {
      for (const edge of neighbors) {
        graphStr += `${edge.source} ${edge.target} ${edge.group ?? "-"}`
        if (this.weighted) graphStr += ` ${edge.value}`
        graphStr += `\n`
      }
    }

    return graphStr
  }

  public toMarkdown(): string {
    return `\n\`\`\`graph\n${this.toString()}\n\`\`\`\n`
  }

  public static parse(graphStr: string): Graph {
    const lines = graphStr.split("\n")
    const graphMetaData = lines[0].match(
      /^(\d+) (\d+) ([01]) ([01]) ([01]) ([01]) ([012]) ([012]) (\d+) (\d+)$/,
    )

    if (graphMetaData === null) throw Error(`Input error: graph data has invalid meta data: ${lines[0]}`)
    const numNodes = parseInt(graphMetaData[1])
    const numEdges = parseInt(graphMetaData[2])
    const directed = graphMetaData[3] === "1"
    const weighted = graphMetaData[4] === "1"
    const inputFields = graphMetaData[5] === "1"
    const nodeDraggable = graphMetaData[6] === "1"
    const clickTypeMapping: Record<string, ClickEventType> = { "0": "none", "1": "select", "2": "group" }
    const nodeClick = clickTypeMapping[graphMetaData[7]]
    const edgeClick = clickTypeMapping[graphMetaData[8]]
    const nodeGroupMax = parseInt(graphMetaData[9])
    const edgeGroupMax = parseInt(graphMetaData[10])

    if (lines.length < numNodes + numEdges + 1) throw Error("Input error: graph data is incomplete")
    if (nodeClick === undefined || edgeClick === undefined)
      throw Error("Input error: click events invalid")

    const nodes: Node[] = []
    const nodesEnd = numNodes + 1
    for (let i = 1; i < nodesEnd; i++) {
      const nodeData = lines[i].match(/^(-?\d+(?:\.\d{1,2})?) (-?\d+(?:\.\d{1,2})?) (-|\d+) "(.*)"$/)
      if (nodeData === null) throw Error("Input error: invalid node data: " + lines[i])

      nodes.push({
        coords: { x: parseFloat(nodeData[1]), y: parseFloat(nodeData[2]) },
        group: nodeData[3] === "-" ? null : parseInt(nodeData[3]),
        label: nodeData[4],
      })
    }

    const edgeEnd = nodesEnd + numEdges
    const edgeRegex = weighted ? /^(\d+) (\d+) (-|\d+) (\d+)$/ : /^(\d+) (\d+) (-|\d+)$/

    const edges: EdgeList = Array.from(Array(numNodes), () => [])

    for (let i = nodesEnd; i < edgeEnd; i++) {
      const edgeData = lines[i].match(edgeRegex)
      if (edgeData === null) throw Error("Input error: invalid edge data: " + lines[i])

      const source = parseInt(edgeData[1])
      edges[source].push({
        source: source,
        target: parseInt(edgeData[2]),
        group: edgeData[3] === "-" ? null : parseInt(edgeData[3]),
        value: edgeData[4] !== undefined ? parseInt(edgeData[4]) : undefined,
      })
    }

    return new Graph(
      nodes,
      edges,
      directed,
      weighted,
      inputFields,
      nodeDraggable,
      nodeClick,
      edgeClick,
      nodeGroupMax,
      edgeGroupMax,
    )
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

export function getNodeLabel(i: number): string {
  let label: string = ""
  do {
    const a = i % 26
    i = (i - a) / 26
    label = String.fromCharCode(65 + a) + label
  } while (i > 0)

  return label
}

export class RandomGraph {
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
          label: getNodeLabel(nodeId),
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
        if (random.bool(p)) {
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

  // public static tree(depth: number, minDegree: number, maxDegree: number = minDegree): Graph {}

  // public static bipartite: Graph {}
}

export const traversalStrategies = ["pre", "in", "post"] as const
type TraversalStrategies = (typeof traversalStrategies)[number]

export class RootedTree {
  root: string
  children: RootedTree[] // left to right
  coordinates: { x: number; y: number; mod: number; index: number; parent: RootedTree | null } = {
    x: 0,
    y: 0,
    mod: 0,
    index: 0,
    parent: null,
  }

  nodeDistX: number = 1
  nodeDistY: number = 1.5
  siblingDist: number = 0
  treeDist: number = 0

  constructor(root: string, children: RootedTree[] = []) {
    this.root = root
    this.children = children
  }

  public getNumNodes(): number {
    // if (this.children.length === 0) return 1

    return this.children.reduce((acc: number, node: RootedTree) => acc + node.getNumNodes(), 1)
  }

  public getTraversalOrder(type: TraversalStrategies): string[] {
    let order: string[] = []
    if (type === "pre") {
      order.push(this.root)
      this.children.forEach((child) => {
        order = order.concat(child.getTraversalOrder(type))
      })
    } else if (type === "post") {
      this.children.forEach((child) => {
        order = order.concat(child.getTraversalOrder(type))
      })
      order.push(this.root)
    } else if (type === "in") {
      if (this.children.length > 0) order = order.concat(this.children[0].getTraversalOrder(type))
      order.push(this.root)
      for (let i = 1; i < this.children.length; i++) {
        order = order.concat(this.children[i].getTraversalOrder(type))
      }
    }

    return order
  }

  public static random(
    depth: number | { min: number; max: number },
    degree:
      | number
      | {
          min: number
          max: number
        },
    random: Random,
  ): RootedTree {
    const tree = RootedTree.rnd(depth, degree, random)
    const numNodes = tree.getNumNodes()
    let labels = []
    for (let i = 0; i < numNodes; i++) {
      labels.push(getNodeLabel(i))
    }
    labels = random.shuffle(labels)

    RootedTree.relable(tree, labels)
    return tree
  }

  private static rnd(
    depth: number | { min: number; max: number },
    degree:
      | number
      | {
          min: number
          max: number
        },
    random: Random,
  ): RootedTree {
    // assert(typeof depth === "number" || depth.min < depth.max)

    if (typeof depth !== "number" && depth.min === 0) depth = random.int(depth.min, depth.max)

    if (depth === 0) return new RootedTree("", [])

    const newDepth = typeof depth === "number" ? depth - 1 : { min: depth.min - 1, max: depth.max - 1 }
    const children: RootedTree[] = []
    const numChildren = typeof degree === "number" ? degree : random.int(degree.min, degree.max)
    for (let i = 0; i < numChildren; i++) {
      children.push(RootedTree.rnd(newDepth, degree, random))
    }

    return new RootedTree("", children) //{ root: "", children: children }
  }

  private static relable(tree: RootedTree, labels: string[]): void {
    if (labels.length === 0) throw new Error("Not enough labels")
    tree.root = labels.pop()! // pop cannot return undefined since the array is not empty at this point

    for (let i = 0; i < tree.children.length; i++) {
      this.relable(tree.children[i], labels)
    }
  }

  public toGraph(): Graph {
    const nodes: NodeList = []
    const edges: EdgeList = []

    this.computeNodeCoordinates()
    this.collectNodesAndEdges(nodes, edges)

    return new Graph(nodes, edges, false, false)
  }

  private collectNodesAndEdges(
    nodes: NodeList,
    edges: EdgeList,
    parentNodeId: number | null = null,
  ): void {
    const currentNodeId = nodes.length
    nodes.push({ label: this.root, coords: { x: this.coordinates.x, y: this.coordinates.y } })
    edges.push([])

    if (parentNodeId !== null) {
      edges[parentNodeId].push({ source: parentNodeId, target: currentNodeId })
    }

    this.children.forEach((child) => {
      child.collectNodesAndEdges(nodes, edges, currentNodeId)
    })
  }

  /**
   * Reingold-Tilford algorithm for laying out trees.
   */
  private computeNodeCoordinates() {
    this.initCoordinateComputation()
    this.computeInitialX()
    this.computeFinalNodeCoordinates()
  }

  /**
   * Initializes the coordinates object for each node. It links each node with its parent and tells it
   * its index in the parents child array. The depth is already set to the correct value.
   */
  private initCoordinateComputation(
    depth: number = 0,
    index: number = 0,
    parent: RootedTree | null = null,
  ): void {
    this.coordinates = { x: 0, y: depth, mod: 0, index: index, parent: parent }

    this.children.forEach((child, i) => {
      child.initCoordinateComputation(depth + 1, i, this)
    })
  }

  /**
   * Computes initial x values for each node.
   */
  private computeInitialX(): void {
    this.children.forEach((child) => {
      child.computeInitialX()
    })

    // if this node is a leaf
    if (this.children.length === 0) {
      if (this.coordinates.index > 0) {
        // place the node just right of its left sibling
        this.coordinates.x = this.getPreviousSiblingX() + this.nodeDistX + this.siblingDist
      }
      // else x = 0 (initialization value)
    } else {
      // place the node in the center over its children
      const center =
        (this.children[0].coordinates.x + this.children[this.children.length - 1].coordinates.x) * 0.5

      if (this.coordinates.index === 0) {
        this.coordinates.x = center
      } else {
        this.coordinates.x = this.getPreviousSiblingX() + this.nodeDistX + this.siblingDist
        this.coordinates.mod = this.coordinates.x - center
      }

      if (this.coordinates.index > 0) this.checkForOverlappingSubtrees()
    }
  }

  private checkForOverlappingSubtrees(): void {
    const minDistance = this.treeDist + this.nodeDistX
    let shiftValue = 0

    const nodeContour = this.getLeftContour()

    // iterate all siblings to the left
    for (let i = 0; i < this.coordinates.index; i++) {
      const sibling = this.coordinates.parent!.children[i] // since the node has siblings it also has a parent.
      const siblingContour = sibling.getRightContour()
      for (
        let y = this.coordinates.y + 1;
        y <=
        Math.min(
          Math.max(...Object.keys(nodeContour).map(Number)),
          Math.max(...Object.keys(siblingContour).map(Number)),
        );
        y++
      ) {
        const dist = nodeContour[y] - siblingContour[y]
        if (dist + shiftValue < minDistance) shiftValue = minDistance - dist
      }

      if (shiftValue > 0) {
        this.coordinates.x += shiftValue
        this.coordinates.mod += shiftValue

        this.centerNodes(sibling)

        shiftValue = 0
      }
    }
  }

  private centerNodes(leftSibling: RootedTree): void {
    const leftIndex = leftSibling.coordinates.index
    const rightIndex = this.coordinates.index
    const nodeSpan = rightIndex - leftIndex - 1

    if (nodeSpan > 0) {
      const nodeDist = (this.coordinates.x - leftSibling.coordinates.x) / (nodeSpan + 1)

      for (let i = 1; i < rightIndex; i++) {
        const middleNode = this.coordinates.parent!.children[leftIndex + i] // since the nod has siblings it has a parent
        const offset = leftSibling.coordinates.x + nodeDist * i - middleNode.coordinates.x
        middleNode.coordinates.x += offset
        middleNode.coordinates.mod += offset
      }

      this.checkForOverlappingSubtrees() // todo is this correct?
    }
  }

  private getLeftContour(): Record<number, number> {
    const contours = {}
    this.getContour(0, contours, Math.min)
    return contours
  }

  private getRightContour(): Record<number, number> {
    const contours = {}
    this.getContour(0, contours, Math.max)
    return contours
  }

  private getContour(
    modSum: number,
    contours: Record<number, number>,
    m: (a: number, b: number) => number,
  ): void {
    contours[this.coordinates.y] = m(
      contours[this.coordinates.y] ?? this.coordinates.x + modSum,
      this.coordinates.x + modSum,
    )

    modSum += this.coordinates.mod
    this.children.forEach((child) => {
      child.getContour(modSum, contours, m)
    })
  }

  private getPreviousSiblingX(): number {
    if (this.coordinates.index > 0)
      return this.coordinates.parent!.children[this.coordinates.index - 1].coordinates.x // since the nod has siblings it has a parent

    return 0
  }

  private computeFinalNodeCoordinates(modSum: number = 0) {
    this.coordinates.x += modSum
    this.coordinates.y *= this.nodeDistY
    modSum += this.coordinates.mod

    this.children.forEach((child) => child.computeFinalNodeCoordinates(modSum))
  }
}
