import type { Edge, Node } from "@shared/utils/graph";
import { Graph } from "@shared/utils/graph"

export interface AutomatonNode extends Node {
  isStart?: boolean
  isEnd?: boolean
}

export class Automaton extends Graph {
  nodes: AutomatonNode[]

  constructor(nodes: AutomatonNode[], edges: Edge[][], directed: boolean, weighted: boolean) {
    super(nodes, edges, directed, weighted)
    this.nodes = nodes
  }

  public static isStartNode(node: AutomatonNode): boolean {
    return node.isStart ?? false
  }

  public static isEndNode(node: AutomatonNode): boolean {
    return node.isEnd ?? false
  }
}
