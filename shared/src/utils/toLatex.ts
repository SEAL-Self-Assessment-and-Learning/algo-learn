import {
  FreeTextQuestion,
  MultipleChoiceQuestion,
  Question,
} from "../api/QuestionGenerator"
import { parseMarkdown, ParseTree, ParseTreeNode } from "./parseMarkdown"

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
      tree.child,
    )}\n\\end{verbatim}`
  } else if (tree.kind === ">") {
    return `\\begin{quote}\n${markdownTreeToLatex(tree.child)}\n\\end{quote}`
  } else if (tree.kind === "a") {
    return `\\href{${tree.url}}{${markdownTreeToLatex(tree.child)}}`
  }

  // will never be reached:
  return ""
}

/** Function to render the question in LaTeX */
export function questionToTex(question: Question): string {
  const t = question.type
  if (t === "MultipleChoiceQuestion") {
    const q: MultipleChoiceQuestion = question
    return `\\begin{exercise}[${markdownToLatex(q.name)}]
${markdownToLatex(q.text ?? "")}
\\begin{itemize}
${q.answers.map((answer) => `    \\item ${markdownToLatex(answer)}`).join("\n")}
\\end{itemize}
\\end{exercise}`
  } else if (t === "FreeTextQuestion") {
    const q: FreeTextQuestion = question
    return `\\begin{exercise}[${markdownToLatex(q.name)}]
${markdownToLatex(q.text ?? "")}

${markdownToLatex(q.prompt ?? "")}
\\end{exercise}`
  } else {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Unsupported question type: ${t}`)
  }
}
