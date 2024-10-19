import {
  numToVariableValues,
  ParserError,
  PropositionalLogicParser,
  SyntaxTreeNodeType,
  TruthTable,
} from "@shared/utils/propositionalLogic.ts"
import { InputTruthTableProps, TruthTableProps } from "@shared/utils/truthTableBlock.ts"
import { Markdown } from "@/components/Markdown.tsx"

/**
 * Creates a Truth table
 * Options:
 *  - show a function and in the header the function
 *  - show a function and in the header an alias name
 *  - show input fields and an alias name / or function in the header
 * @param truthTableObject
 * @constructor
 */
export function TruthTableComp({ truthTableObject }: { truthTableObject: string }) {
  const parsedTruthTable = JSON.parse(truthTableObject) as TruthTableProps
  const { parsedFunctions, parsedFunctionNames, variableNames, tableSize, truthTables } =
    parsePassedFunctionsToTables(parsedTruthTable)

  return (
    <div className="flex items-center justify-center">
      <div className={`my-5 rounded-md border-2 border-gray-600 p-1 dark:border-gray-300`}>
        <table className="border-collapse">
          <thead>
            <tr className="rounded-t-md border-b-2 border-gray-600 bg-goethe text-white dark:border-gray-300">
              {/* Variable names */}
              {variableNames.map((_, i) => (
                <th className={`px-3 py-2 font-black`} key={i}>
                  {variableNames[variableNames.length - i - 1]}
                </th>
              ))}

              {/* Divider with border between variable names and functions */}
              <th className="border-l border-gray-600 dark:border-gray-300"></th>
              <th className="border-r border-gray-600 dark:border-gray-300"></th>

              {/* Parsed functions */}
              {parsedFunctions.map((func, index) => (
                <th
                  className={`whitespace-nowrap px-6 py-2 font-black ${index === 0 ? "" : "border-l border-gray-600 dark:border-gray-300"}`}
                  key={index}
                >
                  <Markdown
                    md={`${parsedFunctionNames[index] === "" && func !== null ? `$ ${func.toString(true)} $` : parsedFunctionNames[index]}`}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: tableSize }).map((_, i) => (
              <tr key={i} className={`${i % 2 === 1 ? "bg-gray-300 dark:bg-gray-800" : ""}`}>
                {/* Write down the binary of i (reversed) */}
                {variableNames.map((_, j) => (
                  <td className={`py-1 text-center`} key={j}>
                    <Markdown
                      md={`$${Math.floor(i / Math.pow(2, variableNames.length - j - 1)) % 2}$`}
                    />
                  </td>
                ))}

                {/* Divider with border between variable names and functions */}
                <th className="border-l border-gray-600 dark:border-gray-300"></th>
                <th className="border-r border-gray-600 dark:border-gray-300"></th>

                {/* Write down the evaluation of each function */}
                {parsedFunctions.map((_, index) => (
                  <td
                    className={`text-center ${index === 0 ? "" : "border-l border-gray-600 dark:border-gray-300"}`}
                    key={index}
                  >
                    {createCellValue(truthTables, index, parsedTruthTable, i)}
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
 * Displays either an input field or 0/1 from a truth table
 * if truhtable[index] === null => there should be an input field
 *                                 input fields are stored in the parsedTruthTable.functions...
 * @param truthTables
 * @param index
 * @param parsedTruthTable
 * @param i
 */
function createCellValue(
  truthTables: (TruthTable | null)[],
  index: number,
  parsedTruthTable: TruthTableProps,
  i: number,
) {
  if (truthTables[index] !== null) {
    return <Markdown md={truthTables[index][i] ? "$1$" : "$0$"} />
  } else {
    if ("fields" in parsedTruthTable.functions[index]) {
      return <Markdown md={parsedTruthTable.functions[index].fields[i]} />
    }
    throw new Error("Should never be reached")
  }
}

/**
 * Gets the parsedTruthTable as TruthTableProps
 * Creates:
 *  - parsedFunctions[] (x \or y ... )
 *  - parsedFunctionNames (if the function should not be shown, instead a name like $f$)
 *  - all unique variable names
 *  - tableSize
 *  - list of the truthTables (also a inputField list may be included -> indicated by null)
 * @param parsedTruthTable
 */
function parsePassedFunctionsToTables(parsedTruthTable: TruthTableProps) {
  const parsedFunctions: (SyntaxTreeNodeType | null)[] = []
  const parsedFunctionNames: string[] = []
  for (const func of parsedTruthTable.functions) {
    if ("func" in func) {
      const parsedFunction = PropositionalLogicParser.parse(func.func)
      if (!(parsedFunction instanceof ParserError)) {
        parsedFunctions.push(parsedFunction)
        parsedFunctionNames.push(func.alternativeName || "")
      }
    } else {
      parsedFunctionNames.push(func.name)
      parsedFunctions.push(null)
    }
  }

  if (parsedFunctions.length === 0) {
    throw new Error("No valid functions found")
  }

  const variableOptionsCollection: (SyntaxTreeNodeType | InputTruthTableProps)[] = []
  for (let i = 0; i < parsedFunctions.length; i++) {
    if (parsedFunctions[i] === null) {
      variableOptionsCollection.push(parsedTruthTable.functions[i] as InputTruthTableProps)
    } else {
      variableOptionsCollection.push(parsedFunctions[i] as SyntaxTreeNodeType)
    }
  }
  const variableNames = getAllVarNames(variableOptionsCollection).sort().reverse()
  const tableSize = Math.pow(2, variableNames.length)

  const truthTables: (TruthTable | null)[] = []
  for (const func of parsedFunctions) {
    if (func === null) {
      truthTables.push(null)
    } else {
      const truthTable: TruthTable = []
      for (let i = 0; i < tableSize; i++) {
        truthTable.push(func.eval(numToVariableValues(i, variableNames)))
      }
      truthTables.push(truthTable)
    }
  }
  return { parsedFunctions, parsedFunctionNames, variableNames, tableSize, truthTables }
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
