import { describe, expect, test } from "vitest"
import { ColumnAlignment, mdInputField, mdTableFromData } from "@shared/utils/markdownTools.ts"

describe("mdInputField()", () => {
  // todo test other function when added
  test("default", () => {
    expect(mdInputField("testID")).toEqual("{{testID####overlay}}")
  })
})

describe("mdTableFromData()", () => {
  const header = ["A", "B", "C"]
  const data = [
    ["a1", "b1", "c1"],
    ["a2", "b2", "c2"],
    ["a3", "b3", "c3"],
    ["a4", "b4", "c4"],
  ]
  const alignment: ColumnAlignment[] = ["left", "center", "right"]

  test("just data", () => {
    const mdTable = `|:---|:---|:---|
| A | B | C |
| a1 | b1 | c1 |
| a2 | b2 | c2 |
| a3 | b3 | c3 |
| a4 | b4 | c4 |
`
    expect(mdTableFromData([header, ...data])).toStrictEqual(mdTable)
  })

  test("formatting without any lines", () => {
    const mdTable = `|:---|:---:|---:|
| A | B | C |
| a1 | b1 | c1 |
| a2 | b2 | c2 |
| a3 | b3 | c3 |
| a4 | b4 | c4 |
`
    expect(mdTableFromData([header, ...data], alignment)).toStrictEqual(mdTable)
  })

  test("hLine at the top", () => {
    const mdTable = `| A | B | C |
|:---|:---:|---:|
| a1 | b1 | c1 |
| a2 | b2 | c2 |
| a3 | b3 | c3 |
| a4 | b4 | c4 |
`
    expect(mdTableFromData([header, ...data], alignment, undefined, [0])).toStrictEqual(mdTable)
  })

  test("header with random hLine", () => {
    const mdTable = `| A | B | C |
|:===|:===:!|===:|
| a1 | b1 | c1 |
| a2 | b2 | c2 |
| a3 | b3 | c3 |
|---|---|---|
| a4 | b4 | c4 |
`
    expect(mdTableFromData(data, alignment, header, [2], [1])).toStrictEqual(mdTable)
  })

  test("header with hLine in first data row", () => {
    const mdTable = `| A | B | C |
|:===|:===:!|===:|
| a1 | b1 | c1 |
|---|---|---|
| a2 | b2 | c2 |
| a3 | b3 | c3 |
| a4 | b4 | c4 |
`
    expect(mdTableFromData(data, alignment, header, [0], [1])).toStrictEqual(mdTable)
  })
})
