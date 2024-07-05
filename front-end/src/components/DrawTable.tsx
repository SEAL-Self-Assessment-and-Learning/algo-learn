import { ReactElement, useEffect, useRef } from "react"
import { Markdown } from "@/components/Markdown"

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

  // this effect is used to add the copy event to the table
  // it prevents copying the value with the default \t and instead with space
  const tableRef = useRef<HTMLDivElement>(null) // Specify the type of element the ref will hold
  useEffect(() => {
    const tableElement = tableRef.current
    if (!tableElement) return // Check if tableEl is not null

    const handleCopy = (event: ClipboardEvent) => {
      event.preventDefault()
      const selection = document.getSelection()
      if (!selection) return

      const selectedText = selection.toString().replace(/\t/g, " ")
      event.clipboardData!.setData("text/plain", selectedText)
    }

    // Type assertion to ensure tableEl is treated as an HTMLElement
    tableElement.addEventListener("copy", handleCopy)
    return () => {
      tableElement.removeEventListener("copy", handleCopy)
    }
  }, [])

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
    <div ref={tableRef}>
      <table>
        <thead>{tableHeader}</thead>
        <tbody>{tableContent}</tbody>
      </table>
    </div>
  )
  if (extraFeature.startsWith("div_")) {
    return <div className={extraFeature.split("_")[1]}>{tableReturnValue}</div>
  } else {
    return tableReturnValue
  }
}
