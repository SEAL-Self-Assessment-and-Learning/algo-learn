import { TruthTableProps } from "@shared/utils/truthTableBlock.ts"
import { Markdown } from "@/components/Markdown.tsx"

/**
 * Todo: add documentation
 */
export function TruthTableComp({ truthTableObject }: { readonly truthTableObject: string }) {
  const parsedTruthTable = JSON.parse(truthTableObject) as TruthTableProps

  const inFeedbackPart = parsedTruthTable.inFeedbackPart
  const borderColor = inFeedbackPart ? "border-red-900" : "border-gray-600 dark:border-gray-300"
  const cellBgColor = inFeedbackPart ? "bg-red-300" : "bg-gray-300 dark:bg-gray-800"
  const headerColor = inFeedbackPart ? "" : "bg-goethe text-white"

  return (
    <div className="flex items-center justify-center">
      <div className={`my-5 rounded-md border-2 p-1 ${borderColor}`}>
        <table className="border-collapse">
          <thead>
            <tr className={`rounded-t-md border-b-2 ${headerColor} ${borderColor}`}>
              {/* Variable names */}
              {parsedTruthTable.variables.map((x, i) => (
                <th className={`px-3 py-2 font-black`} key={i}>
                  <Markdown md={`$${x}$`} />
                </th>
              ))}

              {/* Divider - border between variable names and functions */}
              <th className={`border-l ${borderColor}`}></th>
              <th className={`border-r ${borderColor}`}></th>

              {/* Parsed functions */}
              {parsedTruthTable.valuesHeader.map((func, index) => (
                <th
                  className={`whitespace-nowrap px-6 py-2 font-black ${index === 0 ? "" : `border-l ${borderColor}`}`}
                  key={index}
                >
                  <Markdown md={func} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parsedTruthTable.values.map((row, i) => (
              <tr key={i} className={i % 2 === 1 ? cellBgColor : ""}>
                {parsedTruthTable.variables.map((_, j) => (
                  <td className={`py-1 text-center`} key={j}>
                    <Markdown
                      md={`$${Math.floor(i / Math.pow(2, parsedTruthTable.variables.length - j - 1)) % 2}$`}
                    />
                  </td>
                ))}

                {/* Divider - border between variable names and functions */}
                <th className={`border-l ${borderColor}`}></th>
                <th className={`border-r ${borderColor}`}></th>

                {row.map((cellValue, j) => (
                  <td key={j}>
                    <Markdown md={cellValue} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
