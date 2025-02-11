import {
  Literal,
  Operator,
  type BinaryOperatorType,
  type NormalForm,
  type SyntaxTreeNodeType,
  type TruthTable,
} from "@shared/utils/propositionalLogic.ts"

/**
 * During the Quine–McCluskey algorithm, the datatype for a truthTable can be a BinaryMix
 * 0 --> false; 1 --> true; x --> true/false
 */
type BinaryMix = 0 | 1 | "x"

/**
 * This class gets the minimal normal form of a given expression.
 * - DNF (Disjunctive Normal Form)
 * - CNF (Conjunctive Normal
 * - The minimal normal form is the minimal number of literals needed
 */
export class MinimalNormalForm {
  private readonly expr: SyntaxTreeNodeType
  private readonly minExpr: SyntaxTreeNodeType
  private readonly form: NormalForm

  constructor(expr: SyntaxTreeNodeType, form: NormalForm) {
    this.expr = expr
    this.form = form
    this.minExpr = this.computeMinimalForm()
  }

  /**
   * Returns the expression
   * @param base - if the base instead the minExpr should be returned
   */
  get(base: boolean = false): SyntaxTreeNodeType {
    if (base) return this.expr
    return this.minExpr
  }

  /**
   * Returns the type of normal form
   */
  getForm(): NormalForm {
    return this.form
  }

  /**
   * Computes the minimal normal form (either CNF or DNF) for the given logical expression.
   *
   * @private
   * @using Quine–McCluskey algorithm
   */
  private computeMinimalForm(): SyntaxTreeNodeType {
    const { truthTable: tTable, variableNames: varNames } = this.expr.getTruthTable()

    const calcRows = this.getIndicesOfRows(tTable, this.form === "DNF")
    const { implicants } = this.getPrimeImplicants(calcRows, varNames.length)
    const { implicantRows } = this.allImplicantRows(implicants)
    const minRows = this.minimumCover(implicantRows, calcRows)
    // get those implicants that are in the minimum cover
    const minImplicants = minRows.map((i) => implicants[i])

    return this.buildNormalFormTree(minImplicants, varNames, this.form)
  }

  /**
   * Combines SyntaxTree with specified operator
   * @param trees - the trees to combine
   * @param operator - the operator to combine the trees with
   */
  private combineTrees(trees: SyntaxTreeNodeType[], operator: BinaryOperatorType): SyntaxTreeNodeType {
    let newExpr: SyntaxTreeNodeType = trees[0]
    for (let i = 1; i < trees.length; i++) {
      newExpr = new Operator(operator, newExpr, trees[i])
    }
    return newExpr
  }

  /**
   * Builds the SyntaxTreeNode for the minimized normal form.
   * - finalImplicants[i] -> [x0, x1, ..., xn] xi in {0, 1, x} says how to create each literal
   *  - 0: negated
   *  - 1: normal
   *  - x: don't add
   * @param finalImplicants
   * @param varNames
   * @param form
   */
  private buildNormalFormTree(finalImplicants: BinaryMix[][], varNames: string[], form: NormalForm) {
    const clauses: SyntaxTreeNodeType[] = []
    for (const implicant of finalImplicants) {
      const literals: Literal[] = []
      for (let i = 0; i < implicant.length; i++) {
        if (implicant[i] === "x") {
          continue
        }
        const negated = form === "DNF" ? !implicant[i] : implicant[i] === 1
        literals.push(new Literal(varNames[varNames.length - i - 1], negated))
      }
      clauses.push(this.combineTrees(literals, form === "DNF" ? "\\and" : "\\or"))
    }
    return this.combineTrees(clauses, form === "DNF" ? "\\or" : "\\and")
  }

