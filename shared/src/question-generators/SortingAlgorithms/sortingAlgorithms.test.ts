import { describe, expect, test } from "vitest"
import { bubbleSort } from "@shared/question-generators/SortingAlgorithms/BubbleSort/bubbleAlgo.ts"

describe("BubbleSort testing", () => {
  test("Sorts correct", () => {
    const values1 = bubbleSort([4, 2, 4, 1, 5, 7, 3], "asc")
    expect(values1).toEqual([1, 2, 3, 4, 4, 5, 7])
    const values2 = bubbleSort([4, 2, 4, 1, 5, 7, 3], "des")
    expect(values2).toEqual([1, 2, 3, 4, 4, 5, 7].reverse())
  })

  test("Sorts correct until counter", () => {
    const values1 = bubbleSort([4, 2, 4, 1, 5, 7, 3], "asc", 1)
    expect(values1).toEqual([2, 4, 1, 4, 5, 3, 7])
    const values2 = bubbleSort([4, 2, 4, 1, 5, 7, 3], "des", 3)
    expect(values2).toEqual([4, 5, 7, 4, 3, 2, 1])
  })
})
