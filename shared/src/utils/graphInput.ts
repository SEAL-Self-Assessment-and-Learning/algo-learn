import { getNodeLabel, type Edge, type Graph } from "@shared/utils/graph.ts"
import type { GraphElementStateType } from "@/components/DrawGraph.tsx"

export type NodeInputSelectedCheckResult = { parsed: boolean; messages: string[]; selected: string[] }
export type NodeInputGroupCheckResult = {
  parsed: boolean
  messages: string[]
  groups: { [key: number]: string[] }
}
export type NodeInputCheckResult = NodeInputSelectedCheckResult | NodeInputGroupCheckResult

export type EdgeInputSelectedCheckResult = {
  parsed: boolean
  messages: string[]
  selected: [string, string][]
}
export type EdgeInputGroupCheckResult = {
  parsed: boolean
  messages: string[]
  groups: { [key: number]: [string, string][] }
}
export type EdgeInputCheckResult = EdgeInputSelectedCheckResult | EdgeInputGroupCheckResult

export function updateGraphNodeSelected(
  graph: Graph,
  nodeStates: GraphElementStateType[],
  selected: string[],
) {
  for (let i = 0; i < graph.nodes.length; i++) {
    nodeStates[i].selected = selected.includes(graph.nodes[i].label!)
  }
}

export function updateGraphNodeGroup(
  graph: Graph,
  nodeStates: GraphElementStateType[],
  groups: { [key: number]: string[] },
) {
  for (let i = 0; i < graph.nodes.length; i++) {
    nodeStates[i].group = null
  }

  for (const [group, nodes] of Object.entries(groups)) {
    for (const node of nodes) {
      const nodeIndex = graph.nodes.findIndex((n) => n.label === node)
      if (nodeIndex !== -1) {
        nodeStates[nodeIndex].group = parseInt(group) - 1
      }
    }
  }
}

export function updateGraphEdgeSelected(
  directed: boolean,
  edgeListFlat: Edge[],
  edgeStates: GraphElementStateType[],
  selected: [string, string][],
) {
  for (let i = 0; i < edgeListFlat.length; i++) {
    if (directed) {
      edgeStates[i].selected =
        selected.findIndex(
          (edge) =>
            getNodeLabel(edgeListFlat[i].source) === edge[0] &&
            getNodeLabel(edgeListFlat[i].target) === edge[1],
        ) !== -1
    } else {
      edgeStates[i].selected =
        selected.findIndex(
          (edge) =>
            getNodeLabel(edgeListFlat[i].source) === edge[0] &&
            getNodeLabel(edgeListFlat[i].target) === edge[1],
        ) !== -1 ||
        selected.findIndex(
          (edge) =>
            getNodeLabel(edgeListFlat[i].target) === edge[0] &&
            getNodeLabel(edgeListFlat[i].source) === edge[1],
        ) !== -1
    }
  }
}

export function updateGraphEdgeGroup(
  directed: boolean,
  edgeListFlat: Edge[],
  edgeStates: GraphElementStateType[],
  group: { [key: number]: [string, string][] },
) {
  for (let i = 0; i < edgeListFlat.length; i++) {
    edgeStates[i].group = null
  }

  for (const [groupIndex, edges] of Object.entries(group)) {
    for (const edge of edges) {
      let edgeIndex: number
      if (directed) {
        edgeIndex = edgeListFlat.findIndex(
          (e) => getNodeLabel(e.source) === edge[0] && getNodeLabel(e.target) === edge[1],
        )
      } else {
        edgeIndex = edgeListFlat.findIndex(
          (e) =>
            (getNodeLabel(e.source) === edge[0] && getNodeLabel(e.target) === edge[1]) ||
            (getNodeLabel(e.target) === edge[0] && getNodeLabel(e.source) === edge[1]),
        )
      }
      if (edgeIndex !== -1) {
        edgeStates[edgeIndex].group = parseInt(groupIndex) - 1
      }
    }
  }
}

/**
 * Function parsing the node input fields and checking for correct input
 * Node-String format is either (Node, Group) or Node seperated by ";"
 *
 * @param nodeString
 * @param graph
 */
export function checkNodeInput(nodeString: string, graph: Graph): NodeInputCheckResult {
  const nodes = nodeString.split(";")
  return graph.nodeClickType === "select"
    ? checkNodeInputSelect(nodes, graph)
    : checkNodeInputGroup(nodes, graph)
}

/**
 * Checks the input of nodes if the graph nodes can only be selected
 * Checks:
 *  - Input contains only uppercase letters
 *  - Input contains only nodes that are in the graph
 * @param nodes
 * @param graph
 */
function checkNodeInputSelect(nodes: string[], graph: Graph): NodeInputSelectedCheckResult {
  const selected: string[] = []
  const messages: string[] = []
  let parsed: boolean = true
  for (const node of nodes) {
    const cleanNode = node.replace(/\s/g, "")
    if (!cleanNode) continue
    if (!/^[A-Z]+$/.test(cleanNode)) {
      parsed = false
      messages.push(`"**${cleanNode}**" is not a valid node label. Please use uppercase letters only.`)
      continue
    }
    if (graph.nodes.findIndex((n) => n.label === cleanNode) === -1) {
      parsed = false
      messages.push(`"**${cleanNode}**" is not a valid node label. Please select a node from the graph.`)
      continue
    }
    selected.push(cleanNode)
  }
  return { parsed, messages, selected }
}

