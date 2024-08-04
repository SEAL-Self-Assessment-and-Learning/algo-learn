import { MapLinked } from "@shared/question-generators/Hashing/MapLinked.ts"
import {
  DoubleHashFunction,
  HashFunction,
  MapLinProbing,
} from "@shared/question-generators/Hashing/MapLinProbing.ts"
import Random from "@shared/utils/random.ts"

/**
 * Creates a md table format for the given values
 * @param values
 */
export function createTableForValues(values: string[]): string {
  let table = "\n|$" + values.join("$|$") + "$|\n|"
  for (let i = 0; i < values.length; i++) {
    table += "---|"
  }
  table += "\n|#div_my-5#|"

  return table
}

/**
 * Generates a HashMap with a given size and a given number of insertions and deletions
 * @param random
 * @param tableSize - size of the HashMap
 * @param task - "insert" or "insert-delete" (first inserts, then deletes)
 * @param mapStyle - "linked" or "linear"
 * @param hashFunction -one of the hash functions from Functions.ts
 */
export function generateOperationsHashMap({
  random,
  tableSize,
  task,
  mapStyle,
  hashFunction,
}: {
  random: Random
  tableSize: number
  task: "insert" | "insert-delete"
  mapStyle: "linked" | "linear"
  hashFunction: HashFunction | DoubleHashFunction
}) {
  let hashMap: MapLinked | MapLinProbing
  if (mapStyle === "linear") {
    hashMap = new MapLinProbing({ size: tableSize, hashFunction: hashFunction })
  } else {
    if (isHashFunction(hashFunction)) {
      hashMap = new MapLinked(tableSize, hashFunction)
    } else {
      throw new Error("Provided function is not a valid HashFunction")
    }
  }

  const insertions: number[] = []
  const possibleValues = Array.from({ length: 25 }, (_, i) => i + 1)
  for (let i = 0; i < tableSize - random.int(1, 3); i++) {
    if (hashMap.getAmount === hashMap.getSize) {
      break
    }

    const newValue = random.choice(possibleValues)
    possibleValues.splice(possibleValues.indexOf(newValue), 1)
    hashMap.insert(newValue, newValue.toString())
    insertions.push(newValue)
  }
  const deletions: number[] = []
  if (task === "insert-delete") {
    for (let i = 0; i < random.int(1, 3); i++) {
      const key = random.choice(hashMap.keys())
      if (key !== null) {
        hashMap.delete(key)
        deletions.push(key)
      }
    }
  }

  return {
    hashMap,
    insertions,
    deletions,
  }
}

/**
 * Checks if the given function is a valid HashFunction
 * @param functionToCheck
 */
function isHashFunction(
  functionToCheck: HashFunction | DoubleHashFunction,
): functionToCheck is HashFunction {
  return functionToCheck && typeof functionToCheck === "function" && functionToCheck.length === 2
}
