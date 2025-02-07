import type { ReactNode } from "react"
import { UAParser } from "ua-parser-js"
import type { TableNode } from "@shared/utils/parseMarkdown"
import { MarkdownTree } from "@/components/Markdown"
import { cn } from "@/lib/utils"

/**
 * The List of all the possible extra features for the table
 * Separate each feature with a question mark like this: "border_solid?av_middle?ah_center"
 *
 * td/tf : Transpose the table (td --> definitive, tf --> frontend decision)
 * sd/sf : Split the table in half (sd --> definitive, sf --> frontend decision)
 *
 */

/**
 * A component that returns a table
 * @param table The table to be drawn (passed as md format)
 */
export function DrawTable({ table }: { table: TableNode }) {
  const { header, vLines, hLines, alignment } = table.format
  const headerRow = header ? table.content[0] : undefined
  const bodyRows = header ? table.content.slice(1) : table.content
  const hasZebra = bodyRows.length >= 5
  const { device } = UAParser(window.navigator.userAgent)

  return (
    <div
      className={`w-full ${device.is("mobile") || device.is("tablet") ? "overflow-scroll" : "overflow-visible"}`}
    >
      <table className="m-5 w-auto border-collapse justify-self-center">
        {headerRow && (
          <thead className="first:[&_th]:rounded-tl-md last:[&_th]:rounded-tr-sm">
            <tr>
              {headerRow.map((cell, j) => (
                <TableCell
                  key={j}
                  leftBorder={vLines.includes(j)}
                  alignment={alignment[j]}
                  bottomBorder={true}
                  header={true}
                >
                  <MarkdownTree parseTree={cell} />
                </TableCell>
              ))}
            </tr>
          </thead>
        )}
        <tbody
          className={cn(
            hasZebra &&
              "[&>tr:nth-child(even)>td]:bg-muted first:[&>tr:nth-child(even)>td]:rounded-l-sm last:[&>tr:nth-child(even)>td]:rounded-r-sm",
          )}
        >
          {bodyRows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <TableCell
                  key={j}
                  leftBorder={vLines.includes(j)}
                  bottomBorder={hLines.includes(i + (headerRow ? 1 : 0))}
                  alignment={alignment[j]}
                >
                  <MarkdownTree parseTree={cell} />
                </TableCell>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * A component that returns a table cell
 * @param props
 * @param props.header Whether the cell is a header cell
 * @param props.leftBorder Whether the cell has a left border
 * @param props.bottomBorder Whether the cell has a bottom border
 * @param props.alignment The horizontal alignment within the cell
 * @param props.children The children of the cell
 */
function TableCell({
  header = false,
  leftBorder = false,
  bottomBorder = false,
  alignment = "center",
  children,
}: {
  header?: boolean
  leftBorder?: boolean
  bottomBorder?: boolean
  alignment?: "left" | "center" | "right"
  children: ReactNode
}) {
  const Tag = header ? "th" : "td"
  return (
    <Tag
      className={cn(
        "border-black px-4 py-2 align-middle dark:border-white",
        header && "bg-accent text-white",
        leftBorder && "border-l-2",
        bottomBorder && "border-b-2",
        alignment == "left" ? "text-left" : alignment == "center" ? "text-center" : "text-right",
      )}
    >
      {children}
    </Tag>
  )
}
