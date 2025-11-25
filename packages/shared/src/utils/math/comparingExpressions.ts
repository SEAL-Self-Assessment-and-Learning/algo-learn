import type Random from "@shared/utils/random.ts"
import { approximatelyEqual, type ExprNode } from "./arithmeticExpression.ts"

const maxIterations = 1000

/**
 * Compares two expressions for equality by evaluating them with random variable assignments.
 *
 * Based on:
 * https://users.cs.duke.edu/~reif/courses/complectures/books/AB/ABbook.pdf
 * Chapter 7.2.2 - Polynomial identity testing
 *
 * Expressions don't have to use the same variable set.
 * For example, the expressions "x + 0*y" and "x" would be considered equal.
 * But the expressions "x + a" and "x + b" would not be considered equal.
 *
 * @param expr1 - First expression
 * @param expr2 - Second expression
 * @param random - To pick random values for variables
 * @returns True if the expressions are considered equal, false otherwise
 *          All paris of the expressions that were not equal
 */
export function expressionsEqual(
  expr1: ExprNode,
  expr2: ExprNode,
  random: Random,
): {
  equal: boolean
  wrongEvaluations?: Array<{
    values: { [key: string]: number }
    value1: number
    value2: number
  }>
} {
  let errorCount = 0
  const highPrimeValue = 299600008717
  const epsilon = 1e-8

  const wrongEvaluations: Array<{
    values: { [key: string]: number }
    value1: number
    value2: number
  }> = []

  const variables1 = expr1.getVariables()
  const variables2 = expr2.getVariables()

  for (let _ = 0; _ < maxIterations; _++) {
    const randomValues = getRandomValues(new Set([...variables1, ...variables2]), random)

    const value1 = expr1.evaluate(randomValues, highPrimeValue) as number
    const value2 = expr2.evaluate(randomValues, highPrimeValue) as number

    if (!approximatelyEqual(value1, value2, epsilon)) {
      errorCount++
      wrongEvaluations.push({
        values: randomValues,
        value1,
        value2,
      })
    }
  }
  return {
    equal: errorCount <= 2,
    wrongEvaluations,
  }
}

/**
 * Generates random values for a set of variables.
 * @param variables
 * @param random
 */
function getRandomValues(variables: Set<string>, random: Random): { [key: string]: number } {
  const values: { [key: string]: number } = {}
  for (const variable of variables) {
    values[variable] = random.int(-1000, 1000)
  }
  return values
}