function checkNodeInputGroup(nodes: string[], graph: Graph): NodeInputGroupCheckResult {
  const regexNodeGroup = new RegExp(`^\\(([A-Z]+),(\\d|[0-9])\\)+$`)
  const groups: { [key: number]: string[] } = {}
  const messages: string[] = []
  let parsed: boolean = true
  for (const node of nodes) {
    const cleanNode = node.replace(/\s/g, "")
    if (!cleanNode) continue

    const match = cleanNode.match(regexNodeGroup)
    if (!match || graph.nodes.findIndex((n) => n.label === match[1]) === -1) {
      parsed = false
      messages.push(`"**${cleanNode}**" is not a valid node label. Please select a node from the graph.`)
      continue
    }

    const group = parseInt(match[2])
    if (group > graph.nodeGroupMax || group < 1) {
      parsed = false
      messages.push(
        `"**${cleanNode}**" is not a valid group number. Please select a group between 1 and ${graph.nodeGroupMax}.`,
      )
    }

    groups[group] = groups[group] || []
    groups[group].push(match[1])
  }

  return { parsed, messages, groups }
}

/**
 * Function parsing the edge input fields and checking for correct input
 * @param edgeString
 * @param graph
 */
export function checkEdgeInput(edgeString: string, graph: Graph): EdgeInputCheckResult {
  const edges = edgeString.split(";")
  return graph.edgeClickType === "select"
    ? checkEdgeInputSelect(edges, graph)
    : checkEdgeInputGroup(edges, graph)
}

function checkEdgeCorrectness(
  match: RegExpMatchArray | null,
  edge: string,
  graph: Graph,
): { parsed: boolean; message: string } {
  if (!match) return { parsed: false, message: `**${edge}**: Invalid edge format` }
  if (match[1] === match[2]) return { parsed: false, message: "Edge cannot connect a node to itself" }
  if (
    graph.nodes.findIndex((n) => n.label === match[1]) === -1 ||
    graph.nodes.findIndex((n) => n.label === match[2]) === -1
  ) {
    return { parsed: false, message: "Edge connects a node that is not in the graph" }
  }
  // check if the edge exists
  if (graph.directed) {
    if (
      graph.edges
        .flat()
        .findIndex((e) => getNodeLabel(e.source) === match[1] && getNodeLabel(e.target) === match[2]) ===
      -1
    ) {
      return { parsed: false, message: "Edge does not exist in the graph" }
    }
  } else {
    if (
      graph.edges
        .flat()
        .findIndex(
          (e) =>
            (getNodeLabel(e.source) === match[1] && getNodeLabel(e.target) === match[2]) ||
            (getNodeLabel(e.source) === match[2] && getNodeLabel(e.target) === match[1]),
        ) === -1
    ) {
      return { parsed: false, message: "Edge does not exist in the graph" }
    }
  }
  return { parsed: true, message: "" }
}

function checkEdgeInputSelect(edges: string[], graph: Graph): EdgeInputSelectedCheckResult {
  const selected: [string, string][] = []
  const messages: string[] = []
  let parsed: boolean = true
  for (const edge of edges) {
    const cleanEdge = edge.replace(/\s/g, "")
    if (!cleanEdge) continue
    const regexEdge = new RegExp(`^\\(([A-Z]+),([A-Z]+)\\)$`)
    const match = cleanEdge.match(regexEdge)
    const edgeCorrectness = checkEdgeCorrectness(match, cleanEdge, graph)
    if (!edgeCorrectness.parsed) {
      messages.push(edgeCorrectness.message)
      parsed = false
      continue
    }
    selected.push([match![1], match![2]])
  }
  return { parsed, messages, selected }
}

function checkEdgeInputGroup(edges: string[], graph: Graph): EdgeInputGroupCheckResult {
  const groups: { [key: number]: [string, string][] } = {}
  const messages: string[] = []
  let parsed: boolean = true
  for (const edge of edges) {
    const cleanEdge = edge.replace(/\s/g, "")
    if (!cleanEdge) continue
    const regexEdge = new RegExp(`^\\(([A-Z]+),([A-Z]+),([1-9])\\)$`)
    const match = cleanEdge.match(regexEdge)
    const edgeCorrectness = checkEdgeCorrectness(match, cleanEdge, graph)
    if (!edgeCorrectness.parsed) {
      messages.push(edgeCorrectness.message)
      parsed = false
      continue
    }
    const group = parseInt(match![3])
    if (group > graph.edgeGroupMax || group < 1) {
      parsed = false
      messages.push(
        `"**${cleanEdge}**" is not a valid group number. Please select a group between 1 and ${graph.edgeGroupMax}.`,
      )
      continue
    }
    groups[group] = groups[group] || []
    groups[group].push([match![1], match![2]])
  }
  return { parsed, messages, groups }
}
