import { describe, expect, test } from "vitest"
import { computeStrength } from "./memoryModel"

describe("memoryModel", () => {
  test("wrong answers decrease p", () => {
    const { p: p0 } = computeStrength({ numPassed: 0, numFailed: 0, lag: 1 })
    const { p: p1 } = computeStrength({ numPassed: 0, numFailed: 1, lag: 1 })
    const { p: p2 } = computeStrength({ numPassed: 0, numFailed: 2, lag: 1 })
    expect(p0).toBeGreaterThan(p1)
    expect(p1).toBeGreaterThan(p2)
    console.log(p0, p1, p2)
  })
  test("correct answers increase p", () => {
    const { p: p0 } = computeStrength({ numPassed: 0, numFailed: 0, lag: 1 })
    const { p: p1 } = computeStrength({ numPassed: 1, numFailed: 0, lag: 1 })
    const { p: p2 } = computeStrength({ numPassed: 2, numFailed: 0, lag: 1 })
    expect(p0).toBeLessThan(p1)
    expect(p1).toBeLessThan(p2)
  })
  test("lag decreases p", () => {
    const { p: p0 } = computeStrength({ numPassed: 7, numFailed: 1, lag: 1 })
    const { p: p1 } = computeStrength({ numPassed: 7, numFailed: 1, lag: 2 })
    const { p: p2 } = computeStrength({ numPassed: 7, numFailed: 1, lag: 3 })
    expect(p0).toBeGreaterThan(p1)
    expect(p1).toBeGreaterThan(p2)
  })
})
