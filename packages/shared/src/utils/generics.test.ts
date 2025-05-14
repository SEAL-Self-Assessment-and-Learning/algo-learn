import { expect, test } from "vitest"
import { _ } from "./generics.ts"

test("isEqual", () => {
  expect(_.isEqual(0, 0)).toBeTruthy()
  expect(_.isEqual(1, 1)).toBeTruthy()
  expect(_.isEqual(null, null)).toBeTruthy()
  expect(_.isEqual(true, true)).toBeTruthy()
  expect(_.isEqual(false, false)).toBeTruthy()
  expect(_.isEqual("", "")).toBeTruthy()
  expect(_.isEqual("test", "test")).toBeTruthy()
  expect(_.isEqual([], [])).toBeTruthy()
  expect(_.isEqual([1, 2], [1, 2])).toBeTruthy()
  expect(_.isEqual({}, {})).toBeTruthy()
  expect(_.isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBeTruthy()
  expect(_.isEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBeTruthy()
  expect(_.isEqual([{ a: 1, b: 2 }], [{ b: 2, a: 1 }])).toBeTruthy()
  expect(
    _.isEqual(
      [
        { a: 1, b: 2 },
        { b: 2, a: 1 },
      ],
      [
        { a: 1, b: 2 },
        { b: 2, a: 1 },
      ],
    ),
  ).toBeTruthy()

  expect(_.isEqual(0, 1)).toBeFalsy()
  expect(_.isEqual("a", "A")).toBeFalsy()
  expect(_.isEqual([1], [2])).toBeFalsy()
  expect(_.isEqual([1, 2], [2, 1])).toBeFalsy()
  expect(_.isEqual({ a: 1, b: 2 }, { a: 2, b: 2 })).toBeFalsy()
  expect(_.isEqual({ a: 1, b: 2 }, { a: 2, b: 2, c: 3 })).toBeFalsy()
  expect(_.isEqual({ a: 1, b: 2, c: 3 }, { a: 2, b: 2 })).toBeFalsy()
  expect(_.isEqual({ a: 1, c: 2 }, { a: 2, b: 2 })).toBeFalsy()
  expect(
    _.isEqual(
      [
        { a: 1, b: 2 },
        { b: 2, a: 1 },
      ],
      [
        { a: 1, b: 2 },
        { b: 2, a: 2 },
      ],
    ),
  ).toBeFalsy()
})

test("zip", () => {
  expect(_.zip([1, 2], [3, 4])).toEqual([
    [1, 3],
    [2, 4],
  ])
})

test("unzip", () => {
  expect(
    _.unzip([
      ["a", 1, true],
      ["b", 2, false],
    ]),
  ).toEqual([
    ["a", "b"],
    [1, 2],
    [true, false],
  ])
})
