import { QuickFind } from "@shared/question-generators/unionFind/quickFind/quickFindAlgorithm.ts"
import type { Edge, Graph } from "@shared/utils/graph.ts"

export function kruskalAlgorithm(graph: Graph): Edge[] {
  spanningTreeBaseChecks(graph)
  const minimumSpanningTree: Edge[] = []
  const unionFind = new QuickFind(graph.nodes.length)
  const sortedEdges = graph.edges.flat().sort((a, b) => (a.value ?? 1) - (b.value ?? 1))

  for (const edge of sortedEdges) {
    if (unionFind.find(edge.source) !== unionFind.find(edge.target)) {
      minimumSpanningTree.push(edge)
      unionFind.union(edge.source, edge.target)
    }
    if (minimumSpanningTree.length === graph.nodes.length - 1) {
      return minimumSpanningTree
    }
  }
  throw new Error(
    "The algorithm was not able to compute a spanning tree. The graph might not be connected.",
  )
}

export function spanningTreeBaseChecks(graph: Graph) {
  if (graph.nodes.length === 0) {
    throw new Error("The graph has no nodes.")
  }
  if (graph.edges.length === 0) {
    throw new Error("The graph has no edges.")
  }
  if (graph.directed) {
    throw new Error("Prim and Kruskal only work on undirected graphs.")
  }
}