  /**
   * This function returns the prime implicants of the given rows
   * @param rows - the row numbers (true rows)
   * @param numVars - the number of variables (to pad the binary representation)
   */
  private getPrimeImplicants(rows: number[], numVars: number) {
    let { rowBinary: currentImplicants } = this.getBinaryRepresentations(rows, numVars) as {
      rowBinary: (0 | 1 | "x")[][]
    }
    let nextImplicants: BinaryMix[][] = []
    const implicants: BinaryMix[][] = []

    while (currentImplicants.length > 0) {
      for (let i = 0; i < currentImplicants.length; i++) {
        for (let j = 0; j < currentImplicants.length; j++) {
          // check if the difference between the two implicants is 1
          if (this.getDiffBinary(currentImplicants[i], currentImplicants[j]) === 1) {
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
      const { diffImplicants } = this.getDiffImplicantsLists(currentImplicants, nextImplicants)
      implicants.push(...diffImplicants)

      currentImplicants = this.removeDuplicates(nextImplicants)
      nextImplicants = []
    }

    return { implicants }
  }

  /**
   * This function returns the number of differences between two binary arrays of the **same length**
   * @param binary1 - first binary array
   * @param binary2 - second binary array
   */
  private getDiffBinary(binary1: BinaryMix[], binary2: BinaryMix[]) {
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
   * This function returns the implicants that aren't in the second list
   * @param implicants1 - first list of implicants
   * @param implicants2 - second list of implicants
   * @param diff - the number of different elements allowed between the two implicant lists
   */
  private getDiffImplicantsLists(
    implicants1: BinaryMix[][],
    implicants2: BinaryMix[][],
    diff: number = 1,
  ) {
    const diffImplicants: BinaryMix[][] = []
    for (const implicant1 of implicants1) {
      let found = false
      for (const implicant2 of implicants2) {
        if (this.getDiffBinary(implicant1, implicant2) === diff) {
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
   * This function removes duplicates from a 2D array of binary arrays
   * @param arr - the 2D array of binary arrays
   */
  private removeDuplicates(arr: BinaryMix[][]) {
    const seen = new Set<string>()
    return arr.filter((val) => !seen.has(val.join("")) && seen.add(val.join("")))
  }

  /**
   * This function returns the rows of each implicant (in binary form) as **2D** array
   * @param implicants - the implicants to get the rows for
   */
  private allImplicantRows(implicants: BinaryMix[][]) {
    const implicantRows: number[][] = []
    for (const implicant of implicants) {
      const binaryValues = this.getImplicantRows(implicant)
      implicantRows.push(binaryValues)
    }
    return { implicantRows }
  }

  /**
   * This function generates all possible rows an implicant could be from
   * @param implicant - the implicant to generate all possible rows for
   *
   * Example:
   * getImplicantRows([0, 1, "x"]) => Returns: [2, 3] (binary values of 010 and 011)
   * getImplicantRows(["x", "x", 1]) => Returns: [1, 3, 5, 7] (binary values of 001, 011, 101, 111)
   */
  private getImplicantRows(implicant: BinaryMix[]): number[] {
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
        helper(index + 1, [...current, 0])
        helper(index + 1, [...current, 1])
      } else {
        helper(index + 1, [...current, implicant[index]])
      }
    }

    helper(0, [])
    return results
  }

  /**
   * This function returns the minimum cover of the given implicant rows,
   * such that all true rows are covered by the minimum number of implicants
   * Set Cover Problem
   * @param implicantRows - the rows of each implicant (2D array => [[1, 2], [1, 3, 4], ...])
   * @param trueRows - the rows that are true in the truth table and need to be covered
   */
  private minimumCover(implicantRows: number[][], trueRows: number[]) {
    const sortedSubsets: number[][] = this.generateSortedSubsets(implicantRows.length)
    // find the smallest set that covers all true rows
    for (const set of sortedSubsets) {
      const rows = set.flatMap((i) => implicantRows[i]).sort()
      if (this.isCover(rows, trueRows)) {
        return set
      }
    }
    // should never reach here
    throw new Error("No cover found")
  }

  /**
   * Generates all subsets of a given length and sorts them by subset size.
   *
   * @param length - The number of elements to include in the array for generating subsets
   * @returns An array of all subsets sorted by length, from smallest to largest
   *
   * Example:
   * generateSortedSubsets(3)
   * => [[], [0], [1], [2], [0, 1], [0, 2], [1, 2], [0, 1, 2]]
   */
  private generateSortedSubsets(length: number) {
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
  private isCover(rows: number[], trueRows: number[]) {
    return trueRows.every((row) => rows.includes(row))
  }

  /**
   * Returns the binary representation for each row-index
   * @param rows
   * @param numVars
   * @private
   */
  private getBinaryRepresentations(rows: number[], numVars: number) {
    const rowBinary: (0 | 1)[][] = []
    for (const row of rows) {
      const binary = row.toString(2).padStart(numVars, "0")
      rowBinary.push(binary.split("").map((val) => (val === "0" ? 0 : 1)))
    }
    return { rowBinary }
  }

  /**
   * This function returns the indices of the rows in the truth table that are true
   * @param tTable - truth table of an expression
   * @param rowType - either true or false rows
   */
  private getIndicesOfRows(tTable: TruthTable, rowType: true | false = true): number[] {
    return tTable.map((val, i) => (val === rowType ? i : -1)).filter((i) => i !== -1)
  }
}
