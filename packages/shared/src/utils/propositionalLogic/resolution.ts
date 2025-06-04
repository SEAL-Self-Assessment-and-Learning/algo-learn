import { Literal } from "./propositionalLogic.ts"

/**
 * A disjunction term is a list of literals.
 */
export type DisjunctionTerm = Literal[]
export type DisjunctionTerms = DisjunctionTerm[]
export type DisjunctionTermsLevel = DisjunctionTerms[]

/**
 * Computes a flat list of all possible derivable disjunction terms,
 * based on the given disjunction terms.
 * Terminates after a given number of rounds.
 *
 * Note: Only using reduction, not "weakening"
 *
 * @param disjunctionTerms - first base of disjunction terms
 * @param rounds
 */
export function getDisjunctionTerms(
  disjunctionTerms: DisjunctionTerms,
  rounds: number = 10,
): DisjunctionTerms {
  return getDisjunctionTermsLevel(disjunctionTerms, rounds).flat()
}

/**
 * Computes a level-based list of all possible derivable disjunction terms,
 * based on the given disjunction terms.
 * Terminates after a specific number of
 *
 * Note: Only using reduction, not "weakening"
 *
 * @param disjunctionTerms - first base of disjunction terms
 * @param rounds
 */
export function getDisjunctionTermsLevel(
  disjunctionTerms: DisjunctionTerms,
  rounds: number = 10,
): DisjunctionTermsLevel {
  const { varNamesIDs, varNamesIDsInverted } = getVarNamesIds(disjunctionTerms)
  const disjunctionDict: [number, number][][] = [createDisjunctionDict(disjunctionTerms, varNamesIDs)]
  const uniqueTerms: Set<string> = initializeUniqueTerms(disjunctionDict[0])
  for (let _ = 0; _ < rounds; _++) {
    const extendDTL = generateNewTerms(disjunctionDict, uniqueTerms)
    disjunctionDict.push(extendDTL)
  }
  return createLiteralFromDict(disjunctionDict, varNamesIDsInverted)
}

/**
 * Initializes the string set to keep track of terms.
 * Utility to reduce the number of terms to be computed.
 * @param disjunctionDict
 */
function initializeUniqueTerms(disjunctionDict: [number, number][]): Set<string> {
  const uniqueTerms = new Set<string>()
  for (const disjunction of disjunctionDict) {
    uniqueTerms.add(stringifyDictTerm(disjunction))
  }
  return uniqueTerms
}

/**
 * Generates new terms based on the given disjunction dictionary.
 * @param disjunctionDict
 * @param uniqueTerms
 */
function generateNewTerms(
  disjunctionDict: [number, number][][],
  uniqueTerms: Set<string>,
): [number, number][] {
  const dictLength = disjunctionDict.length - 1
  const extendDTL: [number, number][] = []
  for (let k = 0; k < disjunctionDict.length; k++) {
    for (let i = 0; i < disjunctionDict[k].length; i++) {
      for (let j = 0; j < disjunctionDict[dictLength].length; j++) {
        processPairs(disjunctionDict[k][i], disjunctionDict[dictLength][j], uniqueTerms, extendDTL)
      }
    }
  }
  return extendDTL
}

/**
 * Processes the pairs of disjunction terms.
 * Combines both terms (false-false and true-true).
 * @param disjunctionA
 * @param disjunctionB
 * @param uniqueTerms
 * @param extendDTL
 */
function processPairs(
  disjunctionA: [number, number],
  disjunctionB: [number, number],
  uniqueTerms: Set<string>,
  extendDTL: [number, number][],
) {
  const pairs: [number, number][] = [
    [disjunctionA[0], disjunctionB[1]],
    [disjunctionA[1], disjunctionB[0]],
  ]
  for (const [a, b] of pairs) {
    computeNewTerms(a & b, disjunctionA, disjunctionB, uniqueTerms, extendDTL)
  }
}

/**
 * Computes in-list all possible new terms based on the intersection of two disjunction terms.
 * @param intersection - intersection of the two disjunction terms
 * @param firstDisjunction - first disjunction term
 * @param secondDisjunction - second disjunction term
 * @param uniqueTerms - current set of unique terms
 * @param extendDTL - list of new terms
 */
function computeNewTerms(
  intersection: number,
  firstDisjunction: [number, number],
  secondDisjunction: [number, number],
  uniqueTerms: Set<string>,
  extendDTL: { [p: number]: number }[],
) {
  let position = 0
  while (intersection > 0) {
    if (intersection & 1) {
      const mask = 1 << position
      // logical OR; if both bits at position are 1 keep, otherwise set to 0
      const newDictTerm = [
        ((firstDisjunction[0] | secondDisjunction[0]) & ~mask) |
          (firstDisjunction[0] & secondDisjunction[0] & mask),
        ((firstDisjunction[1] | secondDisjunction[1]) & ~mask) |
          (firstDisjunction[1] & secondDisjunction[1] & mask),
      ]
      const newDictTermString = stringifyDictTerm(newDictTerm)
      if (!uniqueTerms.has(newDictTermString)) {
        extendDTL.push(newDictTerm)
        uniqueTerms.add(newDictTermString)
      }
    }
    position++
    intersection >>= 1
  }
}

