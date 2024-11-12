import {
  numToVariableValues,
  ParserError,
  PropositionalLogicParser,
  SyntaxTreeNodeType,
} from "@shared/utils/propositionalLogic.ts"
import { InputTruthTableProps, TruthTableProps } from "@shared/utils/truthTableBlock.ts"
import { Markdown } from "@/components/Markdown.tsx"

/**
 * Creates a Truth table
 * Options:
 *  - show a functions truth table and in the header the function
 *  - show a functions truth table and in the header an alias name
 *  - show input fields and an alias name / or function in the header
 * @param truthTableObject
 * @constructor
 */
export function TruthTableComp({ truthTableObject }: { truthTableObject: string }) {
  const parsedTruthTable = JSON.parse(truthTableObject) as TruthTableProps
  const { parsedObjects, parsedFunctionNames, variableNames } =
    parsePassedFunctionsToTables(parsedTruthTable)

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
              {variableNames.map((_, i) => (
                <th className={`px-3 py-2 font-black`} key={i}>
                  <Markdown md={`$${variableNames[variableNames.length - i - 1]}$`} />
                </th>
              ))}

              {/* Divider - border between variable names and functions */}
              <th className={`border-l ${borderColor}`}></th>
              <th className={`border-r ${borderColor}`}></th>

              {/* Parsed functions */}
              {parsedObjects.map((func, index) => (
                <th
                  className={`whitespace-nowrap px-6 py-2 font-black ${index === 0 ? "" : `border-l ${borderColor}`}`}
                  key={index}
                >
                  <GetFunctionHeader
                    parsedFunctionNames={parsedFunctionNames}
                    index={index}
                    func={func}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.pow(2, variableNames.length) }).map((_, i) => (
              <tr key={i} className={`${i % 2 === 1 ? cellBgColor : ""}`}>
                {/* Write down the binary of i (reversed) */}
                {variableNames.map((_, j) => (
                  <td className={`py-1 text-center`} key={j}>
                    <Markdown
                      md={`$${Math.floor(i / Math.pow(2, variableNames.length - j - 1)) % 2}$`}
                    />
                  </td>
                ))}

                {/* Divider - border between variable names and functions */}
                <th className={`border-l ${borderColor}`}></th>
                <th className={`border-r ${borderColor}`}></th>

                {/* Write down the evaluation of each function */}
                {parsedObjects.map((_, j) => (
                  <td className={`text-center ${j === 0 ? "" : `border-l ${borderColor}`}`} key={j}>
                    {createCellValue(parsedObjects, variableNames, j, i)}
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

/**
 * The header of each function in the truth table
 * @param parsedFunctionNames - the names of the functions (if provided)
 * @param index - the index of the current function
 * @param func - the function
 * @constructor
 */
function GetFunctionHeader({
  parsedFunctionNames,
  index,
  func,
}: {
  parsedFunctionNames: string[]
  index: number
  func: SyntaxTreeNodeType | InputTruthTableProps
}) {
  if (parsedFunctionNames[index]) {
    return <Markdown md={parsedFunctionNames[index]} />
  }
  if (!("fields" in func)) {
    return <Markdown md={`$ ${func.toString(true)} $`} />
  }
  throw new Error("Invalid function format")
}

/**
 * j indicates the first index in the parsedObject and i is the current index
 * count from 0 to tablesize - 1
 * - if fields in parsedObjects[j] its a input field, display with md comp
 * - otherwise evaluate the expression with index i
 * @param parsedObjects
 * @param variableNames
 * @param j
 * @param i
 */
function createCellValue(
  parsedObjects: (SyntaxTreeNodeType | InputTruthTableProps)[],
  variableNames: string[],
  j: number,
  i: number,
) {
  if ("fields" in parsedObjects[j]) {
    return <Markdown md={parsedObjects[j].fields[i]} />
  } else {
    return <Markdown md={parsedObjects[j].eval(numToVariableValues(i, variableNames)) ? "$1$" : "$0$"} />
  }
}

/**
 * Gets the parsedTruthTable as TruthTableProps
 * Creates:
 *  - parsedObjects[] (x \or y ... ) or ({fields: string[], name: string})
 *  - parsedFunctionNames (if the function should not be shown, instead a name like $f$)
 *  - all unique variable names
 * @param parsedTruthTable
 */
function parsePassedFunctionsToTables(parsedTruthTable: TruthTableProps) {
  const parsedFunctionNames: string[] = []
  const parsedObjects: (SyntaxTreeNodeType | InputTruthTableProps)[] = []
  for (const func of parsedTruthTable.functions) {
    if ("func" in func) {
      const parsedFunction = PropositionalLogicParser.parse(func.func)
      if (!(parsedFunction instanceof ParserError)) {
        parsedFunctionNames.push(func.alternativeName || "")
        parsedObjects.push(parsedFunction)
      }
    } else {
      parsedFunctionNames.push(func.name)
      parsedObjects.push(func)
    }
  }
  if (parsedObjects.length === 0) {
    throw new Error("No valid functions found")
  }

  const variableNames = getAllVarNames(parsedObjects).sort().reverse()
  return { parsedObjects, parsedFunctionNames, variableNames }
}

/**
 * Collects all unique variable names from the SyntaxTreeNodes
 * @param parsedFunctions
 */
function getAllVarNames(parsedFunctions: (SyntaxTreeNodeType | InputTruthTableProps)[]): string[] {
  const varNames = new Set<string>()
  for (const func of parsedFunctions) {
    if ("vars" in func) {
      func.vars.map((x) => {
        varNames.add(x)
      })
    } else {
      const funcVarNames = func.getProperties().variables
      for (const varName of funcVarNames) {
        varNames.add(varName)
      }
    }
  }
  return Array.from(varNames)
}
