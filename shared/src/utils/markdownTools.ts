/**
 * Collection of function to generate (non-standard) Markdown.
 * In general, these function should be used in order to be able to easily update/extend markdown features.
 */

import type { ColumnAlignment } from "./parseMarkdown"

/**
 * Generates Markdown for an inline input field.
 * todo add all other options of the input field and add tests
 * @param id The id the input can be checked under
 */
export function mdInputField(id: string): string {
  return `{{${id}####overlay}}`
}

/**
 * Generates Markdown table code representing the given data and settings
 * @param data  It is expected that all rows have the same number of items. It is not checked.
 * @param alignment One value is applied to all columns, an array of values is expected to have one value per column.
 * @param header Shown as a highlighted header. No need to add 0 as a hLine.
 * @param hLines Index of the rows having a horizontal line. The row index starts at 0 excluding the optional header. The lines are drawn as bottom-border.
 * @param vLines Index of the columns having a vertical line. The column index starts at 0. The lines are drawn as right-border.
 */
export function mdTableFromData(
  data: string[][],
  alignment: ColumnAlignment | ColumnAlignment[] = "left",
  header?: string[],
  hLines: number[] = [],
  vLines: number[] = [],
): string {
  if (!Array.isArray(alignment)) {
    alignment = Array(data[0].length).fill(alignment)
  }

  let formattingLine = ""
  const formattingLineType = header ? "===" : "---"
  const alignmentMap = {
    left: `|:${formattingLineType}`,
    center: `|:${formattingLineType}:`,
    right: `|${formattingLineType}:`,
  }

  alignment.forEach((a, col) => {
    formattingLine += alignmentMap[a] + (vLines.includes(col) ? "!" : "")
  })
  formattingLine += "|\n"

  const hLine = "|" + "---|".repeat(data[0].length) + "\n"
  let tableStr = !header && !hLines.includes(0) ? formattingLine : ""

  const toRow = (line: string[]) => `| ${line.join(" | ")} |\n`

  if (header) {
    tableStr += toRow(header) + formattingLine
  }

  data.forEach((row, i) => {
    tableStr += toRow(row)
    if (hLines.includes(i)) tableStr += !header && i === 0 ? formattingLine : hLine
  })

  return tableStr
}
