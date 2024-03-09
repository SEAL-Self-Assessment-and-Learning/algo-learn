import { ReactElement } from "react" // , useEffect, useRef
import { useTheme } from "@/hooks/useTheme.ts"

/**
 * A component that returns an SVG element representing a graph.
 * @param width - The width of the svg.
 */
export function DrawTable({ table }: { table: string }): ReactElement {
  const parsedDataTable = parseTable(table)
  const parsedHeader = parsedDataTable.header
  const parsedContent = parsedDataTable.content

  // Define border color based on the theme
  const { theme } = useTheme()
  const borderColor = theme === "dark" ? "white" : "black"

  const cellStyle = {
    border: `1px solid ${borderColor}`,
    padding: "8px",
    // Add any other styles you want for the cells here
  }

  // create the value for the header
  const tableHeader = []
  for (let i = 0; i < parsedHeader.length; i++) {
    tableHeader.push(
      <tr>
        {parsedHeader[i].map((x) => (
          // eslint-disable-next-line react/jsx-key
          <th style={cellStyle}>{x}</th>
        ))}
      </tr>,
    )
  }

  const tableContent = []
  for (let i = 0; i < parsedContent.length; i++) {
    tableContent.push(
      <tr>
        {parsedContent[i].map((x) => (
          // eslint-disable-next-line react/jsx-key
          <td style={cellStyle}>{x}</td>
        ))}
      </tr>,
    )
  }

  return (
    <table>
      <thead>{tableHeader.map((x) => x)}</thead>
      <tbody>{tableContent.map((x) => x)}</tbody>
    </table>
  )
}

function parseTable(table: string) {
  const rows = table.split("\n")
  const header: string[][] = []
  const content: string[][] = []
  let matchedHeader: boolean = false

  for (let i = 0; i < rows.length; i++) {
    // check if the row is like |-|-|-| or |--|--|--|
    const contentSplit = rows[i].split("|").filter((x) => x !== "")
    if (contentSplit.length === 0) {
      continue
    }
    // check if content only consists of "-"
    const isHeader = contentSplit.every((x) => x === "-")
    if (isHeader) {
      if (matchedHeader) {
        throw new Error("Table header can only be defined once")
      }
      matchedHeader = true
    } else {
      if (matchedHeader) {
        content.push(contentSplit)
      } else {
        header.push(contentSplit)
      }
    }
  }

  return {
    header: header,
    content: content,
  }
}
