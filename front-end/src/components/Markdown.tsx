import { Fragment, type FunctionComponent, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { parseMarkdown, type ParseTree, type ParseTreeNode } from "@shared/utils/parseMarkdown.ts"
import { Graph } from "@shared/utils/graph.ts"
import { parseMarkdown, ParseTree, ParseTreeNode } from "@shared/utils/parseMarkdown.ts"
import { ArrayDisplay } from "@/components/ArrayDisplay.tsx"
import { DrawList } from "@/components/DrawList.tsx"
import { DrawPseudoCode } from "@/components/DrawPseudoCode.tsx"
import { DrawTable } from "@/components/DrawTable.tsx"
import { MatrixInput } from "@/components/MatrixInput.tsx"
import { FormInputField } from "@/components/ui/FormInputField.tsx"
import { DrawGraph } from "./DrawGraph"
import { Format } from "./Format"
import TeX from "./TeX"

/**
 * Function to render a given markdown-like string as a React component
 *
 * @param props
 * @param props.md The markdown-like string to render
 * @param props.children The parameters to replace the mustache-style placeholders in the string
 * @returns The React component
 */
export const Markdown: FunctionComponent<{
  md?: string
  children?: ReactNode | ReactNode[]
}> = ({ md, children }) => {
  if (!md) {
    return <></>
  }
  const childrenArray =
    children !== undefined ? (Array.isArray(children) ? children : [children]) : undefined
  return <MarkdownTree parseTree={parseMarkdown(md)} parameters={childrenArray} />
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
  parameters?: ReactNode[]
}> = ({ parseTree, parameters }) => {
  // TODO: Implement this function
  return (
    <>
      {parseTree.map((node, index) => (
        <Fragment key={index}>
          <MarkdownTreeNode parseTreeNode={node} parameters={parameters} />
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
  parameters?: ReactNode[]
}> = ({ parseTreeNode, parameters }) => {
  if (typeof parseTreeNode === "string") {
    return <Format template={parseTreeNode} parameters={parameters} />
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
    return (
      <span className="rounded-sm bg-gray-200 px-2 py-1 font-mono dark:bg-gray-700">
        {format(parseTreeNode.child, parameters)}
      </span>
    )
  }
  if (parseTreeNode.kind === "```") {
    if (parseTreeNode.language === "array") {
      return <ArrayDisplay arrayObject={parseTreeNode.child} />
    }
    if (parseTreeNode.language === "pseudoCode") {
      return <DrawPseudoCode displayCode={parseTreeNode.child} />
    }
    if (parseTreeNode.language === "graph") {
      return (
        <div className="my-5">
          <DrawGraph maxWidth={500} maxHeight={300} graph={Graph.parse(parseTreeNode.child)} />
        </div>
      )
    }
    if (parseTreeNode.language === "matrixInput") {
      return <MatrixInput matrixObject={parseTreeNode.child} />
    }
    throw new Error("Unknown language")
  }
  if (parseTreeNode.kind === "table") {
    return <DrawTable table={parseTreeNode.child} />
  }
  if (parseTreeNode.kind === "list") {
    return <DrawList list={parseTreeNode.child} />
  }
  if (parseTreeNode.kind === "a") {
    return (
      <Link to={format(parseTreeNode.url, parameters)}>
        <MarkdownTree parseTree={parseTreeNode.child} parameters={parameters} />
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
  if (parseTreeNode.kind === "input") {
    // only provide the id of the input field
    const inputSplit = parseTreeNode.child.split("#")
    const id = inputSplit[0]

    return <FormInputField id={id} />
  }

  // will never be reached:
  return <></>
}

function format(text: string, parameters?: ReactNode[]): string {
  if (parameters) {
    parameters.forEach((p, index) => {
      if (typeof p === "string") {
        text = text.replace(`{{${index}}}`, p)
      }
    })
  }
  return text
}
