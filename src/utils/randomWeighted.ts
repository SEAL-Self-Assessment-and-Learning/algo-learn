import random, { Random } from "random"

/**
 * Chooses a random index from an array of weights.
 *
 * @param weights An array of weights.
 * @param rng A random number generator. (If not provided, randomWeightedIndex
 *   will use global randomness, and so will not be a pure function.)
 * @returns A random index from the array.
 */
export function randomWeightedIndex(
  weights: number[],
  rng: Random = random
): number {
  const sumOfWeights = weights.reduce((acc, weight) => acc + weight, 0)
  const randomValue = rng.uniform(0, sumOfWeights - 1)()
  let accumulatedWeight = 0
  for (let i = 0; i < weights.length; i++) {
    accumulatedWeight += weights[i]
    if (randomValue < accumulatedWeight) {
      return i
    }
  }

  // This should never be reached, but return the first index as a fallback
  return 0
}

/**
 * Chooses a random element from an array of weighted elements.
 *
 * @param array An array of tuples of the form [element, weight]
 * @param rng A random number generator. (If not provided, randomWeightedChoice
 *   will use global randomness, and so will not be a pure function.)
 * @returns A random element from the array.
 */
export function randomWeightedChoice<T>(
  array: Array<[element: T, weight: number]>,
  rng: Random = random
): T {
  const elements = array.map((w) => w[0])
  const weigths = array.map((w) => w[1])
  return elements[randomWeightedIndex(weigths, rng)]
}
