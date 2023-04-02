import { ReactElement } from "react"
import Random from "../../utils/random"
import TeX from "../../components/TeX"

/**
 * Produce a string of the form " print(***)"
 *
 * @param {number} stars - Number of stars
 * @param {number} indent - Number of spaces to indent
 * @returns {string} - The string
 */
function printStars(stars: number, indent: number): string {
  if (stars == 0) return ""
  else return `${" ".repeat(indent)}print("${"*".repeat(stars)}")\n`
}

/**
 * Sample the source code of a simple recursive procedure that prints stars
 *
 * @param {Random} random - Random number generator
 * @returns {Object} - Object containing the source code, the name of the
 *   function, the name of the variable, the number of stars printed in the base
 *   case and in the recursive case, as well as the number of recursive callsand
 *   the number to divide by.
 */
export function sampleRecursiveFunction(random: Random) {
  const functionName = random.choice("fghPp".split(""))
  const variable = random.choice("nmNMxyztk".split(""))
  const preStars = random.int(0, 3)
  const baseStars = random.int(1, 4)
  const recStars = random.int(0, 3)
  const postStars = random.int(0, 3)
  const numRecCalls = random.int(1, 3)
  const divideBy = random.int(2, 7)

  let functionText = ""
  functionText += `def ${functionName}(${variable}):\n`
  functionText += printStars(preStars, 2)
  functionText += `  if (${variable} <= 1):\n`
  functionText += printStars(baseStars, 4)
  functionText += `  else:\n`
  functionText += printStars(recStars, 4)
  for (let i = 0; i < numRecCalls; i++) {
    functionText += `    ${functionName}(${variable}/${divideBy})\n`
  }
  functionText += printStars(postStars, 2)
  return {
    functionText,
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
 * @returns {ReactElement} Output
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
 * @param {Object} props
 * @param {Random} props.random - Random number generator
 * @param {string} props.T - The correct name of the function
 * @param {string} props.n - The correct name of the variable
 * @param {number} props.a - The correct coefficient of the recursive call
 * @param {number} props.b - The correct divisor in the recursive call
 * @param {number} props.c - The correct constant term
 * @param {number} props.d - The correct value of the function in the base case
 * @returns {Array} Array of objects containing the key, whether it is correct,
 *   and the element to render
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
 * @param {string} input - The input string
 * @returns {Object} Object containing the parsed values
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
