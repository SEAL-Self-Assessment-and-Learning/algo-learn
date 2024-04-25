/** This file contains functions to parse simple markdown */

import { ListItem } from "@/components/DrawList.tsx"

/** First, we define the relevant regexes */
export const codeBlockRegex = /^```(.*?)\r?\n^((?:.*(\r?\n|$))*?)^```$/m
export const quoteBlockRegex = /^((?:(?:> ).*(\r?\n|$))+)/m
export const codeRegex = /`([^`]+)`/
export const squareBracketRegex = /\\\[(.*?)\\\]/
export const dollarRegex = /\$([^$]+)\$/
export const boldRegex = /\*\*([^*]+)\*\*/
export const italicRegex = /\*([^*]+)\*/
export const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/
export const tableRegex = /^(\|(?:[^\r\n|]*\|?)+(\r?\n\|(?:[^\r\n|]*\|?)+)*)/m
export const inputRegex = /\{\{(.*?#.*?)\}\}/ // match at least on # to be an input
export const listRegex = /^((?:\s*[-*][^*].*(\r?\n|$))+)/m

// TODO check the regexes for the table and list again

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
  | {
      kind: "table"
      child: { header: string[]; content: string[][]; alignment: string[]; extraFeature: string }
    }
  | { kind: "input"; child: string }
  | { kind: "list"; child: ListItem[] }

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
        const node = {
          kind,
          child: parseMarkdownList(match[0]),
        } as ParseTreeNode
        const before = md.slice(0, match.index)
        const after = md.slice(match.index + match[0].length)
        return [...parseMarkdown(before), node, ...parseMarkdown(after)]
      }
      if (kind === "table") {
        const node = {
          kind,
          child: parseTable(match[0]),
        } as ParseTreeNode
        const before = md.slice(0, match.index)
        const after = md.slice(match.index + match[0].length)
        return [...parseMarkdown(before), node, ...parseMarkdown(after)]
      }
      if (kind === "input") {
        const node = {
          kind,
          child: match[1],
        } as ParseTreeNode
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
 * The parseMarkdown function parses markdown-like text into arrays of content
 *
 * @param table The markdown-like text to parse
 * @returns Header, content and alignment of the table, can also add extra Feature (not md specific) see below
 */
export function parseTable(table: string) {
  const rows = table.split("\n")
  const header: string[] = []
  const content: string[][] = []
  const alignment: string[] = []
  let extraFeature: string = ""

  /*
  The extra feature should be in the last row of the table.
  It only needs to stand in the first column as well, but keep the table format.
  Currently possible extraFeatures:
   - #div_xxx# -> this creates a div around the table with the class=xxx
   - #border_xxx# -> this adds a border around the table with the class=xxx
   - #table_xxx# -> this adds a class=xxx to the table

   Concatenation of the extraFeatures is possible, e.g., #div_xxx?border_yyy#
   */

  // regex expression for extra features
  const regexExtraFeatures: { [key: string]: RegExp } = {
    hashtag: /^#.*#$/,
  }

  let matchedHeader = -1
  let separator: string[] = []
  for (let j = 1; j >= 0; j--) {
    separator = rows[j].split("|")
    const headerPattern = /[ -]*-{3,}[ -]*/

    for (let i = 0; i < separator.length; i++) {
      if (separator[i] === "") {
        if (i === 0 || i === separator.length - 1) {
          continue
        }
        break
      }
      if (separator[i].startsWith(":") && separator[i].endsWith(":")) {
        if (headerPattern.test(separator[i].slice(1, separator[i].length - 1))) {
          alignment.push("center")
        } else {
          matchedHeader = -1
          break
        }
      } else if (separator[i].startsWith(":")) {
        if (headerPattern.test(separator[i].slice(1))) {
          alignment.push("left")
        } else {
          matchedHeader = -1
          break
        }
      } else if (separator[i].endsWith(":")) {
        if (headerPattern.test(separator[i].slice(0, separator[i].length - 1))) {
          alignment.push("right")
        } else {
          matchedHeader = -1
          break
        }
      } else {
        if (headerPattern.test(separator[i])) {
          alignment.push("left")
        } else {
          matchedHeader = -1
          break
        }
      }
      matchedHeader = j
      break
    }
    if (matchedHeader !== -1) break
  }

  if (matchedHeader === 1) {
    const headerLine = rows[0].split("|")
    if (headerLine.length !== separator.length) {
      throw new Error("Header and content have different length. It's not possible to create a table.")
    }
    // add the content of the header to the header array
    for (let i = 0; i < separator.length; i++) {
      if (headerLine[i] !== "") {
        header.push(headerLine[i].trim())
      }
    }
  } else {
    // reset the alignment for all to l
    alignment.length = 0
    for (let i = 0; i < separator.length; i++) {
      alignment.push("left")
    }
  }

  const startIndex = matchedHeader + 1
  let maxLineLength = 0
  for (let i = startIndex; i < rows.length; i++) {
    const contentSplit = rows[i].split("|")
    let contentRow: string[] = []
    for (let j = 0; j < contentSplit.length; j++) {
      let regexMatch = false
      // check for an extra feature
      for (const key in regexExtraFeatures) {
        if (regexExtraFeatures[key].test(contentSplit[j])) {
          if (key == "hashtag") {
            // replace all #
            extraFeature = contentSplit[j].replace(/#/g, "")
          }
          regexMatch = true
          break
        }
      }

      if (regexMatch) break
      if (contentSplit[j] === "") {
        if (j === 0 || j === contentSplit.length - 1) {
          continue
        }
      }
      contentRow.push(contentSplit[j].trim())
    }
    if (contentRow.length === 0) {
      continue
    }
    if (contentRow.length < header.length && contentRow.length !== 0) {
      for (let k = contentRow.length; k < header.length; k++) {
        contentRow.push("")
      }
    } else if (contentRow.length > header.length) {
      if (matchedHeader === 1) contentRow = contentRow.slice(0, header.length)
    }
    if (contentRow.length > maxLineLength) maxLineLength = contentRow.length
    content.push(contentRow)
  }

  // if no matched header was found, all columns need to have the same length
  if (matchedHeader !== -1) {
    for (let i = 0; i < content.length; i++) {
      while (content[i].length !== maxLineLength) {
        content[i].push("")
      }
    }
  }

  return {
    header,
    content,
    alignment,
    extraFeature,
  }
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
