import { describe, expect, test } from "vitest"
import { parseRecursiveFunction } from "./formulaUtils"

// Write the test cases
describe("parseRecursiveFunction", () => {
  test("Handles T(n/3) + 7", () => {
    expect(parseRecursiveFunction("T(n/3) + 7")).toEqual({
      a: 1,
      t: "T",
      n: "n",
      b: 3,
      c: 7,
      divOrSub: "div",
    })
  })

  test("Handles 7 T(n/9) + 5", () => {
    expect(parseRecursiveFunction("7 T(n/9) + 5")).toEqual({
      a: 7,
      t: "T",
      n: "n",
      b: 9,
      c: 5,
      divOrSub: "div",
    })
  })

  test("Handles 4 * T(n) + 2", () => {
    expect(parseRecursiveFunction("4 * T(n) + 2")).toEqual({
      a: 4,
      t: "T",
      n: "n",
      b: 1,
      c: 2,
      divOrSub: "div",
    })
  })

  test("Handles T(n/2)", () => {
    expect(parseRecursiveFunction("T(n/2)")).toEqual({
      a: 1,
      t: "T",
      n: "n",
      b: 2,
      c: 0,
      divOrSub: "div",
    })
  })

  test("Handles A(m))", () => {
    expect(parseRecursiveFunction("A(m)")).toEqual({
      a: 1,
      t: "A",
      n: "m",
      b: 1,
      c: 0,
      divOrSub: "div",
    })
  })

  test("Handles whitespaces", () => {
    expect(parseRecursiveFunction("7   *  A (  m /  2)  + 4")).toEqual({
      a: 7,
      t: "A",
      n: "m",
      b: 2,
      c: 4,
      divOrSub: "div",
    })
  })

  test("Handles Subtraction  3 * T(n-2) + 6", () => {
    expect(parseRecursiveFunction("3 * T(n-2) + 6")).toEqual({
      a: 3,
      t: "T",
      n: "n",
      b: 2,
      c: 6,
      divOrSub: "sub",
    })
  })

  test("Handles invalid input - missing function name", () => {
    expect(() => parseRecursiveFunction("7 * (n/3) + 5")).toThrow("Invalid input format")
  })

  test("Handles invalid input - extra parentheses", () => {
    expect(() => parseRecursiveFunction("5 * T((n/2)) + 4")).toThrow("Invalid input format")
  })

  test("Handles invalid input - no variable", () => {
    expect(() => parseRecursiveFunction("3 * T(/2) + 6")).toThrow("Invalid input format")
  })

  test("Handles invalid input - invalid characters", () => {
    expect(() => parseRecursiveFunction("4 * T(@/2) + 8")).toThrow("Invalid input format")
    expect(() => parseRecursiveFunction("4 * 5(n/2) + 8")).toThrow("Invalid input format")
    expect(() => parseRecursiveFunction("4 * T(n/2) + T")).toThrow("Invalid input format")
    expect(() => parseRecursiveFunction("4 * T(n/2) + n")).toThrow("Invalid input format")
  })

  test("Handles invalid input - incomplete expression", () => {
    expect(() => parseRecursiveFunction("T(n/2")).toThrow("Invalid input format")
  })

  test("Handles invalid input - no plus sign", () => {
    expect(() => parseRecursiveFunction("4*T(n/2)5")).toThrow("Invalid input format")
  })
})
