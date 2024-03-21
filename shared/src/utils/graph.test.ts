import { expect, test } from "vitest"
import { Graph } from "./graph.ts"

test("parse", () => {
  const graphStr = '3 3 1 1\n1 0 3 "A"\n0 1 4 "B"\n1 1 5 "C"\n0 1 1 1\n1 2 2 2\n2 0 3 3\n'

  const graph = Graph.parse(graphStr)

  expect(graph.nodes[0].label).toEqual("A")
  expect(graph.nodes[1].label).toEqual("B")
  expect(graph.nodes[2].label).toEqual("C")
  expect(graph.nodes[0].group).toEqual(3)
  expect(graph.nodes[1].group).toEqual(4)
  expect(graph.nodes[2].group).toEqual(5)

  expect(graph.toString()).toEqual(graphStr)
})
