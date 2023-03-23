import random, { Random } from "random"

/**
 * Shuffles array in place using Durstenfeld's shuffle algorithm.
 *
 * @param {Array} array An array containing the items.
 * @param {Random} rng A random number generator. (If not provided, shuffleArray
 *   will use global randomness, and so will not be a pure function.)
 * @returns {Array} A reference to the same array, now shuffled.
 */
export default function shuffleArray<T>(
  array: Array<T>,
  rng: Random = random
): Array<T> {
  for (let i = array.length - 1; i > 0; i--) {
    const j = rng.int(0, i)
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
