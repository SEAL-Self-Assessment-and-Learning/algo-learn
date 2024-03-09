import Fraction from "fraction.js"
import { log } from "mathjs"
import Random from "../../utils/random"
import { createProductTerm, ProductTerm } from "../asymptotics/asymptoticsUtils"

/**
 * Produce a string of the form " print(***)"
 *
 * @param stars - Number of stars
 * @param indent - Number of spaces to indent
 * @returns - The string
 */
export function printStars(stars: number, indent: number): string {
  if (stars == 0) return ""
  else return `${" ".repeat(indent)}print("${"*".repeat(stars)}")\n`
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
}): string {
  const baseString = `${T}(1) = ${d}`
  const recString = `${T}(${n}) = ${a != 1 ? `${a} ` : ""}${T}(${n}${
    b != 1 ? ` / ${b}` : ""
  }) ${c != 0 ? ` + ${c}` : ""}`
  return `$${baseString}\\\\${recString}$`
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
}): Array<{ key: string; correct: boolean; element: string }> {
  const answers: Array<{
    key: string
    correct: boolean
    element: string
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
/**
 * Sample a recursive function T(n) = a T(n/b) + c, T(1) = d that the master
 * theorem can be applied on.
 *
 * @param random - Random number generator
 * @returns - Returns the parameters a, b, c , d, the Theta runtime of the
 *   function, as well as which master theorem case is being used.
 */
export function sampleMasterRecursion(random: Random) {
  const base = random.int(2, 10)
  //get a random exponent, so that the power is below 150 for reasonable recursion functions.
  const result = base ** random.int(1, Math.floor(log(150, base)))
  let a = base
  let b = result
  if (random.int(0, 1) === 0) {
    ;[a, b] = [b, a]
  }
  a = random.weightedChoice([
    [a, 0.85],
    [1, 0.15],
  ])
  let c: ProductTerm
  const masterCase = a === 1 ? random.int(2, 3) : random.int(1, 3)
  let solution: ProductTerm
  const coefficient = random.int(2, 99)
  if (masterCase === 1) {
    const polyexponent = log(a, b) <= 1 ? new Fraction(1, Math.round(log(b, a)) + 1) : log(a, b) - 1
    c = createProductTerm({
      coefficient: coefficient,
      polyexponent: polyexponent,
    })
    solution = createProductTerm({
      coefficient: coefficient,
      polyexponent: log(a, b),
    })
  } else if (masterCase === 2) {
    c = createProductTerm({ coefficient: coefficient, polyexponent: log(a, b) })
    solution = createProductTerm({
      coefficient: coefficient,
      polyexponent: log(a, b),
      logexponent: 1,
    })
  } else {
    const polyexponent =
      a === 1
        ? random.choice([random.int(1, 2), new Fraction(1, random.int(2, 3))])
        : log(a, b) < 1
          ? new Fraction(random.int(1, 3), Math.max(Math.round(log(b, a)) - 1, 1))
          : log(a, b) + 1
    c = createProductTerm({
      coefficient: coefficient,
      polyexponent: polyexponent,
    })
    solution = c
  }
  return {
    b: b,
    a: a,
    c: c,
    d: random.int(2, 9),
    solution: solution,
    masterCase: masterCase,
  }
}
/**
 * Sample a set of Theta runtimes. The runtimes are: Theta(n^log_b(a)),
 * Theta(n^log_b(a) * log(n)), Theta(c) and Theta(c * log(n)) If c = n^logb(a)
 * (master theorem case 2) then Theta(c) and Theta(c * log(n)) get randomized.
 *
 * @returns Array of objects containing the key, whether it is correct, and the
 *   element to render
 */
export function sampleMasterRecursionAnswers({
  random,
  masterCase,
  a,
  b,
  c,
}: {
  random: Random
  masterCase: number
  a: number
  b: number
  c: ProductTerm
}): Array<{ key: string; correct: boolean; element: string }> {
  const answers: Array<{
    key: string
    correct: boolean
    element: string
  }> = []
  function runTime(a: number, b: number) {
    return log(a, b) === 0
      ? "1"
      : log(a, b) === 1
        ? "n"
        : log(a, b) >= 1
          ? `n^${Math.round(log(a, b))}`
          : createProductTerm({
              coefficient: 1,
              polyexponent: new Fraction(1, Math.round(log(b, a))),
            }).toLatex("n")
  }
  answers.push({
    key: "1",
    correct: masterCase === 1,
    element: `\\Theta(${runTime(a, b)})`,
  })
  answers.push({
    key: "2",
    correct: masterCase === 2,
    element: `\\Theta(${log(a, b) === 0 ? "" : runTime(a, b)} \\log(n))`,
  })
  let secondTerm = createProductTerm({
    coefficient: new Fraction(1),
    polyexponent: c.logarithmExponents.get(0),
  }).toLatex("n")
  if (masterCase === 2) {
    secondTerm =
      log(a, b) === 0
        ? "n"
        : log(a, b) === 1
          ? "n^2"
          : log(a, b) >= 1
            ? createProductTerm({
                coefficient: 1,
                polyexponent: Math.round(log(a, b)) + random.choice([-1, 1]),
              }).toLatex("n")
            : createProductTerm({
                coefficient: 1,
                polyexponent: new Fraction(
                  random.int(1, 2),
                  Math.round(log(b, a)) + random.choice([-1, 1]),
                ),
              }).toLatex("n")
  }
  answers.push({
    key: "3",
    correct: masterCase === 3,
    element: `\\Theta(${secondTerm})`,
  })
  answers.push({
    key: "4",
    correct: false,
    element: `\\Theta(${secondTerm === "1" ? "" : secondTerm} \\log(n))`,
  })
  return random.shuffle(answers)
}
