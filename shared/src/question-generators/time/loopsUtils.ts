import Random from "../../utils/random"
import { printStars } from "../recursion/formulaUtils"

/**
 * Sample the source code of a simple loop that prints stars
 *
 * @param random - Random number generator
 * @returns - Object containing the source code, the name of the function, the
 *   name of the variable, the number of stars printed in the base case and in
 *   the recursive case, as well as the number of recursive callsand the number
 *   to divide by.
 */
export function sampleLoop(random: Random) {
  const functionName = random.choice("fghPp".split(""))
  const variable = random.choice("nmNMxyztk".split(""))
  const availableVarNames = "nmNMxyztk".split("").filter((c) => c !== variable)
  const { code, numStars } = sampleExactIfEven({
    random,
    availableVarNames,
  })
  return {
    functionText: code,
    functionName,
    n: variable,
    numStars,
  }
}

/**
 * Sample the source code of a simple loop that prints stars
 *
 * @param props
 * @param props.random - Random number generator
 * @param props.availableVarNames - Variable names that can be used
 * @param props.indent - Indentation level
 * @returns Source code
 */
export function sampleExactIfEven({
  random,
  availableVarNames = "nmNMxyztk".split(""),
  indent = 0,
}: {
  random: Random
  availableVarNames?: string[]
  indent?: number
}) {
  const _ = " ".repeat(indent)
  const innerVar = random.choice(availableVarNames)
  const low = random.int(0, 3)
  const high = random.int(6, 9)
  let code = ""
  code += `${_}for ${innerVar} from ${low} to ${high}:\n`
  const cond = random.choice(["even", "odd"])
  code += `${_}  if ${innerVar} is ${cond}:\n`
  const numPrint = random.int(1, 4)
  code += printStars(numPrint, indent + 4)
  let numStars = 0
  for (let i = low; i <= high; i++) {
    if (cond === "odd" && (i & 1) === 1) numStars += numPrint
    else if (cond === "even" && (i & 1) === 0) numStars += numPrint
  }
  return { code: code.trim(), numStars }
}
