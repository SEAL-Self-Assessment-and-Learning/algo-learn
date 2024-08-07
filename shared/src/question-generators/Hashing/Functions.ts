import { DoubleHashFunction, HashFunction } from "@shared/question-generators/Hashing/MapLinProbing.ts"
import Random from "@shared/utils/random.ts"
import primesJSON from "../../utils/primes.json"

/**
 * The type of the hash function generator
 * - hashFunction: the hash function, see DoubleHashFunction and HashFunction
 * - hashFunctionString: the string representation of the hash function, as cite in LaTeX
 */
type GenerateFuncType = {
  hashFunction: HashFunction | DoubleHashFunction
  hashFunctionString: string
}

/**
 * Generates a hash function based on the type of hashing and the table size
 * @param variable - name
 * @param tableSize - provide for better control over the generated numbers used inside the hash
 * @param type - type of hashing
 * @param random
 */
export function generateHashFunction(
  variable: string,
  tableSize: number,
  type: "linked" | "linear",
  random: Random,
): () => GenerateFuncType {
  const divisionMethod = (): GenerateFuncType => {
    function hashFunction(key: number, size: number) {
      return key % size
    }
    let hashFunctionString = ""
    if (type === "linear") {
      hashFunctionString = `\n> $h_i(x) = (x+i) \\bmod ${variable}$`
    } else {
      hashFunctionString = `\n> $h(x) = x \\bmod ${variable}$`
    }

    return {
      hashFunction,
      hashFunctionString,
    }
  }

  const multiplicationMethod = (): GenerateFuncType => {
    // usually it is just one function, but for better readability we split it into two
    const multValue = random.choice([0.75, 0.9].filter((v) => v !== tableSize))

    function hashFunction(key: number, size: number) {
      return Math.floor(size * key * multValue - Math.floor(key * multValue)) % size
    }
    // x*multValue % 1 <=> x*multValue - Math.floor(x*multValue)
    const fString = `\n> $f(x) = \\lfloor ${variable} \\cdot x \\cdot ${multValue} - \\lfloor x \\cdot ${multValue} \\rfloor \\rfloor$`
    let hashFunctionString = ""
    if (type === "linear") {
      hashFunctionString = `\n> $h_i(x) = (f(x) + i) \\bmod ${variable}$`
    } else {
      hashFunctionString = `\n> $h(x) = f(x) \\bmod ${variable}$`
    }

    return {
      hashFunction,
      hashFunctionString: fString + "\n\n" + hashFunctionString,
    }
  }

  const universalHashing = (): GenerateFuncType => {
    // universal hashing function:
    // h(x) = ((ax + b) mod p) mod m
    // where p is a prime number larger than the universe of keys
    // a [1, p-1], b [0, p-1] random numbers
    const pIndex = random.int(11, 20) // we can choose a value like this
    // because there will never be a case where the size of the hashtable is larger
    // than the 11th prime number
    const p = primesJSON[pIndex]
    const a = random.int(1, p - 1)
    const b = random.int(0, p - 1)

    function hashFunction(key: number, size: number) {
      return ((a * key + b) % p) % size
    }

    let hashFunctionString = ""
    if (type === "linear") {
      hashFunctionString = `\n> $h_i(x) = (((${a} \\cdot x + ${b}) \\bmod ${p}) + i) \\bmod ${variable}$`
    } else {
      hashFunctionString = `\n> $h(x) = ((${a} \\cdot x + ${b}) \\bmod ${p}) \\bmod ${variable}$`
    }

    return {
      hashFunction,
      hashFunctionString,
    }
  }

  const doubleLinearHashing = (): GenerateFuncType => {
    const multValue = random.choice([3, 4, 6, 7, 8, 9, 10, 12, 13].filter((v) => v !== tableSize))

    function hashFunction(key: number, i: number, size: number) {
      const f = (multValue * key) % size
      const g = tableSize - 1 - (key % (tableSize - 1))
      return (f + i * g) % size
    }

    const fString = `\n> $f(x) = ${multValue} \\cdot x \\bmod ${tableSize}$`
    const gString = `\n> $g(x) = (${variable} - 1) - (x \\bmod ${variable} - 1)$`
    const hashFunctionString = `\n> $h_i(x) = (f(x) + i \\cdot g(x)) \\bmod ${tableSize}$`

    return {
      hashFunction,
      hashFunctionString: fString + "\n\n" + gString + "\n\n" + hashFunctionString,
    }
  }

  if (type === "linear") {
    return random.choice([divisionMethod, multiplicationMethod, universalHashing, doubleLinearHashing])
  } else {
    return random.choice([divisionMethod, multiplicationMethod, universalHashing])
  }
}
