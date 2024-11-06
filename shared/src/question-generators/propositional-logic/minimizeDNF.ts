import { Literal, Operator, SyntaxTreeNodeType, TruthTable } from "@shared/utils/propositionalLogic.ts"

/**
 * During the algorithm, the datatype for a truthTable can be a BinaryMix
 * 0 --> false; 1 --> true; x --> true/false
 */
type BinaryMix = 0 | 1 | "x"

/**
 * Based on a given expression (truthTable), calculates a minimal DNF
 *
 * Using **Quine–McCluskey** algorithm
 *
 * @param expr
 */
export function minimizeExpressionDNF(expr: SyntaxTreeNodeType): SyntaxTreeNodeType {
  const { truthTable: tTable, variableNames: varNames } = expr.getTruthTable()

  const trueRows = getIndexOfTrueRows(tTable)
  const { finalImplicants } = getPrimeImplicants(trueRows, varNames.length)
  const { implicantRows } = getImplicantRows(finalImplicants)
  const minRows = minimumCover(implicantRows, trueRows)

  return buildMinDNFExpression(minRows, finalImplicants, varNames)
}

/**
 * Creates the SyntaxTreeNode for the minimized dnf
 * - each row in minRows is one clause
 * - finalImplicants[row] -> [x0, x1, ..., xn] xi in {0, 1, x} says how to create each literal
 *  - if 0: negated variable
 *  - if 1: normal variable
 *  - if x: don't add (this clause does not rely on the variable)
 * @param minRows
 * @param finalImplicants
 * @param varNames
 */
function buildMinDNFExpression(minRows: any[], finalImplicants: BinaryMix[][], varNames: string[]) {
  const clauses: SyntaxTreeNodeType[] = []
  for (const row of minRows) {
    const literals: Literal[] = []
    for (let i = 0; i < finalImplicants[row].length; i++) {
      if (finalImplicants[row][i] === "x") {
        continue
      }
      const negated = !finalImplicants[row][i]
      literals.push(new Literal(varNames[varNames.length - i - 1], negated))
    }
    // combine literals with and
    clauses.push(combineLiteralsWithAnd(literals))
  }
  // combine clauses with or
  return combineClausesWithOr(clauses)
}

/**
 * Combines clauses with \\or
 * @param clauses
 */
function combineClausesWithOr(clauses: SyntaxTreeNodeType[]) {
  let newExpr: SyntaxTreeNodeType = clauses[0]
  for (let i = 1; i < clauses.length; i++) {
    newExpr = new Operator("\\or", newExpr, clauses[i])
  }
  return newExpr
}

/**
 * Creates one clause (combines the literals with \\and)
 * @param literals
 */
function combineLiteralsWithAnd(literals: Literal[]) {
  let newExpr: SyntaxTreeNodeType = literals[0]
  for (let i = 1; i < literals.length; i++) {
    newExpr = new Operator("\\and", newExpr, literals[i])
  }
  return newExpr
}

/**
 * This function returns the rows of each implicant in binary form as **2D** array
 * @param implicants - the implicants to get the rows for
 */
function getImplicantRows(implicants: BinaryMix[][]) {
  const implicantRows: number[][] = []
  for (const implicant of implicants) {
    const binaryValues = generateBinaryValues(implicant)
    implicantRows.push(binaryValues)
  }
  return { implicantRows }
}

/**
 * This function returns all possible combinations of implicants
 * @param length - the number of implicants - will be [1, 2, ..., length]
 */
function allImplCombination(length: number) {
  // create all possible sets of implicant rows
  const getAllSubsets = (arr: number[]): number[][] =>
    arr.reduce<number[][]>(
      (subsets, value) => subsets.concat(subsets.map((set) => [value, ...set])),
      [[]],
    )
  const allPossibleSets = getAllSubsets(Array.from({ length }, (_, i) => i))
  allPossibleSets.sort((a, b) => a.length - b.length)
  return allPossibleSets
}

/**
 * This function checks if the given rows cover all the true rows
 * @param rows
 * @param trueRows
 */
function isCover(rows: number[], trueRows: number[]) {
  return trueRows.every((row) => rows.includes(row))
}

/**
 * This function returns the minimum cover of the given implicant rows,
 * such that all true rows are covered by the minimum number of implicants
 * (Set Cover Problem)
 * @param implicantRows - the rows of each implicant (2D array => [[1, 2], [1, 3, 4], ...])
 * @param trueRows - the rows that are true in the truth table and need to be covered
 */
function minimumCover(implicantRows: number[][], trueRows: number[]) {
  // order increasing by length of the elements
  const allPossibleSets: number[][] = allImplCombination(implicantRows.length).filter(
    (x) => x.length !== 0,
  )
  // find the smallest set that covers all true rows
  for (const set of allPossibleSets) {
    const rows = set.flatMap((i) => implicantRows[i]).sort()
    if (isCover(rows, trueRows)) {
      return set
    }
  }
  // should never reach here
  throw new Error("No cover found")
}

