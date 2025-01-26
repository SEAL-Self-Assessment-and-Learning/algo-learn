import type { ReactElement } from "react"
import type { TableNode } from "@shared/utils/parseMarkdown"
import { Markdown } from "@/components/Markdown"

/**
 * The List of all the possible extra features for the table
 * Separate each feature with a question mark like this: "border_solid?av_middle?ah_center"
 *
 * td/tf : Transpose the table (td --> definitive, tf --> frontend decision)
 * sd/sf : Split the table in half (sd --> definitive, sf --> frontend decision)
 *
 */

// Tailwind classes used for text alignment in table cells.
const alignmentTailwind = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

/**
 * A component that returns a table
 * @param table The table to be drawn (passed as md format)
 */
export function DrawTable({ table }: { table: TableNode }): ReactElement {
  const borderStyleStatic = "border-black dark:border-white"
  const vLineStyle = `${borderStyleStatic} border-l-2`
  const hLineStyle = `${borderStyleStatic} border-b-2`
  const headerStyleStatic = `[&_th]:bg-accent [&_th]:py-2 text-white first:[&_th]:rounded-tl-md last:[&_th]:rounded-tr-sm ${hLineStyle}`
  const rowStyleStatic =
    "[&_td]:px-4 [&_td]:py-2 [&_td]:align-middle " +
    (table.content.length - (table.format.header ? 1 : 0) >= 5
      ? "[&>tr:nth-child(even)>td]:bg-muted first:[&>tr:nth-child(even)>td]:rounded-l-sm last:[&>tr:nth-child(even)>td]:rounded-r-sm"
      : "")

  const tHead: ReactElement[] = []
  if (table.format.header) {
    table.content[0].forEach((cell, i) => {
      tHead.push(
        <th key={i} className={`${table.format.vLines.includes(i) ? vLineStyle : ""}`}>
          <Markdown md={cell} />
        </th>,
      )
    })
  }

  const tBody = []
  for (let i = table.format.header ? 1 : 0; i < table.content.length; i++) {
    const tRow: ReactElement[] = []
    table.content[i].forEach((cell, col) => {
      tRow.push(
        <td
          key={col}
          className={`${alignmentTailwind[table.format.alignment[col]]} ${table.format.vLines.includes(col) ? vLineStyle : ""}`}
        >
          <Markdown md={cell} />
        </td>,
      )
    })

    tBody.push(
      <tr key={i} className={table.format.hLines.includes(i) ? hLineStyle : ""}>
        {tRow}
      </tr>,
    )
  }

  return (
    <table className="m-5 w-auto border-collapse justify-self-center">
      {table.format.header ? (
        <thead className={headerStyleStatic}>
          <tr>{tHead}</tr>
        </thead>
      ) : null}
      <tbody className={rowStyleStatic}>{tBody}</tbody>
    </table>
  )
}
