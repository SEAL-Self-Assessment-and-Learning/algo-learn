/**
 * Computes the greatest common divisor (GCD) of two numbers.
 *
 * @param a First number
 * @param b Second number
 * @returns Greatest common divisor of a and b
 */
export function gcd(a: number, b: number): number {
  while (b !== 0) {
    ;[a, b] = [b, a % b]
  }
  return a
}

/**
 * Calculates the modular inverse of a modulo n using the Extended Euclidean Algorithm.
 *
 * @param a Number for which to find the modular inverse
 * @param n Modulus
 * @returns Modular inverse of a modulo n if it exists, otherwise null
 */
export function calculateModularInverse(a: number, n: number): number | null {
  let t = 0,
    newT = 1
  let r = n,
    newR = a
  while (newR !== 0) {
    const quotient = Math.floor(r / newR)
    ;[t, newT] = [newT, t - quotient * newT]
    ;[r, newR] = [newR, r - quotient * newR]
  }
  if (r > 1) return null
  return t < 0 ? t + n : t
}

/**
 * Performs modular exponentiation i.e. (a^b) % n
 *
 * @param a Base
 * @param b Exponent
 * @param n Modulus
 * @returns Result of (a^b) % n
 */
export function modularExponentiation(a: number, b: number, n: number): number {
  let result = 1
  a = a % n
  while (b > 0) {
    if (b % 2 === 1) result = (result * a) % n
    b = Math.floor(b / 2)
    a = (a * a) % n
  }
  return result
}

/**
 * Solves system of congruences using the Chinese Remainder Theorem (CRT).
 *
 * @param congruences Array of objects representing the system of congruences, where each object contains a (remainder) and n (modulus)
 * @returns Smallest non-negative solution to the system of congruences
 */
export function solveCRT(congruences: { a: number; n: number }[]): number {
  let x = 0
  const product = congruences.reduce((acc, { n }) => acc * n, 1)

  for (const { a, n } of congruences) {
    const partialProduct = product / n
    const inverse = calculateModularInverse(partialProduct, n)
    if (inverse !== null) {
      x += a * partialProduct * inverse
    }
  }

  return ((x % product) + product) % product
}

export function areCoprime(a: number, b: number): boolean {
  return gcd(a, b) === 1
}
