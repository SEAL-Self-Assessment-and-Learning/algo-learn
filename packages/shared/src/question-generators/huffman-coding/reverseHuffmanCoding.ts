import type {
  MultiFreeTextFeedbackFunction,
  MultiFreeTextFormatFunction,
  MultiFreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import {
  getHuffmanCodeOfTable,
  type HuffmanNode,
} from "@shared/question-generators/huffman-coding/Huffman.ts"
import {
  checkProvidedCode,
  convertDictToMdTable,
} from "@shared/question-generators/huffman-coding/utils/utils.ts"
import { generateDictFoundations } from "@shared/question-generators/huffman-coding/utils/utilsDict.ts"
import { mdTableFromData } from "@shared/utils/markdownTools.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, type Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Reverse Huffman-Coding",
    description: "Determine the frequency distribution for a given Huffman Coding",
    text: `Consider the following prefix free code \n{{0}} 
    Find a frequency distribution that satisfies the following conditions: 
- The given code is optimal for the distribution.
- Each character in $\\{$** {{1}} **$\\}$ appears at least once.
- No two characters occur with the same frequency.

Provide the number of frequencies for each character:
{{2}}
    `,
    checkFormatInteger: "Only positive Integer values",
    feedbackDuplicates: "There are duplicated values in your frequencies.",
    feedbackEqu: "Your frequencies can't compute an equivalent prefix free code.",
  },
  de: {
    name: "Umgekehrte Huffman-Kodierung",
    description: "Erstelle einen Text für eine gegebene Huffman-Kodierung",
    text: `Betrachte den folgenden präfixfreien Code \n{{0}} 
    Finde einen Text $T$: 
- bei dem der oben angegebene Code **optimal** ist
- der jedes der Zeichen $\\{$** {{1}} **$\\}$ **mindestens einmal** enthält
- bei dem keine zwei Zeichen mit der gleichen Häufigkeit auftreten

Gib die Anzahl der Vorkommen jedes Zeichen in $T$ an:
{{2}}
    `,
    checkFormatInteger: "Nur positive Ganzzahlen",
    feedbackDuplicates: "Es gibt doppelte Werte in deinen Häufigkeiten.",
    feedbackEqu: "Mit deinen Häufigkeiten kann kein äquivalenter präfixfreier Code erstellt werden.",
  },
}

export const ReverseHuffmanCoding: QuestionGenerator = {
  id: "huffmanrev",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["start"], // "minimal"
    },
  ],

  generate: (lang, parameters, seed) => {
    const permalink = serializeGeneratorCall({
      generator: ReverseHuffmanCoding,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)

    const numDifferentCharacters = random.int(6, 8)
    const {
      characterFrequencies,
      correctAnswerDict: originalEncoding,
      correctAnswerTreeNode: originalTreeNode,
    } = generateDictFoundations({
      random,
      numDifferentCharacters,
    })
    // fits on iPhone SE 3rd generation
    const frequencyTable = convertDictToMdTable(originalEncoding)

    const charList: string[] = Object.keys(characterFrequencies)
    const numberOfInputFields =
      numDifferentCharacters - random.int(2, Math.round(numDifferentCharacters / 2))
    const indicesOfInputFields: number[] = random.subset(
      Array.from({ length: numDifferentCharacters }, (_, i) => i),
      numberOfInputFields,
    )
    const mixInputCharFreqTable = createMixInputCharFreqTable({
      characterFrequencies,
      indicesOfInputFields,
      charList,
    })
    const question: MultiFreeTextQuestion = {
      type: "MultiFreeTextQuestion",
      name: ReverseHuffmanCoding.name(lang),
      path: permalink,
      text: t(translations, lang, "text", [frequencyTable, charList.join(", "), mixInputCharFreqTable]),
      fillOutAll: true,
      checkFormat: checkIntegerInput(lang),
      feedback: getFeedback({
        lang,
        charList,
        indicesOfInputFields,
        characterFrequencies,
        originalTreeNode,
      }),
    }

    return {
      question,
    }
  },
}

