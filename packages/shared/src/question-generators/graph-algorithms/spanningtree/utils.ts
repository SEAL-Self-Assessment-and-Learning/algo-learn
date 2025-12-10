import { QuickFind } from "@shared/question-generators/unionFind/quickFind/quickFindAlgorithm.ts"
import type { Edge, Graph } from "@shared/utils/graph.ts"

/**
 * Highlight the edges in the graph
 * In place operation
 * @param graph
 * @param edges
 * @param group
 */
export function setEdgesGroup(graph: Graph, edges: Edge[], group: number) {
  for (const edge of edges) {
    edge.group = group
    graph.setEdgeGroup(edge.source, edge.target, edge.group)
  }
}

/**
 * Checks if two edges are the same (ignoring direction)
 * @param a
 * @param b
 */
export function isSameEdge(a: Edge, b: Edge): boolean {
  return (
    (a.source === b.source && a.target === b.target) || (a.source === b.target && a.target === b.source)
  )
}

/**
 * Checks if a given list of edges forms a spanning tree
 * @param numNodes
 * @param edges
 */
export function isSpanningTree(numNodes: number, edges: Edge[]): boolean {
  const nodes = new Set<number>()
  for (const edge of edges) {
    nodes.add(edge.source)
    nodes.add(edge.target)
  }
  if (nodes.size !== numNodes) return false

  const qf = new QuickFind(numNodes)
  for (const edge of edges) {
    if (qf.find(edge.source) === qf.find(edge.target)) return false // cycle
    qf.union(edge.source, edge.target)
  }

  return true
}
