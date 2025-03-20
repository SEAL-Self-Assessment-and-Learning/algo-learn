import type { Edge } from "@shared/utils/graph"
import type Random from "@shared/utils/random"
import type { AutomatonNode } from "./automaton";
import { Automaton } from "./automaton"

export function generateAutomaton(
  random: Random,
  size: number,
  edgeChance: number = 0.5,
  selfLoopChance: number = 0.2,
  gridWidth?: number,
  gridHeight?: number,
): Automaton {
  const nodes: AutomatonNode[] = Array.from({ length: size }, (_, i) => ({
    label: `q_${i}`,
    coords:
      gridWidth && gridHeight
        ? { x: i % gridWidth, y: Math.floor(i / gridWidth) }
        : { x: random.float(0, 10), y: random.float(0, 10) },
    isStart: false,
    isEnd: false,
  }))

  const edges: Edge[][] = Array.from({ length: size }, () => [])

  // assign start node
  //const startNodeIndex = random.int(0, size - 1)
  const startNodeIndex = 0
  nodes[startNodeIndex].isStart = true

  // assign 1-3 end nodes
  const endNodeIndices = random
    .shuffle(Array.from({ length: size }, (_, i) => i))
    .filter((index) => index !== startNodeIndex)
    .slice(0, random.int(1, 3))

  endNodeIndices.forEach((index) => {
    nodes[index].isEnd = true
  })

  // add directed edges
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (i !== j && random.float(0, 1) < edgeChance) {
        edges[i].push({ source: i, target: j, value: random.int(0, 1) })
      }
    }

    // add self-loops
    if (random.float(0, 1) < selfLoopChance) {
      edges[i].push({ source: i, target: i, value: random.int(0, 1) })
    }
  }

  return new Automaton(nodes, edges, true, true)
}
