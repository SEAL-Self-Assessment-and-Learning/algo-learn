import { describe, expect, test } from "vitest"
import { Graph, RootedTree } from "./graph.ts"

// Todo: More parsing tests
test("parse", () => {
  const graphStr = '3 3 1 1 0 1 0 0 0 0\n1 0 3 "A"\n0 1 4 "B"\n1 1 5 "C"\n0 1 1 1\n1 2 2 2\n2 0 3 3\n'

  const graph = Graph.parse(graphStr)

  expect(graph.nodes[0].label).toEqual("A")
  expect(graph.nodes[1].label).toEqual("B")
  expect(graph.nodes[2].label).toEqual("C")
  expect(graph.nodes[0].group).toEqual(3)
  expect(graph.nodes[1].group).toEqual(4)
  expect(graph.nodes[2].group).toEqual(5)

  expect(graph.toString()).toEqual(graphStr)
})

describe("tree traversal", () => {
  const tree = new RootedTree("a", [new RootedTree("b"), new RootedTree("c")])

  test("preorder", () => {
    expect(tree.getTraversalOrder("pre")).toEqual(["a", "b", "c"])
  })

  test("inorder", () => {
    expect(tree.getTraversalOrder("in")).toEqual(["b", "a", "c"])
  })

  test("postorder", () => {
    expect(tree.getTraversalOrder("post")).toEqual(["b", "c", "a"])
  })
})
