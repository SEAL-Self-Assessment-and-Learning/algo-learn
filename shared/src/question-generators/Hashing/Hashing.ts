import { validateParameters } from "@shared/api/Parameters.ts"
import {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { generateHashFunction } from "@shared/question-generators/Hashing/Functions.ts"
import { MapLinked } from "@shared/question-generators/Hashing/MapLinked.ts"
import {
  DoubleHashFunction,
  HashFunction,
  MapLinProbing,
} from "@shared/question-generators/Hashing/MapLinProbing.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Hashing",
    description: "Correctly insert value into a hash map",
    resize: "resizable",
    noResize: "non-resizable",
    insert: "We **insert** the following keys: {{0}}",
    delete: "and then **delete** the following keys: {{0}}",
    resizeFactor:
      "Whenever the design factor is at least $\\frac{1}{2}$ we increase the size to the next prime number, but the size at least doubles. If the design factor is at most $\\frac{1}{8}$ we decrease the size to the next prime number, but the size at least quarters.",
    textLinear: `Consider having a empty {{0}} hash table (of size \${{1}}$) implemented with  "Linear Probing". 
{{2}}
{{3}}
{{4}}
    The hash-function is: 
    {{5}} 
    How is the state of the field after the operations?`,
    bottomTextLinear: `Please enter the state of the map after the operations in the format of an Array. You can keep free entries empty or just spaces.`,
    checkFormatLinear: "Please Provide an array only with numbers, commas and spaces",
  },
  de: {
    name: "Hashing",
    description: "Korrektes Einfügen von Werten in eine Hashtabelle",
    resize: "vergößerbare",
    noResize: "nicht-vergrößerbare",
    textLinear: `Consider having a {{0}} hash table (size of {{1}}) implemendted with  "Linear Probing". Initially the hash table is empty. Do the following operations:
    {{2}} 
    The hash-function is: 
    {{3}} 
    How is the state of the field after the operations?`,
  },
}

export const hashingQuestion: QuestionGenerator = {
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["hashing", "hash-map", "hash-list", "hash-function"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["linked", "linear"],
    },
  ],

  generate(generatorPath, lang, parameters, seed) {
    const random = new Random(seed)

    const permalink = serializeGeneratorCall({
      generator: hashingQuestion,
      lang,
      parameters,
      seed,
      generatorPath,
    })

    if (!validateParameters(parameters, hashingQuestion.expectedParameters)) {
      throw new Error(
        `Unknown variant ${parameters.variant.toString()}. Valid variants are: ${hashingQuestion.expectedParameters.join(
          ", ",
        )}`,
      )
    }

    let variant = parameters.variant as "linked" | "linear"
    variant = "linear"

    const resize = random.choice([true, false])
    const resizeString = t(translations, lang, resize ? "resize" : "noResize")

    const tableSize = resize ? 2 : random.int(6, 8)
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
      resize,
      tableSize,
      task,
      mapStyle: variant,
      hashFunction: randomHashFunction.hashFunction,
    })

    const hashMap = generated.hashMap
    const insertions = generated.insertions
    const deletions = generated.deletions

    let insertTable = "\n|$" + insertions.join("$|$") + "$|\n|"
    for (let i = 0; i < insertions.length; i++) {
      insertTable += "---|"
    }
    insertTable += "\n|#div_my-5#|"
    const insertString = t(translations, lang, "insert", [insertTable])

    let deleteTable = "\n|$" + deletions.join("$|$") + "$|\n|"
    for (let i = 0; i < deletions.length; i++) {
      deleteTable += "---|"
    }
    deleteTable += "\n|#div_my-5#|"
    const deleteString = deletions.length > 0 ? t(translations, lang, "delete", [deleteTable]) : ""

    console.log(hashMap.keysList())

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

    let question: FreeTextQuestion
    // eslint-disable-next-line prefer-const
    question = {
      type: "FreeTextQuestion",
      name: t(translations, lang, "name"),
      path: permalink,
      text: t(translations, lang, "textLinear", [
        resizeString,
        tableSizeVariable + "=" + tableSize.toString(),
        resize ? t(translations, lang, "resizeFactor") : "",
        insertString,
        deleteString,
        randomHashFunction.hashFunctionString,
      ]),
      bottomText: t(translations, lang, "bottomTextLinear"),
      placeholder: "[ ,5, ,3,...",
      feedback,
      checkFormat,
    }

    return {
      question,
    }
  },
}

function generateOperationsHashMap({
  random,
  resize,
  tableSize,
  task,
  mapStyle,
  hashFunction,
}: {
  random: Random
  resize: boolean
  tableSize: number
  task: "insert" | "insert-delete"
  mapStyle: "linked" | "linear"
  hashFunction: HashFunction | DoubleHashFunction
}) {
  let hashMap: MapLinked | MapLinProbing
  if (mapStyle === "linear") {
    hashMap = new MapLinProbing({ size: tableSize, hashFunction: hashFunction, resize: resize })
  } else {
    if (isHashFunction(hashFunction)) {
      hashMap = new MapLinked(tableSize, hashFunction)
    } else {
      throw new Error("Provided function is not a valid HashFunction")
    }
  }

  const insertions: number[] = []
  const possibleValues = Array.from({ length: 25 }, (_, i) => i + 1)
  for (let i = 0; i < (resize ? random.int(4, 5) : tableSize - random.int(0, 3)); i++) {
    if (!resize) {
      if (hashMap.getAmount === hashMap.getSize) {
        break
      }
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

function isHashFunction(
  functionToCheck: HashFunction | DoubleHashFunction,
): functionToCheck is HashFunction {
  return functionToCheck && typeof functionToCheck === "function" && functionToCheck.length === 2
}
