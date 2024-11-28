import { describe, expect, test } from "vitest"
import { QuickUnion } from "@shared/question-generators/unionFind/quickUnion/algorithm.ts"
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
    console.log(quickUnion.getArray())
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
