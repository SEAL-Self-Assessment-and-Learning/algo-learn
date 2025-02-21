/** This file contains functions to parse simple markdown */

export type ListItem = {
  level: number
  text: string
}

/** First, we define the relevant regexes */
export const codeBlockRegex = /^```(.*?)\r?\n^((?:.*(\r?\n|$))*?)^```$/m
export const quoteBlockRegex = /^((?:(?:> ).*(\r?\n|$))+)/m
export const codeRegex = /`([^`]+)`/
export const squareBracketRegex = /\\\[(.*?)\\\]/
export const dollarRegex = /\$([^$]+)\$/
export const boldRegex = /\*\*([^*]+)\*\*/
export const italicRegex = /\*([^*]+)\*/
export const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/
export const tableRegex = /^(\|(?:[^\r\n|]*\|)+(?:\r?\n\|(?:[^\r\n|]*\|)+)*)/m
export const inputRegex = /\{\{(.*?#.*?)\}\}/ // match at least on # to be an input
export const listRegex = /^((?:\s*-\s[^*].*(\r?\n|$))+)/m
// TODO check the regexes for the list again

/**
 * The parser converts the markdown string to a ParseTree object defined as
 * follows:
 */
export type ParseTree = ParseTreeNode[]
export type ParseTreeNode =
  | string
  | { kind: "`"; child: string }
  | { kind: "```"; child: string; language?: string }
  | { kind: "$$" | "$"; child: string }
  | { kind: "**" | "*" | ">"; child: ParseTree }
  | { kind: "a"; child: ParseTree; url: string }
  | { kind: "table"; child: TableNode }
  | { kind: "input"; child: string }
  | { kind: "list"; child: ListItem[] }
export type TableNode = {
  content: ParseTree[][]
  format: {
    header: boolean
    vLines: number[]
    hLines: number[]
    alignment: ColumnAlignment[]
  }
}
export type ColumnAlignment = "left" | "center" | "right"

/**
 * The parseMarkdown function parses markdown-like text into a parse tree.
 *
 * @param md The markdown-like text to parse
 * @returns The parse tree
 */
export function parseMarkdown(md: string): ParseTree {
  if (md === "") return []

  const regexes = [
    { regex: tableRegex, kind: "table", markdown: false },
    { regex: listRegex, kind: "list", markdown: true },
    { regex: codeBlockRegex, kind: "```", markdown: false },
    { regex: quoteBlockRegex, kind: ">", markdown: true },
    { regex: inputRegex, kind: "input", markdown: false },
    { regex: codeRegex, kind: "`", markdown: false },
    { regex: squareBracketRegex, kind: "$$", markdown: false },
    { regex: dollarRegex, kind: "$", markdown: false },
    { regex: boldRegex, kind: "**", markdown: true },
    { regex: italicRegex, kind: "*", markdown: true },
    { regex: linkRegex, kind: "a", markdown: true },
  ]

  // parse regexes whose match text is plain text
  for (const { regex, kind, markdown } of regexes) {
    const match = regex.exec(md)
    if (match) {
      if (kind === "```") {
        ;[match[1], match[2]] = [match[2], match[1]]
      }
      if (kind === ">") {
        // remove the leading "> " from each line
        match[1] = match[1]
          .split(/\r?\n/)
          .map((line) => line.slice(2))
          .join("\n")
      }
      if (kind === "list") {
        const node: ParseTreeNode = {
          kind,
          child: parseMarkdownList(match[0]),
        }
        const before = md.slice(0, match.index)
        const after = md.slice(match.index + match[0].length)
        return [...parseMarkdown(before), node, ...parseMarkdown(after)]
      }
      if (kind === "table") {
        const node: ParseTreeNode = {
          kind,
          child: parseTable(match[0]),
        }
        const before = md.slice(0, match.index)
        const after = md.slice(match.index + match[0].length)
        return [...parseMarkdown(before), node, ...parseMarkdown(after)]
      }
      if (kind === "input") {
        const node: ParseTreeNode = {
          kind,
          child: match[1],
        }
        const before = md.slice(0, match.index)
        const after = md.slice(match.index + match[0].length)
        return [...parseMarkdown(before), node, ...parseMarkdown(after)]
      }
      const node = {
        kind,
        child: markdown ? parseMarkdown(match[1]) : match[1],
      } as ParseTreeNode
      if (typeof node !== "string" && node.kind === "a") {
        node.url = match[2]
      }
      if (typeof node !== "string" && node.kind === "```") {
        node.language = match[2]
      }
      const before = md.slice(0, match.index)
      const after = md.slice(match.index + match[0].length)
      return [...parseMarkdown(before), node, ...parseMarkdown(after)]
    }
  }
  return [md]
}

