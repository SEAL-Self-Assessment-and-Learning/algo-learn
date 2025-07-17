import type { Language } from "@shared/api/Language.ts"
import type {
  MultiFreeTextFeedbackFunction,
  MultiFreeTextFormatFunction,
} from "@shared/api/QuestionGenerator.ts"
import { generateHashFunction } from "@shared/question-generators/Hashing/Functions.ts"
import {
  MapLinProbing,
  type DoubleHashFunction,
  type HashFunction,
} from "@shared/question-generators/Hashing/MapLinProbing.ts"
import { createArrayDisplayCodeBlock } from "@shared/utils/arrayDisplayCodeBlock.ts"
import type Random from "@shared/utils/random.ts"
import { t, type Translations } from "@shared/utils/translations.ts"

/**
 * Creates a display for the hash map, which is used in the question text
 * @param map
 * @param lang
 */
function createHashDisplay(map: MapLinProbing, lang: Language) {
  return createArrayDisplayCodeBlock({
    array: map.keysList().map((x) => (x === null ? " " : x)),
    lang,
  })
}

/**
 * Generates feedback for the linear probing hash map question
 * @param hashMap - the hash map used for the question
 * @param secondMapList - the expected result of the hash map after insertions
 * @param userInsertions - the values that are inserted using the user hash function
 * @param hashFunctionString - the string representation of the hash function
 * @param translations
 * @param lang
 */
function generateFeedbackLinear(
  hashMap: MapLinProbing,
  secondMapList: (number | string)[],
  userInsertions: number[],
  hashFunctionString: string,
  translations: Translations,
  lang: Language,
): MultiFreeTextFeedbackFunction {
  return ({ text }) => {
    const a = parseInt(text["value-a"]?.trim())
    const b = parseInt(text["value-b"]?.trim())
    const p = parseInt(text["value-p"]?.trim())
    const m = parseInt(text["value-m"]?.trim())

    if ([a, b, p, m].some((x) => isNaN(x))) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "invalidInputLinear"),
      }
    }

    if (m !== hashMap.getSize()) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "invalidInputSize", [m.toString()]),
      }
    }

    const userMap = hashMap.copy()
    userMap.replaceHashFunction((key: number, size: number) => ((a * key + b) % p) % size)
    userInsertions.forEach((v) => userMap.insert(v))

    const userList = userMap.keysList().map((x) => (x === null ? " " : x))
    return {
      correct: userList.toString() === secondMapList.toString(),
      ...(userList.toString() !== secondMapList.toString() && {
        correctAnswer: hashFunctionString,
      }),
    }
  }
}

/**
 * Generates feedback for the double hashing hash map question
 * @param hashMap - the hash map used for the question
 * @param secondMapList - the expected result of the hash map after insertions
 * @param userInsertions - the values that are inserted using the user hash function
 * @param hashFunctionString - the string representation of the hash function
 * @param translations
 * @param lang
 */
function generateFeedbackDouble(
  hashMap: MapLinProbing,
  secondMapList: (number | string)[],
  userInsertions: number[],
  hashFunctionString: string,
  translations: Translations,
  lang: Language,
): MultiFreeTextFeedbackFunction {
  return ({ text }) => {
    const a = parseInt(text["value-a"]?.trim())
    const m = parseInt(text["value-m"]?.trim())

    if ([a, m].some((x) => isNaN(x))) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "invalidInputLinear"),
      }
    }

    if (m !== hashMap.getSize()) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "invalidInputSize", [m.toString()]),
      }
    }

    const userMap = hashMap.copy()
    userMap.replaceHashFunction((key, i, size) => {
      const f = (a * key) % size
      const g = m - (key % (m - 1)) - 1
      return (f + i * g) % size
    })
    userInsertions.forEach((v) => userMap.insert(v))

    const userList = userMap.keysList().map((x) => (x === null ? " " : x))
    return {
      correct: userList.toString() === secondMapList.toString(),
      ...(userList.toString() !== secondMapList.toString() && {
        correctAnswer: hashFunctionString,
      }),
    }
  }
}

