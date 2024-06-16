import { ReactElement } from "react"
import { Markdown } from "@/components/Markdown.tsx"

/**
 * A component that returns a table
 * @param table The table to be drawn (passed as md format)
 */
export function DrawTable({
  table,
}: {
  table: { header: string[]; content: string[][]; alignment: string[]; extraFeature: string }
}): ReactElement {
  const parsedHeader = table.header
  const parsedContent = table.content
  const parsedAlignment = table.alignment
  const extraFeature = table.extraFeature

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
          <td key={`cell-${i}-${j}`} className={`border p-2 text-${parsedAlignment[j]}`}>
            <Markdown md={md} />
          </td>
        ))}
      </tr>,
    )
  }
  const tableReturnValue = (
    <table>
      <thead>{tableHeader}</thead>
      <tbody>{tableContent}</tbody>
    </table>
  )
  if (extraFeature.startsWith("div_")) {
    return <div className={extraFeature.split("_")[1]}>{tableReturnValue}</div>
  } else {
    return tableReturnValue
  }
}
