import { describe, expect, test } from "vitest"
import { bubbleSort } from "@shared/question-generators/SortingAlgorithms/BubbleSort/bubbleAlgo.ts"

describe("BubbleSort testing", () => {
  test("Sorts correct", () => {
    const values1 = bubbleSort([4, 2, 4, 1, 5, 7, 3], "asc").values
    expect(values1).toEqual([1, 2, 3, 4, 4, 5, 7])
    const values2 = bubbleSort([4, 2, 4, 1, 5, 7, 3], "des").values
    expect(values2).toEqual([1, 2, 3, 4, 4, 5, 7].reverse())
  })

  test("Sorts correct until counter", () => {
    const values1 = bubbleSort([4, 2, 4, 1, 5, 7, 3], "asc", 1).values
    expect(values1).toEqual([2, 4, 1, 4, 5, 3, 7])
    const values2 = bubbleSort([4, 2, 4, 1, 5, 7, 3], "des", 3).values
    expect(values2).toEqual([4, 5, 7, 4, 3, 2, 1])
  })

  test("Correct amount of swaps", () => {
    const values1 = bubbleSort([1, 2, 3, 4, 5, 6], "asc", 1).numberSwaps
    expect(values1).toEqual(0)
    const values2 = bubbleSort([4, 2, 4, 1, 5, 7, 3], "asc").numberSwaps
    expect(values2).toEqual(8)
  })

  test("Correct amount of swaps after rounds", () => {
    const values = bubbleSort([4, 2, 4, 1, 5, 7, 3], "asc", 3).numberSwaps
    expect(values).toEqual(7)
  })
})
