import { spanningTreeBaseChecks } from "@shared/question-generators/graph-algorithms/spanningtree/kruskalAlgo.ts"
import type { Edge, Graph, Node } from "@shared/utils/graph.ts"

/**
 *
 * @param graph -
 *              - in case unweighted edge, assumes weight 1
 * @param startNode
 */
export function primAlgorithm(graph: Graph, startNode: Node) {
  spanningTreeBaseChecks(graph)
  if (!checkNodeIncluded(graph, startNode)) {
    throw new Error()
  }
  const minimumSpanningTree: Edge[] = []
  const startNodeIndex: number = graph.nodes.findIndex((node) => node.label === startNode.label)
  const seenNodes: Set<number> = new Set<number>()
  seenNodes.add(startNodeIndex)
  while (minimumSpanningTree.length < graph.getNumNodes() - 1) {
    const edgeOptions = graph.edges
      .flat()
      .filter(
        (edge) =>
          (seenNodes.has(edge.source) && !seenNodes.has(edge.target)) ||
          (!seenNodes.has(edge.source) && seenNodes.has(edge.target)),
      )
      .sort((a, b) => (a.value ?? 1) - (b.value ?? 1))
    if (edgeOptions.length === 0) {
      throw new Error(
        "The algorithm was not able to compute a spanning tree. The graph might not be connected.",
      )
    }
    minimumSpanningTree.push(edgeOptions[0])
    seenNodes.add(edgeOptions[0].source)
    seenNodes.add(edgeOptions[0].target)
  }
  return minimumSpanningTree
}

function checkNodeIncluded(graph: Graph, node: Node): boolean {
  return graph.nodes.some((x) => x.label === node.label)
}
