/** This file contains functions to parse simple markdown */

/** First, we define the relevant regexes */
export const codeBlockRegex = /^```(.*?)\r?\n^((?:.*(\r?\n|$))*?)^```$/m
export const quoteBlockRegex = /^((?:(?:> ).*(\r?\n|$))+)/m
export const codeRegex = /`([^`]+)`/
export const squareBracketRegex = /\\\[(.*?)\\\]/
export const dollarRegex = /\$([^$]+)\$/
export const boldRegex = /\*\*([^*]+)\*\*/
export const italicRegex = /\*([^*]+)\*/
export const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/

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

/**
 * The parseMarkdown function parses markdown-like text into a parse tree.
 *
 * @param md The markdown-like text to parse
 * @returns The parse tree
 */
export function parseMarkdown(md: string): ParseTree {
  if (md === "") return []

  const regexes = [
    { regex: codeBlockRegex, kind: "```", markdown: false },
    { regex: quoteBlockRegex, kind: ">", markdown: true },
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