/**
 * Parses a markdown-like table.
 * Supports the default Markdown table syntax and extends it the following way:
 * - A header line can be indicated by having it followed by a line like `|====|====|`.
 * - Lines like `|----|----|` indicate horizontal subdivisions of the tables
 * - The first horizontal line indicator (`|====|====|` or `|----|----|`) also supports `!` on
 *    either side of `|` to indicate a visual vertical subdivision of the table as well as an alignment indicated by `:`.
 *    If the first horizontal line indicator is the very first line of the table, it does not result in a horizontal line
 *    and is only used for formatting purposes.
 * Example:
 * | A | B | C |
 * |===:|!:===:|===|
 * | a1 | b1 | c1 |
 * | a2 | b2 | c2 |
 * |---|---|---|
 * | a3 | b3 | c3 |
 * The table has a table header, the first column is justified right, and the second column is centered.
 * There is a visual subdivision between the first and second column as well as between the second and third row.
 * @param table The markdown-like text to parse
 * @returns TableNode
 */
export function parseTable(table: string): TableNode {
  const formattingRegex = /^\|(?:(?:[:!]*=+[:!]*\|)+|(?:[:!]*-+[:!]*\|)+)$/
  const rows = table.split(/\r?\n/)
  const node: TableNode = {
    content: [],
    format: {
      header: false,
      vLines: [],
      hLines: [],
      alignment: [],
    },
  }

  const getCellsOfRow = (line: string) =>
    line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim())

  const formattingRowIndex = rows.findIndex((row) => formattingRegex.test(row))

  if (formattingRowIndex >= 0) {
    node.format.header = rows[formattingRowIndex].includes("=") && formattingRowIndex === 1
    const cellsOfRow = getCellsOfRow(rows[formattingRowIndex])
    cellsOfRow.forEach((cell, i) => {
      const [left, right] = cell.split(/[-=]+/)
      if (left.includes("!") && i > 0) node.format.vLines.push(i - 1)
      if (right.includes("!")) node.format.vLines.push(i)
      const alignment = (left.includes(":") ? 1 : 0) + (right.includes(":") ? 2 : 0)
      if (alignment === 2) node.format.alignment.push("right")
      else if (alignment === 3) node.format.alignment.push("center")
      else node.format.alignment.push("left")
    })
  }

  for (let i = 0; i < rows.length; i++) {
    if (formattingRegex.test(rows[i])) {
      node.format.hLines.push(node.content.length - 1)
    } else {
      node.content.push(getCellsOfRow(rows[i]).map(parseMarkdown))
    }
  }

  return node
}

function parseMarkdownList(list: string): ListItem[] {
  const pattern = /( *)- ([^:\n]+)(?:: ([^\n]*))?\n?/
  const lines = list.split("\n")
  const result: ListItem[] = []
  for (let i = 0; i < lines.length; i++) {
    const match = pattern.exec(lines[i])
    if (match) {
      const ident = match[1].length
      const text = match[2]
      result.push({ level: ident, text: text })
    }
  }
  return result
}