/**
 * Generates a hash map with initial insertions and returns user insertions
 * @param random
 * @param tableSize
 * @param hashFunction
 */
export function generateOperationsHashMap(
  random: Random,
  tableSize: number,
  hashFunction: HashFunction | DoubleHashFunction,
) {
  const hashMap: MapLinProbing = new MapLinProbing({ size: tableSize, hashFunction: hashFunction })
  const numberValues = random.int(5, tableSize - 2)
  const possibleValues = random.subset(
    random.shuffle(Array.from({ length: 25 }, (_, i) => i + 1)),
    numberValues,
  )

  const valuesToInsert = random.int(2, 3)
  const initialInsertions: number[] = possibleValues.slice(0, numberValues - valuesToInsert)
  const userInsertions: number[] = possibleValues.slice(numberValues - valuesToInsert)

  for (const value of initialInsertions) {
    hashMap.insert(value)
  }

  return { hashMap, userInsertions }
}

/**
 * Generates the base for the question, including the hash map, user insertions, and hash function
 * @param random
 * @param variant
 */
export function generateQuestionBase(random: Random, variant: "linear" | "double") {
  const tableSize = random.choice([7, 11])
  const hashFunction = generateHashFunction(
    tableSize,
    variant === "linear" ? "universal" : "double",
    random,
  )()
  const { hashMap, userInsertions } = generateOperationsHashMap(
    random,
    tableSize,
    hashFunction.hashFunction,
  )
  return {
    hashMap,
    userInsertions,
    hashFunction,
  }
}

/**
 * Checks the format of the input text for all variants
 * @param text
 * @param fieldID
 */
const checkFormat: MultiFreeTextFormatFunction = ({ text }, fieldID) => {
  // check if text[field] is a valid number
  const value = text[fieldID]
  if (value === undefined || value === "") {
    return {
      valid: false,
    }
  }
  const numberValue = parseInt(value.trim())
  if (isNaN(numberValue)) {
    return {
      valid: false,
    }
  }
  return {
    valid: true,
    message: numberValue.toString(),
  }
}

/**
 * Generates the question for reverse common hashing tasks
 * - Variants: linear and double
 * @param random
 * @param translations
 * @param lang
 * @param variant
 */
function generateReverseCommon(
  random: Random,
  translations: Translations,
  lang: Language,
  variant: "linear" | "double",
) {
  const isLinear = variant === "linear"
  const { hashMap, userInsertions, hashFunction } = generateQuestionBase(random, variant)

  const secondHashMap = hashMap.copy()
  userInsertions.forEach((v) => secondHashMap.insert(v))

  const firstMap = createHashDisplay(hashMap, lang)
  const secondMap = createHashDisplay(secondHashMap, lang)
  const secondList = secondHashMap.keysList().map((x) => (x === null ? " " : x))

  const feedback = isLinear
    ? generateFeedbackLinear(
        hashMap,
        secondList,
        userInsertions,
        hashFunction.hashFunctionString,
        translations,
        lang,
      )
    : generateFeedbackDouble(
        hashMap,
        secondList,
        userInsertions,
        hashFunction.hashFunctionString,
        translations,
        lang,
      )

  const inputFieldTable = isLinear
    ? "\n|a|b|p|m|\n|:===:|:===:|:===:|:===:|\n|{{value-a#OS-2###overlay}}|{{value-b#OS-2###overlay}}|{{value-p#OS-2###overlay}}|{{value-m#OS-2###overlay}}|\n"
    : "\n|a|m|\n|:===:|:===:|\n|{{value-a#OS-2###overlay}}|{{value-m#OS-2###overlay}}|\n"

  return {
    firstMap,
    secondMap,
    userInsertions,
    inputFieldTable,
    checkFormat,
    feedback,
  }
}

export const generateReverseLinear = (random: Random, translations: Translations, lang: Language) =>
  generateReverseCommon(random, translations, lang, "linear")

export const generateReverseDouble = (random: Random, translations: Translations, lang: Language) =>
  generateReverseCommon(random, translations, lang, "double")
