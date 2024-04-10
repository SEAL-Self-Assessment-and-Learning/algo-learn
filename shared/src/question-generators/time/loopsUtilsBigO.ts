import {
  createProductTerm,
  ProductTerm,
} from "@shared/question-generators/asymptotics/asymptoticsUtils.ts"
import { createForLine } from "@shared/question-generators/time/loopsUtils.ts"
import Random from "@shared/utils/random.ts"

/**
 * Sample the source code of a code for which the correct asymptotic complexity is searched
 * Basic construct function
 *
 * @param random
 * @returns - code, functionName, variable, solution
 *            - code: the source code
 *            - functionName: the name of the function
 *            - variable: the name of the variable
 *            - solution: the correct asymptotic complexity
 */
export function sampleLoopBigO(random: Random): {
  code: string
  functionName: string
  variable: string
  solution: ProductTerm
} {
  const functionName = random.choice("fghPp".split(""))
  const variable = random.choice("nmNMxyztk".split(""))
  const availableVarNames = "nmNMxyztk".split("").filter((c) => c !== variable)
  const { code, solution } = sampleBigO({ random, variable, availableVarNames })
  return { code, functionName, variable, solution }
}

export function sampleBigO({
  random,
  variable,
  availableVarNames = "nmNMxyztk".split(""),
  indent = 0,
}: {
  random: Random
  variable: string
  availableVarNames?: string[]
  indent?: number
}) {
  // const _: string = " ".repeat(indent)

  // list of the possible loop types (more nested loops could be to difficult)
  const loopTypes = [
    "for",
    // "for-for",
    // "while",
    // "while-while",
    // "for-while",
    // "while-for",
    // "for-for-for",
  ]

  const loopType = random.choice(loopTypes)
  let code = ``
  let solution: ProductTerm | undefined = undefined
  const innerVar = random.choice(availableVarNames)

  if (loopType === "for") {

    const { code: forCode, solution: forSolution } = createForLoop({ random, variable, innerVar, indent })
    code += forCode
    solution = forSolution

  }

  if (solution === undefined) {
    throw new Error("No solution found, we have to provide a valid solution")
  }

  return { code, solution }
}

function createForLoop ({
    random,
    variable,
    innerVar,
    indent
  }: {
  random: Random,
  variable: string,
  innerVar: string,
  indent: number
}) {

  const asymptoticOptions = random.weightedChoice([
    ["1", 1],
    ["log(n)", 1],
    ["n", 1],
    ["n log(n)", 1],
    ["n^2", 1],
    ["n^2 log(n)", 1],
    ["n^3", 1],
    ["2^n", 1],
  ])

  const solution: ProductTerm = createProductTerm({ polyexponent: 1 })

  return { code: "", solution: solution}
}
