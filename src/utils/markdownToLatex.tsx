import { ParseTree, ParseTreeNode, parseMarkdown } from "./parseMarkdown"

/**
 * Function to render a given markdown-like string in LaTeX
 *
 * @param md The markdown-like string to render
 * @returns The LaTeX string
 */
export function markdownToLatex(md: string): string {
  return markdownTreeToLatex(parseMarkdown(md))
}

/**
 * Function to render a given markdown-like string in LaTeX
 *
 * @param md The markdown-like string to render
 * @returns The LaTeX string
 */
export function markdownTreeToLatex(tree: ParseTree | ParseTreeNode): string {
  if (typeof tree === "string") {
    return tree
  } else if (Array.isArray(tree)) {
    return tree.map(markdownTreeToLatex).join("")
  } else if (tree.kind === "$") {
    return `$${tree.child}$`
  } else if (tree.kind === "$$") {
    return `\\[${tree.child}\\]`
  } else if (tree.kind === "*") {
    return `\\emph{${markdownTreeToLatex(tree.child)}}`
  } else if (tree.kind === "**") {
    return `\\textbf{${markdownTreeToLatex(tree.child)}}`
  } else if (tree.kind === "`") {
    return `\\texttt{${markdownTreeToLatex(tree.child)}}`
  } else if (tree.kind === "```") {
    return `\\begin{verbatim}\n${markdownTreeToLatex(
      tree.child
    )}\n\\end{verbatim}`
  } else if (tree.kind === ">") {
    return `\\begin{quote}\n${markdownTreeToLatex(tree.child)}\n\\end{quote}`
  } else if (tree.kind === "a") {
    return `\\href{${tree.url}}{${markdownTreeToLatex(tree.child)}}`
  }

  // will never be reached:
  return ""
}