/**
 * Returns the positions of the set bits in the binary representation of a number.
 * @param num
 */
function getOnePositions(num: number): number[] {
  const positions: number[] = []
  let i = 0
  while (num > 0) {
    if (num & 1) {
      positions.push(i)
    }
    num >>= 1
    i++
  }
  return positions
}

/**
 * Converts a disjunction dictionary term to a string.
 * @param disjunction
 */
function stringifyDictTerm(disjunction: { [key: number]: number }) {
  return disjunction[0].toString() + "-" + disjunction[1].toString()
}

/**
 * Converts a disjunction dictionary into a nested array of Literals.
 *
 * @param disjunctionDict - A nested array where each element represents a level of disjunctions.
 *                          Each disjunction is a pair of integers representing variables.
 * @param varNamesIds - A mapping of variable IDs to their corresponding names.
 * @returns A nested array of Literals. Each level contains arrays of Literals representing disjunctions.
 */
function createLiteralFromDict(
  disjunctionDict: [number, number][][],
  varNamesIds: { [key: number]: string },
): DisjunctionTermsLevel {
  return disjunctionDict.map(createLiteralLevel.bind(null, varNamesIds))
}

/**
 * Converts a single level of the disjunction dictionary into an array of Literals.
 *
 * @param varNamesIds - A mapping of variable IDs to their corresponding names.
 * @param disjunctions - An array of pairs representing disjunctions for a single level.
 * @returns An array of Literals representing the disjunctions for this level.
 */
function createLiteralLevel(
  varNamesIds: { [key: number]: string },
  disjunctions: [number, number][],
): DisjunctionTerms {
  return disjunctions.map((disjunction) => createLiteralDisjunction(varNamesIds, disjunction))
}

/**
 * Converts a single disjunction into an array of Literals.
 *
 * @param varNamesIds - A mapping of variable IDs to their corresponding names.
 * @param disjunction - A pair of integers representing a disjunction (positive and negative variables).
 * @returns An array of Literals representing the disjunction.
 */
function createLiteralDisjunction(
  varNamesIds: { [key: number]: string },
  disjunction: [number, number],
): DisjunctionTerm {
  const [positive, negative] = disjunction
  const literals: Literal[] = []

  literals.push(...getOnePositions(positive).map((variable) => new Literal(varNamesIds[variable], true)))
  literals.push(
    ...getOnePositions(negative).map((variable) => new Literal(varNamesIds[variable], false)),
  )

  return literals
}
/**
 * Converts a list-list of literals to a dictionary of disjunction terms.
 * @param literalList
 * @param varNamesIDs
 */
function createDisjunctionDict(
  literalList: Literal[][],
  varNamesIDs: { [key: string]: number },
): [number, number][] {
  const disjunctionDict: [number, number][] = []
  for (const literals of literalList) {
    const termDict: [number, number] = [0, 0]
    for (const literal of literals) {
      termDict[literal.negated ? 0 : 1] += 2 ** varNamesIDs[literal.name]
    }
    disjunctionDict.push(termDict)
  }
  return disjunctionDict
}

/**
 * Returns a dictionary of variable names and their corresponding IDs.
 * Also returns the inverted dictionary (because it can be inverted).
 * @param literalList
 */
function getVarNamesIds(literalList: Literal[][]) {
  const varNamesIDs: { [key: string]: number } = {}
  const varNamesIDsInverted: { [key: number]: string } = {}
  let numVars = 0
  for (const literals of literalList) {
    for (const literal of literals) {
      if (!(literal.name in varNamesIDs)) {
        varNamesIDs[literal.name] = numVars
        varNamesIDsInverted[numVars] = literal.name
        numVars++
      }
    }
  }
  return { varNamesIDs, varNamesIDsInverted }
}

/**
 * Checks if two lists of literals have the same literals.
 * The literal-order doesn't matter.
 * @param ls1
 * @param ls2
 */
export function literalListsEqual(ls1: Literal[], ls2: Literal[]) {
  return ls1.length === ls2.length && ls1.every((l1) => literalListHas(ls2, l1))
}

/**
 * Checks if a specific literal is in a list of literals.
 * @param ls
 * @param l
 */
export function literalListHas(ls: Literal[], l: Literal) {
  return ls.some((l1) => l1.name === l.name && l1.negated === l.negated)
}

/**
 * Checks if a given disjunctionTerm exists within a DTL structure.
 * @param dtl The original DTL structure.
 * @param disjunctionTerm The disjunctionTerm to check.
 * @returns True if the disjunctionTerm exists, false otherwise.
 */
export function isDisjunctionInDTL(
  dtl: DisjunctionTermsLevel,
  disjunctionTerm: DisjunctionTerm,
): boolean {
  return dtl.some((level) =>
    level.some((existingClause) => literalListsEqual(existingClause, disjunctionTerm)),
  )
}
