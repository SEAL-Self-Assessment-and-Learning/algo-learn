import { ReactElement } from "react"
import { parseTable } from "@shared/utils/parseMarkdown.ts"
import { Markdown } from "@/components/Markdown.tsx"

/**
 * A component that returns a table
 * @param table The table to be drawn (passed as md format)
 */
export function DrawTable({ table }: { table: string }): ReactElement {
  const parsedDataTable = parseTable(table)
  const parsedHeader = parsedDataTable.header
  const parsedContent = parsedDataTable.content
  const parsedAlginment = parsedDataTable.alignment

  // create the value for the header
  const tableHeader = []

  tableHeader.push(
    <tr key={`row-0`}>
      {parsedHeader.map((md, j) => (
        <th key={`cell-${0}-${j}`} className={"border p-2"}>
          <Markdown md={md} />
        </th>
      ))}
    </tr>,
  )

  const tableContent = []
  for (let i = 0; i < parsedContent.length; i++) {
    tableContent.push(
      <tr key={`row-${i}`}>
        {parsedContent[i].map((md, j) => (
          <td key={`cell-${i}-${j}`} className={`border p-2 text-${parsedAlginment[j]}`}>
            <Markdown md={md} />
          </td>
        ))}
      </tr>,
    )
  }

  return (
    <>
      <table>
        <thead>{tableHeader}</thead>
        <tbody>{tableContent}</tbody>
      </table>
    </>
  )
}
