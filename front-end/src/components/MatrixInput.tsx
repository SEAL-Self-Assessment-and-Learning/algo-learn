import { ReactElement } from "react"
import { MatrixInputProps } from "@shared/utils/matrixInput.ts"
import { Markdown } from "@/components/Markdown.tsx"
import { useTheme } from "@/hooks/useTheme.ts"

/**
 * Create the parentheses for the matrix input
 * @param svgColor - either "white" or "black" depending on the user's theme
 * @param side - "l" --> left parentheses of the matrix | "r" follows
 */
function Parentheses({ svgColor, side }: { svgColor: string; side: "r" | "l" }) {
  const svgPath =
    side === "l"
      ? "M85 0 A61 101 0 0 0 85 186 L75 186 A65 101 0 0 1 75 0"
      : "M24 0 A61 101 0 0 1 24 186 L34 186 A65 101 0 0 0 34 0"
  return (
    <svg className="h-full w-[0.85em]" preserveAspectRatio="none" viewBox="3 0 106 186">
      <path d={svgPath} fill={svgColor} stroke={svgColor}></path>
    </svg>
  )
}

/**
 * Creates a component for matrix input
 * @param matrixObject
 */
export function MatrixInput({ matrixObject }: { matrixObject: string }): ReactElement {
  const parsedMatrixObject = JSON.parse(matrixObject) as MatrixInputProps
  const rows = parsedMatrixObject.rows
  const cols = parsedMatrixObject.cols

  const { theme } = useTheme()

  const svgColor = theme === "dark" ? "white" : "black"

  return (
    <>
      <div className={`flex items-center justify-center`}>
        <Markdown md={parsedMatrixObject.name} />
        <table className={"h-full"}>
          <tbody>
            <tr className={"h-1"}>
              <td className={"h-full"} rowSpan={rows + 2}>
                <Parentheses svgColor={svgColor} side={"l"} />
              </td>
              <td colSpan={cols}></td>
              <td className={"h-full"} rowSpan={rows + 2}>
                <Parentheses svgColor={svgColor} side={"r"} />
              </td>
            </tr>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: cols }).map((_, j) => (
                  <td key={j}>
                    <Markdown md={parsedMatrixObject.inputFields[`x_${i}_${j}`]} />
                  </td>
                ))}
              </tr>
            ))}
            <tr className={"h-1"}>
              <td colSpan={cols}></td>
            </tr>
          </tbody>
        </table>
        <Markdown md={parsedMatrixObject.elementOf} />
      </div>
    </>
  )
}
