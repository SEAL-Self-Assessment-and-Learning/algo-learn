import { describe, expect, test } from "vitest"
import { QuickUnion } from "@shared/question-generators/unionFind/quickUnion/algorithm.ts"
import { WeightedQuickUnion } from "@shared/question-generators/unionFind/weightedQuickUnion/algorithm.ts"
import { WeightedQuickUnionPath } from "@shared/question-generators/unionFind/weightedQuickUnionPath/algorithm.ts"
import { QuickFind } from "./quickFind/algorithm.ts"

describe("UnionFind via QuickFind", () => {
  test("Test union operation", () => {
    const uf = new QuickFind(10)

    uf.union(1, 2)
    expect(uf.find(1)).toEqual(uf.find(2))

    uf.union(3, 4)
    expect(uf.find(3)).toEqual(uf.find(4))

    expect(uf.find(1)).not.toEqual(uf.find(3))

    uf.union(2, 3)
    expect(uf.find(1)).toEqual(uf.find(3))
  })
})

describe("UnionFind via QuickUnion", () => {
  test("Test union operation", () => {
    const quickUnion = new QuickUnion(7)

    quickUnion.union(3, 4)
    expect(quickUnion.getArray()).toEqual([0, 1, 2, 4, 4, 5, 6])

    quickUnion.union(5, 0)
    expect(quickUnion.getArray()).toEqual([0, 1, 2, 4, 4, 0, 6])

    quickUnion.union(4, 5)
    expect(quickUnion.getArray()).toEqual([0, 1, 2, 4, 0, 0, 6])

    quickUnion.union(4, 3)
    expect(quickUnion.getArray()).toEqual([0, 1, 2, 4, 0, 0, 6])

    quickUnion.union(0, 1)
    expect(quickUnion.getArray()).toEqual([1, 1, 2, 4, 0, 0, 6])

    quickUnion.union(2, 6)
    expect(quickUnion.getArray()).toEqual([1, 1, 6, 4, 0, 0, 6])

    quickUnion.union(0, 4)
    expect(quickUnion.getArray()).toEqual([1, 1, 6, 4, 0, 0, 6])

    quickUnion.union(6, 0)
    expect(quickUnion.getArray()).toEqual([1, 1, 6, 4, 0, 0, 1])
  })
})

describe("UnionFind via Weighted QuickUnion", () => {
  test("Test union operation", () => {
    const weightedQuickUnion = new WeightedQuickUnion(7)

    weightedQuickUnion.union(3, 4)
    expect(weightedQuickUnion.getArray()).toEqual([0, 1, 2, 4, 4, 5, 6])

    weightedQuickUnion.union(5, 0)
    expect(weightedQuickUnion.getArray()).toEqual([0, 1, 2, 4, 4, 0, 6])

    weightedQuickUnion.union(4, 5)
    expect(weightedQuickUnion.getArray()).toEqual([0, 1, 2, 4, 0, 0, 6])

    weightedQuickUnion.union(4, 3)
    expect(weightedQuickUnion.getArray()).toEqual([0, 1, 2, 4, 0, 0, 6])

    weightedQuickUnion.union(0, 1)
    expect(weightedQuickUnion.getArray()).toEqual([0, 0, 2, 4, 0, 0, 6])

    weightedQuickUnion.union(2, 6)
    expect(weightedQuickUnion.getArray()).toEqual([0, 0, 6, 4, 0, 0, 6])

    weightedQuickUnion.union(0, 4)
    expect(weightedQuickUnion.getArray()).toEqual([0, 0, 6, 4, 0, 0, 6])

    weightedQuickUnion.union(6, 0)
    expect(weightedQuickUnion.getArray()).toEqual([0, 0, 6, 4, 0, 0, 0])
  })
})

describe("UnionFind via Weighted QuickUnion with path compression", () => {
  test("Test union operation", () => {
    const weightedQuickUnionPath = new WeightedQuickUnionPath(7)

    weightedQuickUnionPath.union(3, 4)
    expect(weightedQuickUnionPath.getArray()).toEqual([0, 1, 2, 4, 4, 5, 6])

    weightedQuickUnionPath.union(5, 0)
    expect(weightedQuickUnionPath.getArray()).toEqual([0, 1, 2, 4, 4, 0, 6])

    weightedQuickUnionPath.union(4, 5)
    expect(weightedQuickUnionPath.getArray()).toEqual([0, 1, 2, 4, 0, 0, 6])

    weightedQuickUnionPath.union(4, 3)
    expect(weightedQuickUnionPath.getArray()).toEqual([0, 1, 2, 0, 0, 0, 6])

    weightedQuickUnionPath.union(0, 1)
    expect(weightedQuickUnionPath.getArray()).toEqual([0, 0, 2, 0, 0, 0, 6])

    weightedQuickUnionPath.union(2, 6)
    expect(weightedQuickUnionPath.getArray()).toEqual([0, 0, 6, 0, 0, 0, 6])

    weightedQuickUnionPath.union(0, 4)
    expect(weightedQuickUnionPath.getArray()).toEqual([0, 0, 6, 0, 0, 0, 6])

    weightedQuickUnionPath.union(6, 0)
    expect(weightedQuickUnionPath.getArray()).toEqual([0, 0, 6, 0, 0, 0, 0])
  })
})
