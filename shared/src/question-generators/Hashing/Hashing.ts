import { validateParameters } from "@shared/api/Parameters.ts"
import {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { generateHashFunction } from "@shared/question-generators/Hashing/Functions.ts"
import {
  createTableForValues,
  generateOperationsHashMap,
} from "@shared/question-generators/Hashing/utils.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Hashing",
    description: "Correctly insert value into a hash map",
    insert: "We **insert** the following keys: {{0}}",
    delete: "and then **delete** the following keys: {{0}}",
    textLinear: `Consider a hash table (size \${{0}}$) implemented with  "Linear Probing". 
{{1}}
{{2}}
    The hash-function is: 
    {{3}} 
    How is the state of the field after the operations?`,
    bottomTextLinear: `Please enter the state of the map after the operations in the format of an Array. You can keep free entries empty or just spaces.`,
    checkFormatLinear: "Please Provide an array only with numbers, commas and spaces",
  },
  de: {
    name: "Hashing",
    description: "Füge den Wert korrekt in eine Hash-Map ein",
    insert: "Wir **fügen** die folgenden Schlüssel ein: {{0}}",
    delete: "und dann **löschen** wir die folgenden Schlüssel: {{0}}",
    textLinear: `Betrachten Sie eine Hashtabelle (Größe \${{0}}$), die mit "Linear Probing" implementiert ist.
{{1}}
{{2}}
    Die Hash-Funktion ist: 
    {{3}}
    Wie ist der Zustand des Feldes nach den Operationen?`,
    bottomTextLinear: `Bitte geben Sie den Zustand der Karte nach den Operationen im Format eines Arrays ein. Sie können freie Einträge leer lassen oder einfach Leerzeichen verwenden.`,
    checkFormatLinear: "Bitte geben Sie nur ein Array mit Zahlen, Kommas und Leerzeichen an",
  },
}

/**
 * Generates a question with a hash map and operations
 * @param random
 * @param variant
 * @param lang
 */
function generateQuestionBase(random: Random, variant: "linear", lang: "de" | "en") {
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

export const hashingQuestion: QuestionGenerator = {
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["hashing", "hash-map", "hash-list", "hash-function"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["linear"], //Todo: Add linked
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

    const { tableSize, tableSizeVariable, randomHashFunction, hashMap, insertString, deleteString } =
      generateQuestionBase(random, variant, lang)

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

    const question: FreeTextQuestion = {
      type: "FreeTextQuestion",
      name: t(translations, lang, "name"),
      path: permalink,
      text: t(translations, lang, "textLinear", [
        tableSizeVariable + "=" + tableSize.toString(),
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