/**
 * This function generates all possible binary values from a given implicant
 * @param implicant - the implicant to generate binary values for
 *
 * Example:
 * generateBinaryValues([0, 1, "x"]) => Returns: [2, 3] (binary values of 010 and 011)
 * generateBinaryValues(["x", "x", 1]) => Returns: [1, 3, 5, 7] (binary values of 001, 011, 101, 111)
 */
function generateBinaryValues(implicant: BinaryMix[]): number[] {
  const results: number[] = []

  function helper(index: number, current: BinaryMix[]) {
    // Base case: if we've processed the entire implicant
    if (index === implicant.length) {
      // Convert the binary array to a number and add it to the results
      const binaryValue = parseInt(current.join(""), 2)
      results.push(binaryValue)
      return
    }

    if (implicant[index] === "x") {
      // Replace 'x' with 0 and 1
      current.push(0)
      helper(index + 1, current)
      current.pop()
      current.push(1)
      helper(index + 1, current)
      current.pop()
    } else {
      // Add the current value (0 or 1) directly
      current.push(implicant[index])
      helper(index + 1, current)
      current.pop()
    }
  }

  helper(0, [])
  return results
}

/**
 * This function gets the binary representation for each row number
 * pads it with 0's and returns the binary representations
 * @param rows - the row numbers
 * @param numVars - the number of variables (to pad the binary representation)
 */
function getBinaryRepresentations(rows: number[], numVars: number) {
  const rowBinary: BinaryMix[][] = []
  for (const row of rows) {
    // get binary representation of row and pad with 0's
    const binary = row.toString(2).padStart(numVars, "0")
    rowBinary.push(binary.split("").map((val) => (val === "0" ? 0 : 1)))
  }
  return { rowBinary }
}

/**
 * This function returns the prime implicants of the given rows
 * @param rows - the row numbers (true rows)
 * @param numVars - the number of variables (to pad the binary representation)
 */
function getPrimeImplicants(rows: number[], numVars: number) {
  let { rowBinary: currentImplicants } = getBinaryRepresentations(rows, numVars)

  let nextImplicants: BinaryMix[][] = []
  const finalImplicants: BinaryMix[][] = []

  while (currentImplicants.length > 0) {
    for (let i = 0; i < currentImplicants.length; i++) {
      for (let j = 0; j < currentImplicants.length; j++) {
        // check if the difference between the two implicants is 1
        if (getDiffBinary(currentImplicants[i], currentImplicants[j]) === 1) {
          const copyImplicant = [...currentImplicants[i]]
          // only one possible difference, implies the index is unique
          const diffIndex = currentImplicants[i].findIndex(
            (val, index) => val !== currentImplicants[j][index],
          )
          copyImplicant[diffIndex] = "x"
          nextImplicants.push(copyImplicant)
        }
      }
    }

    // which currentImplicants are not inside the nextImplicants?
    const { diffImplicants } = getDiffImplicantsLists(currentImplicants, nextImplicants)
    finalImplicants.push(...diffImplicants)

    currentImplicants = removeDuplicates(nextImplicants)
    nextImplicants = []
  }

  return { finalImplicants }
}

/**
 * This function removes duplicates from a 2D array of binary arrays
 * @param arr - the 2D array of binary arrays
 */
function removeDuplicates(arr: BinaryMix[][]) {
  const seen: string[] = []
  return arr.filter((val) => !seen.includes(val.join("")) && seen.push(val.join("")))
}

/**
 * This function returns the implicants that are not in the second list
 * @param implicants1 - first list of implicants
 * @param implicants2 - second list of implicants
 * @param diff - the number of different elements between the two implicant lists
 */
function getDiffImplicantsLists(
  implicants1: BinaryMix[][],
  implicants2: BinaryMix[][],
  diff: number = 1,
) {
  const diffImplicants: BinaryMix[][] = []
  for (const implicant1 of implicants1) {
    let found = false
    for (const implicant2 of implicants2) {
      if (getDiffBinary(implicant1, implicant2) === diff) {
        found = true
        break
      }
    }
    if (!found) {
      diffImplicants.push(implicant1)
    }
  }
  return { diffImplicants }
}

/**
 * This function returns the number of differences between two binary arrays of the **same length**
 * @param binary1 - first binary array
 * @param binary2 - second binary array
 */
function getDiffBinary(binary1: BinaryMix[], binary2: BinaryMix[]) {
  if (binary1.length !== binary2.length) {
    throw new Error("Binary arrays must be of the same length")
  }
  let num = 0
  for (let i = 0; i < binary1.length; i++) {
    if (binary1[i] !== binary2[i]) num++
  }
  return num
}

/**
 * This function returns the indices of the rows in the truth table that are true
 * @param tTable - truth table of an expression
 */
function getIndexOfTrueRows(tTable: TruthTable): number[] {
  return tTable.map((val, i) => (val ? i : -1)).filter((i) => i !== -1)
}
