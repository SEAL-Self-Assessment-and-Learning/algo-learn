import {
  minimalMultipleChoiceFeedback,
  type MultiFreeTextFeedbackFunction,
  type MultiFreeTextFormatFunction,
  type MultiFreeTextQuestion,
  type MultipleChoiceQuestion,
} from "../../../api/QuestionGenerator.ts"
import type Random from "../../../utils/random.ts"
import { t, type Translations } from "../../../utils/translations.ts"
import { generatePossibleAnswersChoice2 } from "../generate/dictStructure.ts"
import { generateCharacterFrequencyTable } from "../generate/words.ts"
import { getHuffmanCodeOfTable } from "../Huffman.ts"
import { huffmanCoding } from "../huffmanCoding.ts"
import { checkProvidedCode, convertDictToMdTable } from "./utils.ts"

/**
 * This function generates the basic structure for input2 and choice2 questions
 * @param random
 */
function generateDictFoundations({ random }: { random: Random }) {
  const numDifferentCharacters = random.int(6, 9)
  const characterFrequencies = generateCharacterFrequencyTable(numDifferentCharacters, random)
  // only temporary displaying the word array
  // add some spacing to table in the question text using extra feature div_my-5
  const displayTable = convertDictToMdTable(characterFrequencies)
  const correctAnswerTreeNode = getHuffmanCodeOfTable(characterFrequencies)
  const correctAnswerDict = correctAnswerTreeNode.getEncodingTable()

  return {
    characterFrequencies,
    displayTable,
    correctAnswerDict,
    correctAnswerTreeNode,
  }
}

/**
 * This function creates the input fields for the user to provide the encoding
 * as a string inside a md table
 * @param characterFrequencies
 */
function createInputFields(characterFrequencies: { [p: string]: number }) {
  let inputFields = "|"
  const fieldIDCharMap: { [key: string]: string } = {}
  // iterate through the wordArray to create the input fields
  let i = 0
  for (const key in characterFrequencies) {
    const fieldID = `index-${i}-${key}` // this is the unique ID for the input field
    fieldIDCharMap[fieldID] = key
    inputFields += `${key}:|{{${fieldID}#TL###overlay}}|`
    if (i % 2 == 1) {
      inputFields += "\n|"
    }
    i++
  }

  return inputFields
}

/**
 * This function creates the solution table for the user to see a correct encoding
 * @param correctAnswerDict
 */
function createSolutionTable(correctAnswerDict: Record<string, string>) {
  let solutionDisplay = ""
  for (const key in correctAnswerDict) {
    solutionDisplay += `|**${key}**|$${correctAnswerDict[key]}$|\n`
  }
  return solutionDisplay
}

/**
 * This generates the question for input2 (huffman)
 *
 * It generates characterFrequencies and the user has to provide a possible encoding of those chars
 *
 * @param random - random class
 * @param translations - translation with the text needed for the task
 * @param lang - german or english
 * @param permalink .
 */
export function generateInput2Question({
  random,
  translations,
  lang,
  permalink,
}: {
  random: Random
  translations: Translations
  lang: "en" | "de"
  permalink: string
}) {
  const { characterFrequencies, displayTable, correctAnswerDict } = generateDictFoundations({
    random,
  })
  const inputFields = createInputFields(characterFrequencies)
  const solutionTable = createSolutionTable(correctAnswerDict)

  const checkFormat: MultiFreeTextFormatFunction = ({ text }, fieldID) => {
    if (text[fieldID].trim() === "") return { valid: false, message: "" }
    // iterate over each letter to check if either 0 or 1 only for the currently selected field
    for (let i = 0; i < text[fieldID].length; i++) {
      if (text[fieldID][i] !== "0" && text[fieldID][i] !== "1") {
        return {
          valid: false,
          message: t(translations, lang, "feedbackInvalid"),
        }
      }
    }
    // no format error
    return {
      valid: true,
      message: "",
    }
  }

  const feedback: MultiFreeTextFeedbackFunction = ({ text }) => {
    // First rename the keys to the original keys format index-num-letter
    // create a dict only with the letter followed by encoding
    // {"A": "01010", "B": "1111" ... }
    const userAnswerDict: { [key: string]: string } = {}
    for (const key in text) {
      const keyArray = key.split("-")
      const newKey = `${keyArray[2]}`
      userAnswerDict[newKey] = text[key]
    }

    if (!checkProvidedCode(characterFrequencies, correctAnswerDict, userAnswerDict)) {
      return {
        correct: false,
        correctAnswer: solutionTable,
      }
    }
    return {
      correct: true,
    }
  }

  const question: MultiFreeTextQuestion = {
    type: "MultiFreeTextQuestion",
    name: huffmanCoding.name(lang),
    path: permalink,
    fillOutAll: true,
    text: t(translations, lang, "multiInputText", [displayTable, inputFields]),
    feedback,
    checkFormat,
  }
  return {
    question,
  }
}

/**
 * This generates the question for choice2 (huffman)
 *
 * It generates characterFrequencies and the user has to choose the correct encoding of those chars
 * It has multiple choice answers
 *
 * @param random - random class
 * @param translations - translation with the text needed for the task
 * @param lang - german or english
 * @param permalink .
 */
export function generateChoice2Question({
  random,
  translations,
  lang,
  permalink,
}: {
  random: Random
  translations: Translations
  lang: "en" | "de"
  permalink: string
}) {
  const { characterFrequencies, displayTable, correctAnswerTreeNode } = generateDictFoundations({
    random,
  })
  const { answers, correctAnswerIndices } = generatePossibleAnswersChoice2(
    random,
    characterFrequencies,
    correctAnswerTreeNode,
  )

  const question: MultipleChoiceQuestion = {
    type: "MultipleChoiceQuestion",
    name: huffmanCoding.name(lang),
    path: permalink,
    allowMultiple: true,
    text: t(translations, lang, "textTable", [displayTable, "frequency-table"]),
    answers: answers,
    feedback: minimalMultipleChoiceFeedback({
      correctAnswerIndex: correctAnswerIndices,
    }),
  }
  return {
    question,
  }
}
