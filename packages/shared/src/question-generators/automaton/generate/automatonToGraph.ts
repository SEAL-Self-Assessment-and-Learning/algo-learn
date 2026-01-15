import type { Edge as GraphEdge, Node as GraphNode } from "@shared/utils/graph"
import type { Automaton } from "./automaton"

export interface GraphNodeWithGroup extends GraphNode {
  group: number | null
}

/**
 * Converts an Automaton into graph suitable for rendering.
 *
 * \epsilon is encoded as value === -1
 * start and accepting states are tagged via groups (used for rendering on the client)
 *   - start + end group 0
 *   - end         group 1
 *   - start       group 2
 * self-loops are kept as explicit edges (no helper nodes)
 */
export function autToGraph(automaton: Automaton): {
  nodes: GraphNodeWithGroup[]
  edges: GraphEdge[][]
} {
  const nodes: GraphNodeWithGroup[] = []
  const edges: GraphEdge[][] = []

  // nodes
  automaton.nodes.forEach((n) => {
    nodes.push({
      label: n.label,
      coords: n.coords,
      group: n.isStart && n.isEnd ? 0 : n.isStart ? 2 : n.isEnd ? 1 : null,
    })
    edges.push([])
  })

  // edges
  automaton.edges.forEach((outgoing, u) => {
    outgoing.forEach((e) => {
      const v = e.target
      const value = e.value ?? -1

      edges[u].push({
        source: u,
        target: v,
        value,
      })
    })
  })

  return { nodes, edges }
}
