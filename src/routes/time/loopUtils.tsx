import { ReactElement } from "react"
import Random from "../../utils/random"
import TeX from "../../components/TeX"
import { printStars } from "../recursion/recursiveFormulaUtils"

// function sampleAtomicExpression({
//   random,
//   indent = 4,
// }: {
//   random: Random
//   indent?: number
// }) {
//   const numStars = random.int(1, 4)
//   const code = printStars(numStars, indent)
//   return { code, numStars }
// }

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
  return { code, numStars }
}

/**
 * Sample the source code of a simple recursive procedure that prints stars
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
  const preStars = random.int(0, 3)
  const baseStars = random.int(1, 4)
  const recStars = random.int(0, 3)
  const postStars = random.int(0, 3)
  const numRecCalls = random.int(1, 3)
  const divideBy = random.int(2, 7)

  const availableVarNames = "nmNMxyztk".split("").filter((c) => c !== variable)
  const { code } = sampleExactIfEven({
    random,
    availableVarNames,
  })
  return {
    functionText: code,
    functionName,
    n: variable,
    b: divideBy,
    a: numRecCalls,
    d: preStars + baseStars + postStars,
    c: preStars + recStars + postStars,
  }
}

/**
 * Prints a recurrence relation for a recursive function of the form T(n) = a
 * T(n/b) + c; T(1) = d
 *
 * @returns Output
 */
export function Recurrence({
  T,
  n,
  a,
  b,
  c,
  d,
}: {
  T: string
  n: string
  a: number
  b: number
  c: number
  d: number
}): ReactElement {
  const baseString = `${T}(1) = ${d}`
  const recString = `${T}(${n}) = ${a != 1 ? `${a} ` : ""}${T}(${n}${
    b != 1 ? ` / ${b}` : ""
  }) ${c != 0 ? ` + ${c}` : ""}`
  return (
    <div className="flex flex-col">
      <TeX>
        {baseString}\\{recString}
      </TeX>
    </div>
  )
}

/**
 * Sample a set of recurrence relations for a recursive function of the form
 * T(n) = a T(n/b) + c; T(1) = d
 *
 * @param props
 * @param props.random - Random number generator
 * @param props.T - The correct name of the function
 * @param props.n - The correct name of the variable
 * @param props.a - The correct coefficient of the recursive call
 * @param props.b - The correct divisor in the recursive call
 * @param props.c - The correct constant term
 * @param props.d - The correct value of the function in the base case
 * @returns Array of objects containing the key, whether it is correct, and the
 *   element to render
 */
export function sampleRecurrenceAnswers({
  random,
  T,
  n,
  a,
  b,
  c,
  d,
}: {
  random: Random
  T: string
  n: string
  a: number
  b: number
  c: number
  d: number
}): Array<{ key: string; correct: boolean; element: ReactElement }> {
  const answers: Array<{
    key: string
    correct: boolean
    element: ReactElement
  }> = []
  function tryAdding({
    a,
    b,
    c,
    d,
    correct = false,
  }: {
    a: number
    b: number
    c: number
    d: number
    correct?: boolean
  }) {
    const key = `${a}-${b}-${c}-${d}`
    if (answers.find((ans) => ans.key === key) === undefined) {
      const element = Recurrence({ T, n, a, b, c, d })
      answers.push({ key, correct, element })
    }
  }
  tryAdding({ a, b, c, d, correct: true })
  tryAdding({ a: c, b, c: a, d })

  for (let trials = 0; trials < 100 && answers.length < 4; trials++) {
    a = random.int(1, 3)
    b = random.int(1, 3)
    c = random.int(0, 3)
    d = random.int(1, 3)
    tryAdding({ a, b, c, d })
  }
  return random.shuffle(answers)
}

/**
 * Parse a recursive function of the form "a T(n/b) + c"
 *
 * @param input - The input string
 * @returns Object containing the parsed values
 * @throws {Error} If the input is invalid
 */
export function parseRecursiveFunction(input: string): {
  a: number
  T: string
  n: string
  b: number
  c: number
} {
  const regex =
    /^\s*(\d*)\s*\*?\s*([A-Za-z]+)\s*\(\s*([A-Za-z]+)\s*(?:\/\s*(\d+)\s*)?\)\s*(?:\+\s*(\d+)\s*)?$/
  const match = input.match(regex)

  if (!match) {
    throw new Error("Invalid input format")
  }

  const a = match[1] ? parseInt(match[1], 10) : 1
  const T = match[2]
  const n = match[3]
  const b = match[4] ? parseInt(match[4], 10) : 1
  const c = match[5] ? parseInt(match[5], 10) : 0

  return { a, T, n, b, c }
}
