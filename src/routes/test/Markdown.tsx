import { Fragment, FunctionComponent } from "react"
import TeX from "../../components/TeX"

const codeRegex = /`([^`]+)`/g
const squareBracketRegex = /\[([^\]]+)\]\(([^)]+)\)/g
const dollarRegex = /\$([^$]+)\$/g
const boldRegex = /\*\*([^*]+)\*\*/g
const italicRegex = /\*([^*]+)\*/g
const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g

/**
 * Function to render a given markdown-like string in LaTeX
 *
 * @param text The markdown-like string to render
 * @returns The LaTeX string
 */
export function markdownToLatex(text: string): string {
  // TODO: this is a hacky implementation; replace with a proper markdown parser

  // find all markdown code text and replace it with \texttt LaTeX commands
  text = text.replace(codeRegex, (_, text: string) => `\\texttt{${text}}`)

  // find all markdown links and replace them with \href LaTeX commands
  text = text.replace(
    linkRegex,
    (_, text: string, url: string) => `\\href{${url}}{${text}}`
  )

  // find all markdown bold text and replace it with \textbf LaTeX commands
  text = text.replace(boldRegex, (_, text: string) => `\\textbf{${text}}`)

  // find all markdown italic text and replace it with \textit LaTeX commands
  text = text.replace(italicRegex, (_, text: string) => `\\textit{${text}}`)

  return text
}

/**
 * Function to render a given markdown-like string as a React component
 *
 * @param props
 * @param props.text The markdown-like string to render
 * @returns The React component
 */
export const Markdown: FunctionComponent<{ text: string }> = ({ text }) => {
  return <MarkdownTree parseTree={parseMarkdownText(text)} />
}

/**
 * Function to render a given parseTree as a React component
 *
 * @param props
 * @param props.parseTree The parse tree to render
 * @returns The React component
 */
export const MarkdownTree: FunctionComponent<{
  parseTree: ParseTree
}> = ({ parseTree }) => {
  // TODO: Implement this function
  return (
    <>
      {parseTree.map((node, index) => (
        <Fragment key={index}>
          <MarkdownTreeNode parseTreeNode={node} />
        </Fragment>
      ))}
    </>
  )
}

/**
 * Function to render a given parseTreeNode as a React component
 *
 * @param props
 * @param props.parseTreeNode The parse tree node to render
 * @returns The React component
 */
export const MarkdownTreeNode: FunctionComponent<{
  parseTreeNode: ParseTreeNode
}> = ({ parseTreeNode }) => {
  if (typeof parseTreeNode === "string") {
    return <>{parseTreeNode}</>
  }
  if (parseTreeNode.kind === "$$") {
    return (
      <TeX block>
        <MarkdownTree parseTree={parseTreeNode.child} />
      </TeX>
    )
  }
  if (parseTreeNode.kind === "$") {
    return (
      <TeX>
        <MarkdownTree parseTree={parseTreeNode.child} />
      </TeX>
    )
  }
  if (parseTreeNode.kind === "**") {
    return (
      <b>
        <MarkdownTree parseTree={parseTreeNode.child} />
      </b>
    )
  }
  if (parseTreeNode.kind === "*") {
    return (
      <i>
        <MarkdownTree parseTree={parseTreeNode.child} />
      </i>
    )
  }
  // TODO: Implement this function
  return <></>
}

/**
 * We first parse the markdown-like text into a parse tree. To this end, we
 * define the following types:
 */
type ParseTree = ParseTreeNode[]
type ParseTreeNode =
  | string
  | { kind: "`" | "$$" | "$" | "**" | "*"; child: ParseTree }

/**
 * The parseMarkdownText function parses markdown-like text into a parse tree.
 *
 * @param text The markdown-like text to parse
 * @returns The parse tree
 */
function parseMarkdownText(text: string): ParseTree {
  if (text === "") return []

  // const regexes = [
  //   codeRegex,
  //   squareBracketRegex,
  //   dollarRegex,
  //   squareBracketRegex,
  //   boldRegex,
  //   italicRegex,
  // ]

  let match = dollarRegex.exec(text)
  if (match) {
    const index = match.index
    const matchText = match[1]
    const matchStart = index
    const matchEnd = index + match[0].length
    const before = text.slice(0, matchStart)
    const after = text.slice(matchEnd)
    const node = {
      kind: "$",
      child: parseMarkdownText(matchText),
    } as ParseTreeNode
    return [...parseMarkdownText(before), node, ...parseMarkdownText(after)]
  }

  match = squareBracketRegex.exec(text)
  if (match) {
    const index = match.index
    const matchText = match[1]
    const matchStart = index
    const matchEnd = index + match[0].length
    const before = text.slice(0, matchStart)
    const after = text.slice(matchEnd)
    const node = {
      kind: "$$",
      child: parseMarkdownText(matchText),
    } as ParseTreeNode
    return [...parseMarkdownText(before), node, ...parseMarkdownText(after)]
  }

  match = boldRegex.exec(text)
  if (match) {
    const index = match.index
    const matchText = match[1]
    const matchStart = index
    const matchEnd = index + match[0].length
    const before = text.slice(0, matchStart)
    const after = text.slice(matchEnd)
    const node = {
      kind: "**",
      child: parseMarkdownText(matchText),
    } as ParseTreeNode
    return [...parseMarkdownText(before), node, ...parseMarkdownText(after)]
  }

  return [text]
}