/**
 * Feedback to check if the user provided frequencies can compute the correct code
 * - checks for duplicated frequencies
 * - then checks if frequencies compute correct code
 * @param lang
 * @param charList
 * @param indicesOfInputFields
 * @param characterFrequencies
 * @param originalTreeNode
 */
function getFeedback({
  lang,
  charList,
  indicesOfInputFields,
  characterFrequencies,
  originalTreeNode,
}: {
  lang: "de" | "en"
  charList: string[]
  indicesOfInputFields: number[]
  characterFrequencies: { [_: string]: number }
  originalTreeNode: HuffmanNode
}): MultiFreeTextFeedbackFunction {
  return ({ text: userDict }) => {
    const combinedUserFrequencies: { [_: string]: number } = {}
    for (let i = 0; i < Object.keys(characterFrequencies).length; i++) {
      if (indicesOfInputFields.includes(i)) {
        combinedUserFrequencies[charList[i]] = Number.parseInt(userDict["char-" + i])
      } else {
        combinedUserFrequencies[charList[i]] = characterFrequencies[charList[i]]
      }
    }

    if (!feedbackDuplicatesCheck(combinedUserFrequencies)) {
      return {
        correct: false,
        correctAnswer: convertDictToMdTable(characterFrequencies),
        feedbackText: t(translations, lang, "feedbackDuplicates"),
      }
    }

    const combinedUserTreeNode = getHuffmanCodeOfTable(combinedUserFrequencies)
    const combinedUserEncoding = combinedUserTreeNode.getEncodingTable()

    const validFrequencies = checkProvidedCode(
      combinedUserFrequencies,
      combinedUserEncoding,
      originalTreeNode.getEncodingTable(),
    )
    if (!validFrequencies) {
      return {
        correct: false,
        correctAnswer: convertDictToMdTable(characterFrequencies),
        feedbackText: t(translations, lang, "feedbackEqu"),
      }
    }

    return {
      correct: true,
    }
  }
}

/**
 * Checks if a values appears twice in the dictionary and returns true or false
 * @param combinedFrequencies
 */
function feedbackDuplicatesCheck(combinedFrequencies: { [p: string]: number }) {
  // check combined frequencies values for duplicated numbers
  const values = Object.values(combinedFrequencies)
  const uniqueValues = new Set(values)
  return values.length === uniqueValues.size
}

/**
 * Checks if the user input is an integer greater than 0
 * @param lang
 */
function checkIntegerInput(lang: "en" | "de"): MultiFreeTextFormatFunction {
  return ({ text }, fieldID) => {
    const userInput = text[fieldID].replace(/\s+/g, "")
    if (userInput === "") return { valid: false }
    if (
      Number.isNaN(Number.parseInt(userInput, 10)) ||
      Number.parseInt(userInput, 10).toString() !== userInput
    ) {
      return {
        valid: false,
        message: t(translations, lang, "checkFormatInteger"),
      }
    }
    if (Number.parseInt(userInput, 10) < 1) {
      return {
        valid: false,
        message: "> 0",
      }
    }
    return { valid: true }
  }
}

/**
 * Creates a mixed table of char frequencies and input fields
 * @param characterFrequencies -
 * @param indicesOfInputFields - indicates which element in the char list should be replaced
 *                               by an input field
 * @param charList - all appearing chars (same as Object.keys(characterFrequencies), but sorted)
 */
function createMixInputCharFreqTable({
  characterFrequencies,
  indicesOfInputFields,
  charList,
}: {
  characterFrequencies: { [_: string]: number }
  indicesOfInputFields: number[]
  charList: string[]
}) {
  const data: string[][] = []
  data.push(charList.map((value) => value))
  data.push(
    charList.map((key, i) =>
      indicesOfInputFields.includes(i)
        ? `{{char-${i}#OS-2###overlay}}`
        : `**${characterFrequencies[key]}**`,
    ),
  )
  return mdTableFromData(data, "center", undefined, [0], [])
}
