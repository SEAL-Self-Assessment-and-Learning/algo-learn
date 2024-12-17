import { ReactElement } from "react"
import { Markdown } from "@/components/Markdown"

/**
 * The List of all the possible extra features for the table
 * Separate each feature with a question mark like this: "border_solid?av_middle?ah_center"
 *
 * div_ : The class for the div that contains the table
 * table_ : The class for the table
 * border_ : The border style of the table
 * av_ : The vertical alignment of the cells
 * ah_ : The horizontal alignment of the cells
 * td/tf : Transpose the table (td --> definitive, tf --> frontend decision)
 * sd/sf : Split the table in half (sd --> definitive, sf --> frontend decision)
 *
 */

/**
 * A component that returns a table
 * @param table The table to be drawn (passed as md format)
 */
export function DrawTable({
  table,
}: {
  table: {
    content: string[][]
    format: { header: boolean; vLines: number[]; hLines: number[]; alignment: string[] }
  }
}): ReactElement {
  const borderStyleStatic = "border-black dark:border-white"
  const vLineStyle = `${borderStyleStatic} border-l-2`
  const hLineStyle = `${borderStyleStatic} border-b-2`
  const rowStyleStatic =
    table.content.length - (table.format.header ? 1 : 0) >= 5
      ? "even:bg-gray-100 dark:even:bg-gray-700"
      : ""

  const tHead: ReactElement[] = []
  if (table.format.header) {
    table.content[0].forEach((cell, i) => {
      tHead.push(
        <th className={table.format.vLines.includes(i) ? vLineStyle : ""}>
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
          className={`px-4 py-2 align-middle text-${table.format.alignment[col]} ${table.format.vLines.includes(col) ? vLineStyle : ""}`}
        >
          <Markdown md={cell} />
        </td>,
      )
    })

    tBody.push(
      <tr className={`${rowStyleStatic} ${table.format.hLines.includes(i) ? hLineStyle : ""}`}>
        {tRow}
      </tr>,
    )
  }

  return (
    <table className="m-5 w-auto border-collapse justify-self-center">
      {table.format.header ? (
        <thead>
          <tr>{tHead}</tr>
        </thead>
      ) : null}
      <tbody>{tBody}</tbody>
    </table>
  )
}
//
// function transposeTable(parsedHeader: string[], parsedContent: string[][]) {
//   const newContent: string[][] = []
//   // the header needs to be on the left too,
//   // so we add the header (if exists) to the first column of the content
//   // and surround each string with **
//   if (parsedHeader.length > 0) {
//     for (let i = 0; i < parsedHeader.length; i++) {
//       if (i >= newContent.length) {
//         newContent.push([`**${parsedHeader[i]}**`])
//       } else {
//         newContent[i].push(`**${parsedHeader[i]}**`)
//       }
//     }
//   }
//   // then we add the content to the newContent
//   for (let i = 0; i < parsedContent.length; i++) {
//     for (let j = 0; j < parsedContent[i].length; j++) {
//       if (j + 1 > newContent.length) {
//         newContent.push([])
//       }
//       newContent[j].push(parsedContent[i][j])
//     }
//   }
//   return { newContent }
// }
