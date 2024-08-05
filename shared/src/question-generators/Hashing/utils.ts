import { FreeTextFeedbackFunction, FreeTextFormatFunction } from "@shared/api/QuestionGenerator.ts"
import { generateHashFunction } from "@shared/question-generators/Hashing/Functions.ts"
import { MapLinked } from "@shared/question-generators/Hashing/MapLinked.ts"
import {
  DoubleHashFunction,
  HashFunction,
  MapLinProbing,
} from "@shared/question-generators/Hashing/MapLinProbing.ts"
import Random from "@shared/utils/random.ts"
import { t, Translations } from "@shared/utils/translations.ts"

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
      hashMap.delete(key)
      deletions.push(key)
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

/**
 * Generates a question base with a hash map and operations
 * Used by both linear probing and linked hashing
 * @param random
 * @param variant
 * @param translations
 * @param lang
 */
export function generateQuestionBase(
  random: Random,
  variant: "linear",
  translations: Translations,
  lang: "de" | "en",
) {
  const tableSize = random.int(6, 8)
  const tableSizeVariable = random.choice("mnxyzpvw".split(""))

  // insert -> only inserting into hash table
  // insert-delete -> inserting and deleting from hash table
  const task: "insert" | "insert-delete" = random.weightedChoice([
    ["insert", 0.85],
    ["insert-delete", 0.15],
  ])

  const randomHashFunction = generateHashFunction(tableSizeVariable, tableSize, variant, random)()

  const generated = generateOperationsHashMap({
    random,
    tableSize,
    task,
    mapStyle: variant,
    hashFunction: randomHashFunction.hashFunction,
  })

  const hashMap = generated.hashMap
  const insertions = generated.insertions
  const deletions = generated.deletions

  const insertTable = createTableForValues(insertions.map((i) => i.toString()))
  const insertString = t(translations, lang, "insert", [insertTable])

  const deleteTable = createTableForValues(deletions.map((i) => i.toString()))
  const deleteString = deletions.length > 0 ? t(translations, lang, "delete", [deleteTable]) : ""
  return { tableSize, tableSizeVariable, randomHashFunction, hashMap, insertString, deleteString }
}

/**
 * This function generates a question for linear probing
 * @param random
 * @param translations
 * @param lang
 */
export function generateQuestionLinearProbing(
  random: Random,
  translations: Translations,
  lang: "de" | "en",
) {
  const { tableSize, tableSizeVariable, randomHashFunction, hashMap, insertString, deleteString } =
    generateQuestionBase(random, "linear", translations, lang)

  const checkFormat: FreeTextFormatFunction = ({ text }) => {
    text = text.trim()
    text = text.replace("[", "")
    text = text.replace("]", "")
    const fields = text.split(",")

    // Don't compare length in checkFormat, because this could be a mistake by the user
    let tableHeader: string = `|`
    let tableSeparator: string = `|`
    for (const field of fields) {
      if (field.trim() !== "" && isNaN(parseInt(field.trim()))) {
        return { valid: false, message: t(translations, lang, "checkFormatLinear") }
      }
      if (field.trim() === "") {
        tableHeader += `-|`
      } else {
        tableHeader += `$${field.trim()}$|`
      }
      tableSeparator += `---|`
    }

    // generate a table based on the user input
    const arrayTable = `
${tableHeader}
${tableSeparator}
      `

    return { valid: true, message: arrayTable }
  }

  const feedback: FreeTextFeedbackFunction = ({ text }) => {
    text = text.trim()
    text = text.replace("[", "")
    text = text.replace("]", "")

    const correctSolution: string[] = []
    for (const key of hashMap.keysList() as (number | null)[]) {
      if (key === null) {
        correctSolution.push("_")
      } else {
        correctSolution.push("$" + key.toString() + "$")
      }
    }
    const correctAnswer = "$[$" + correctSolution.join("**,**") + "$]$"

    const fields = text.split(",")
    if (fields.length !== tableSize) {
      return {
        correct: false,
        correctAnswer,
      }
    }

    let i: number = 0
    for (const key of hashMap.keysList() as (number | null)[]) {
      if (key === null) {
        if (fields[i].trim() !== "") {
          return {
            correct: false,
            correctAnswer,
          }
        }
      } else {
        if (parseInt(fields[i].trim()) !== key) {
          return {
            correct: false,
            correctAnswer,
          }
        }
      }
      i++
    }

    return { correct: true, feedback: text }
  }
  return {
    tableSize,
    tableSizeVariable,
    randomHashFunction,
    insertString,
    deleteString,
    checkFormat,
    feedback,
  }
}
