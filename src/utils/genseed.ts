import random, { Random } from "random"

/**
 * Generates a random base36 string of a given length.
 *
 * @property {Random} rng A random number generator. (If not provided, genSeed
 *   will use global randomness, and so will not be a pure function.)
 * @property {string} seed Generate the new seed from this seed. (If not
 *   provided, a new seed will be generated using global randomness, and genSeed
 *   will not be a pure function.)
 * @property {number} length The length of the string to generate.
 * @returns {string} A random base36 string of the given length.
 */
export function genSeed({
  rng = random,
  seed,
  length = 7,
}: {
  rng?: Random
  seed?: string
  length?: number
} = {}): string {
  if (seed !== undefined) {
    rng = rng.clone(seed)
  }
  // Possibly-seeded equivalent to:
  // return Math.random().toString(36).slice(2, length + 2)
  const str = []
  for (let i = 0; i < length; i++) {
    str.push(rng.int(0, 35).toString(36))
  }
  return str.join("")
}
