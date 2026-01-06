import type { Automaton } from "./automaton"
import type { Edge as GraphEdge, Node as GraphNode } from "@shared/utils/graph"

export interface GraphNodeWithGroup extends GraphNode {
  group: number | null
}

/**
 * Converts an Automaton into graph suitable for rendering.
 *
 * \epsilon is encoded as value === -1
 * start and accepting states are colored via groups
 *   - start       group 0 green
 *   - end         group 1 red
 *   - start + end group 2 blue
 * self-loops are rewritten using helper nodes
 * i.e. q -1-> q is rendered as q -1-> q' --> q
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
      group: n.isStart && n.isEnd ? 0 : n.isStart ? 2 : n.isEnd ? 1 : null
    })
    edges.push([])
  })

  let helperCounter = 0

  // edges
  automaton.edges.forEach((outgoing, u) => {
    outgoing.forEach((e) => {
      const v = e.target
      const value = e.value ?? -1

      // rewrite self-loops
      if (u === v) {
        const helperIndex = nodes.length
        const base = nodes[u]

        nodes.push({
          label: `${base.label}_loop_${helperCounter++}`,
          coords: {
            x: base.coords.x + 0.6,
            y: base.coords.y + 0.6,
          },
          group: null,
        })
        edges.push([])

        edges[u].push({
          source: u,
          target: helperIndex,
          value,
        })

        edges[helperIndex].push({
          source: helperIndex,
          target: u,
          value: -1,
        })
      } else {
        edges[u].push({
          source: u,
          target: v,
          value,
        })
      }
    })
  })

  return { nodes, edges }
}
