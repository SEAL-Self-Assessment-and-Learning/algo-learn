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
  const insertions: number[] = possibleValues.slice(0, numberValues - valuesToInsert)
  const toInsert: number[] = possibleValues.slice(numberValues - valuesToInsert)

  for (const value of insertions) {
    hashMap.insert(value)
  }

  return { hashMap, toInsert }
}

export function generateQuestionBase(random: Random, variant: "linear" | "double") {
  const tableSize = random.choice([7, 11])
  const hashFunction = generateHashFunction(
    tableSize,
    variant === "linear" ? "universal" : "double",
    random,
  )()
  const { hashMap, toInsert } = generateOperationsHashMap(random, tableSize, hashFunction.hashFunction)
  return {
    hashMap,
    toInsert,
    hashFunction,
  }
}

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

export function generateReverseLinear(random: Random, translations: Translations, lang: Language) {
  const { hashMap, toInsert, hashFunction } = generateQuestionBase(random, "linear")
  const secondHashMap = hashMap.copy()
  for (const value of toInsert) {
    secondHashMap.insert(value)
  }

  const firstMap = createArrayDisplayCodeBlock({
    array: hashMap.keysList().map((x) => (x === null ? " " : x)),
    lang,
  })
  const secondMap = createArrayDisplayCodeBlock({
    array: secondHashMap.keysList().map((x) => (x === null ? " " : x)),
    lang,
  })

  const feedback: MultiFreeTextFeedbackFunction = ({ text }) => {
    const a = parseInt(text["value-a"].trim())
    const b = parseInt(text["value-b"].trim())
    const p = parseInt(text["value-p"].trim())
    const m = parseInt(text["value-m"].trim())

    if (isNaN(a) || isNaN(b) || isNaN(p) || isNaN(m)) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "invalidInputLinear"),
      }
    }

    if (m !== hashMap.getSize()) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "invalidInputSize", [hashMap.getSize().toString()]),
      }
    }

    const userMap = hashMap.copy()

    function userHashFunction(key: number, size: number) {
      return ((a * key + b) % p) % size
    }
    userMap.replaceHashFunction(userHashFunction)

    for (const value of toInsert) {
      userMap.insert(value)
    }

    const userMapList = userMap.keysList().map((x) => (x === null ? " " : x))
    const secondMapList = secondHashMap.keysList().map((x) => (x === null ? " " : x))
    if (userMapList.toString() !== secondMapList.toString()) {
      return {
        correct: false,
        correctAnswer: hashFunction.hashFunctionString,
      }
    }

    return {
      correct: true,
    }
  }

  const inputFieldTable =
    "\n|a|b|p|m|\n|:===:|:===:|:===:|:===:|\n|{{value-a#OS-2###overlay}}|{{value-b#OS-2###overlay}}|{{value-p#OS-2###overlay}}|{{value-m#OS-2###overlay}}|\n"

  return {
    firstMap,
    secondMap,
    toInsert,
    inputFieldTable,
    checkFormat,
    feedback,
  }
}

export function generateReverseDouble(random: Random, translations: Translations, lang: Language) {
  const { hashMap, toInsert, hashFunction } = generateQuestionBase(random, "double")
  console.log(hashFunction.hashFunctionString)
  const secondHashMap = hashMap.copy()
  for (const value of toInsert) {
    secondHashMap.insert(value)
    console.log(secondHashMap)
  }

  const firstMap = createArrayDisplayCodeBlock({
    array: hashMap.keysList().map((x) => (x === null ? " " : x)),
    lang,
  })
  const secondMap = createArrayDisplayCodeBlock({
    array: secondHashMap.keysList().map((x) => (x === null ? " " : x)),
    lang,
  })

  const feedback: MultiFreeTextFeedbackFunction = ({ text }) => {
    const a = parseInt(text["value-a"].trim())
    const m = parseInt(text["value-m"].trim())

    if (isNaN(a) || isNaN(m)) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "invalidInputLinear"),
      }
    }

    if (m !== hashMap.getSize()) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "invalidInputSize", [hashMap.getSize().toString()]),
      }
    }

    const userMap = hashMap.copy()

    function userHashFunction(key: number, i: number, size: number) {
      const f = (a * key) % size
      const g = m - (key % (m - 1)) - 1
      return (f + i * g) % size
    }
    userMap.replaceHashFunction(userHashFunction)

    for (const value of toInsert) {
      userMap.insert(value)
    }

    const userMapList = userMap.keysList().map((x) => (x === null ? " " : x))
    const secondMapList = secondHashMap.keysList().map((x) => (x === null ? " " : x))
    console.log(userMapList, secondMapList)
    if (userMapList.toString() !== secondMapList.toString()) {
      return {
        correct: false,
        correctAnswer: hashFunction.hashFunctionString,
      }
    }

    return {
      correct: true,
    }
  }

  const inputFieldTable =
    "\n|a|m|\n|:===:|:===:|\n|{{value-a#OS-2###overlay}}|{{value-m#OS-2###overlay}}|\n"

  return {
    firstMap,
    secondMap,
    toInsert,
    inputFieldTable,
    checkFormat,
    feedback,
  }
}
