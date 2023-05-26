import { Fragment, FunctionComponent } from "react"
import TeX from "./TeX"
import { Link } from "react-router-dom"
import { parseMarkdown, ParseTree, ParseTreeNode } from "../utils/markdown"
import SyntaxHighlighter from "react-syntax-highlighter"
import {
  solarizedLight,
  solarizedDark,
} from "react-syntax-highlighter/dist/esm/styles/hljs"
import { useTheme } from "../hooks/useTheme"

/**
 * Function to render a given markdown-like string as a React component
 *
 * @param props
 * @param props.md The markdown-like string to render
 * @returns The React component
 */
export const Markdown: FunctionComponent<{ md: string }> = ({ md }) => {
  return <MarkdownTree parseTree={parseMarkdown(md)} />
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
  const { theme } = useTheme()
  if (typeof parseTreeNode === "string") {
    return <>{parseTreeNode}</>
  }
  if (parseTreeNode.kind === "$$") {
    return <TeX tex={parseTreeNode.child} block />
  }
  if (parseTreeNode.kind === "$") {
    return <TeX tex={parseTreeNode.child} />
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
  if (parseTreeNode.kind === "`") {
    return <span className="font-mono">{parseTreeNode.child}</span>
  }
  if (parseTreeNode.kind === "```") {
    return (
      <div className="my-5">
        <SyntaxHighlighter
          language={parseTreeNode.language}
          style={theme === "light" ? solarizedLight : solarizedDark}
        >
          {parseTreeNode.child}
        </SyntaxHighlighter>
      </div>
    )
  }
  if (parseTreeNode.kind === "a") {
    return (
      <Link to={parseTreeNode.url}>
        <MarkdownTree parseTree={parseTreeNode.child} />
      </Link>
    )
  }
  if (parseTreeNode.kind === ">") {
    return (
      <blockquote className="my-4 border-l-4 pl-2">
        <MarkdownTree parseTree={parseTreeNode.child} />
      </blockquote>
    )
  }

  // will never be reached:
  return <></>
}
