import {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  MultiFreeTextFeedbackFunction,
  MultiFreeTextFormatFunction,
} from "@shared/api/QuestionGenerator.ts"
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
 * This function creates the view to create a better readable solution for the user
 * @param hashMap
 * @param translations
 * @param lang
 */
function createSolutionViewLinkedHashing(
  hashMap: MapLinked,
  translations: Translations,
  lang: "en" | "de",
) {
  const keyList = hashMap.keysList()
  let tableString = `\n|Index|${t(translations, lang, "Values")}|\n`
  for (let i = 0; i < keyList.length; i++) {
    if (keyList[i].length === 0) {
      tableString += `|${i}| |\n`
    } else {
      let valueString = "$"
      for (let j = 0; j < keyList[i].length; j++) {
        valueString += keyList[i][j] + "\\rightarrow"
      }
      valueString = valueString.slice(0, -11) + "$"
      tableString += `|${i}|${valueString}|\n`
    }
  }
  tableString += "|#div_my-5#||"
  return tableString
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
  variant: "linear" | "linked",
  translations: Translations,
  lang: "de" | "en",
) {
  const tableSize = random.choice([7, 11])
  const tableSizeVariable = random.choice("mnyzpvw".split(""))

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
  const insertValuesString = t(translations, lang, "insert", [insertTable])

  const deleteTable = createTableForValues(deletions.map((i) => i.toString()))
  const deleteValuesString = deletions.length > 0 ? t(translations, lang, "delete", [deleteTable]) : ""
  return {
    tableSize,
    tableSizeVariable,
    randomHashFunction,
    hashMap,
    insertValuesString,
    deleteValuesString,
  }
}

/**
 * This generates a question for hashing with linked lists
 * @param random
 * @param translations
 * @param lang
 */
export function generateQuestionLinkedHashing(
  random: Random,
  translations: Translations,
  lang: "de" | "en",
) {
  const {
    tableSize,
    tableSizeVariable,
    randomHashFunction,
    hashMap,
    insertValuesString,
    deleteValuesString,
  } = generateQuestionBase(random, "linked", translations, lang)

  const checkFormat: MultiFreeTextFormatFunction = ({ text }, fieldID) => {
    // check if the input is a list of numbers separated by commas or - or ->
    const userInput = text[fieldID].trim()
    const userInputList = userInput
      .split(/,|\s*->\s*|-(?!>)/)
      .map((el) => el.trim())
      .filter((el) => el !== "")
    let linkedListString = "$"
    for (const input of userInputList) {
      if (!/^\d+$/.test(input)) {
        return { valid: false, message: t(translations, lang, "checkFormat") }
      }
      linkedListString += `${input} \\rightarrow`
    }
    linkedListString = linkedListString.slice(0, -11) + "$"
    return { valid: true, message: linkedListString }
  }

  const feedback: MultiFreeTextFeedbackFunction = ({ text }) => {
    if (hashMap instanceof MapLinProbing) {
      throw new Error("This function should only be used for linked hashing")
    }
    const wrongAnswerFeedback = {
      correct: false,
      correctAnswer: createSolutionViewLinkedHashing(hashMap, translations, lang),
    }

    const correctSolution: number[][] = hashMap.keysList()
    for (let i = 0; i < hashMap.getSize(); i++) {
      const userRowInput = text[`row-${i}`].trim()
      if (correctSolution[i].length === 0 && userRowInput !== "") {
        return wrongAnswerFeedback
      } else {
        const userRowInputList = userRowInput
          .split(/,|\s*->\s*|-(?!>)/)
          .map((el) => el.trim())
          .filter((el) => el !== "")
        if (userRowInputList.length !== correctSolution[i].length) {
          return wrongAnswerFeedback
        }
        for (let j = 0; j < correctSolution[i].length; j++) {
          if (userRowInputList[j] !== correctSolution[i][j].toString()) {
            return wrongAnswerFeedback
          }
        }
      }
    }

    return {
      correct: true,
    }
  }

  // create a table with two columns and for as many rows as the hashMap is long
  let inputTableString = `\n|Index|${t(translations, lang, "Values")}|\n|---|---|\n`
  for (let i = 0; i < hashMap.getSize(); i++) {
    inputTableString += `|${i}|{{row-${i}#TL###overlay}}|\n`
  }
  inputTableString += "|#div_my-5?border_none?av_middle?ah_center?table_w-full#||"

  return {
    tableSize,
    tableSizeVariable,
    randomHashFunction,
    insertValuesString,
    deleteValuesString,
    inputTableString,
    checkFormat,
    feedback,
  }
}

/**
 * This function generates a question for hashing with linear probing
 * @param random
 * @param translations
 * @param lang
 */
export function generateQuestionLinearProbing(
  random: Random,
  translations: Translations,
  lang: "de" | "en",
) {
  const {
    tableSize,
    tableSizeVariable,
    randomHashFunction,
    hashMap,
    insertValuesString,
    deleteValuesString,
  } = generateQuestionBase(random, "linear", translations, lang)

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
    insertValuesString,
    deleteValuesString,
    checkFormat,
    feedback,
  }
}
