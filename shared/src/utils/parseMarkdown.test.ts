import { describe, expect, test } from "vitest"
import { parseTable } from "@shared/utils/parseMarkdown.ts"

describe("tables", () => {
  test("default table", () => {
    const mdTable = `|A|B|C|
|:--|:-:|--:|
|a1|b1|c1|
|a2|b2|c2|
|a3|b3|c3|
|a4|b4|c4|`

    const parsedTable = parseTable(mdTable)

    expect(parsedTable.content).toHaveLength(5)
    parsedTable.content.forEach((row) => {
      expect(row).toHaveLength(3)
    })
    expect(parsedTable.format.alignment).toEqual(["left", "center", "right"])
  })

  test("extended table", () => {
    const mdTable = `|A|B|C|
|:==|!:=:|==:|
|a1|b1|c1|
|a2|b2|c2|
|a3|b3|c3|
|-|-|-|
|a4|b4|c4|`

    const parsedTable = parseTable(mdTable)

    expect(parsedTable.content).toHaveLength(5)
    parsedTable.content.forEach((row) => {
      expect(row).toHaveLength(3)
    })
    expect(parsedTable.format.alignment).toEqual(["left", "center", "right"])
    expect(parsedTable.format.header).toBeTruthy()
    expect(parsedTable.format.hLines).toEqual([0, 3])
    expect(parsedTable.format.vLines).toEqual([0])
  })
})
