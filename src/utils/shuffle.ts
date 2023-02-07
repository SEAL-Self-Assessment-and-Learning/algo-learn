import random from "random"

/**
 * Shuffles array in place using Durstenfeld's shuffle algorithm.
 * @param {Array} array An array containing the items.
 * @returns {Array} The shuffled array.
 */
export default function shuffleArray<T>(array: Array<T>): Array<T> {
  for (let i = array.length - 1; i > 0; i--) {
    const j = random.int(0, i)
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
