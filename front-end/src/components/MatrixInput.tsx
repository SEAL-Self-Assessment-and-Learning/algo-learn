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
    <div className="h-full w-[0.85em]">
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="3 0 106 186">
        <path d={svgPath} fill={svgColor} stroke={svgColor}></path>
      </svg>
    </div>
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

  const divHeight = 80 + (rows - 2) * 45
  const svgColor = theme === "dark" ? "white" : "black"

  return (
    <>
      <div className={`flex items-center justify-center`} style={{ height: `${divHeight}px` }}>
        <Markdown md={parsedMatrixObject.name} />
        <Parentheses svgColor={svgColor} side={"l"} />
        <table>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: cols }).map((_, j) => (
                  <td key={j}>
                    <Markdown md={parsedMatrixObject.inputFields[`x_${i}_${j}`]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <Parentheses svgColor={svgColor} side={"r"} />
        <Markdown md={parsedMatrixObject.elementOf} />
      </div>
    </>
  )
}
