import {
  minimalMultipleChoiceFeedback,
  MultiFreeTextFeedbackFunction,
  MultiFreeTextFormatFunction,
  MultiFreeTextQuestion,
  MultipleChoiceQuestion,
} from "@shared/api/QuestionGenerator"
import { generateWrongAnswersDict } from "@shared/question-generators/huffman-coding/generate/GenerateStructure"
import { generateCharacterFrequencyTable } from "@shared/question-generators/huffman-coding/generate/GenerateWords"
import { getHuffmanCodeOfTable } from "@shared/question-generators/huffman-coding/Huffman"
import { huffmanCoding } from "@shared/question-generators/huffman-coding/huffmanCoding"
import {
  checkProvidedCode,
  convertDictToMdTable,
} from "@shared/question-generators/huffman-coding/utils/utils"
import Random from "@shared/utils/random"
import { t, Translations } from "@shared/utils/translations"

/**
 * This function generates the basic structure for input2 and choice2 questions
 * @param random
 */
function generateInput2Choice2Foundations({ random }: { random: Random }) {
  const numDifferentCharacters = random.int(6, 9)
  const characterFrequencies = generateCharacterFrequencyTable(numDifferentCharacters, random)
  // only temporary displaying the word array
  // add some spacing to table in the question text using extra feature div_my-5
  const displayTable = convertDictToMdTable(characterFrequencies, "#div_my-5#")
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
  const { characterFrequencies, displayTable, correctAnswerDict } = generateInput2Choice2Foundations({
    random,
  })

  let inputFields = ""
  const fieldIDCharMap: { [key: string]: string } = {}
  // iterate through the wordArray to create the input fields
  let i = 0
  for (const key in characterFrequencies) {
    const fieldID = `index-${i}-${key}` // this is the unique ID for the input field
    fieldIDCharMap[fieldID] = key
    inputFields += "|{{" + fieldID + "#TL#" + key + ": ##overlay}}"
    if (i % 2 == 1) {
      inputFields += "|\n"
    }
    i++
  }
  inputFields += "|\n|#border_none?table_w-full#||"

  let solutionDisplay = ""
  for (const key in correctAnswerDict) {
    solutionDisplay += `|**${key}**|$${correctAnswerDict[key]}$|\n`
  }
  solutionDisplay += "|#table_w-full?td?sd?ah_center?div_my-5#| |"

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
        message: t(translations, lang, "feedback.incomplete"),
        correctAnswer: solutionDisplay,
      }
    }
    return {
      correct: true,
      message: t(translations, lang, "feedback.correct"),
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
  const { characterFrequencies, displayTable, correctAnswerDict, correctAnswerTreeNode } =
    generateInput2Choice2Foundations({ random })

  const possibleAnswersTableString: string[] = []
  possibleAnswersTableString.push("\n" + convertDictToMdTable(correctAnswerDict) + "\n")
  generateWrongAnswersDict(random, characterFrequencies, correctAnswerTreeNode).forEach((element) => {
    possibleAnswersTableString.push("\n" + convertDictToMdTable(element) + "\n")
  })

  // shuffle the answers and find the correct index
  random.shuffle(possibleAnswersTableString)
  const correctAnswerIndex = possibleAnswersTableString.indexOf(
    "\n" + convertDictToMdTable(correctAnswerDict) + "\n",
  )

  const question: MultipleChoiceQuestion = {
    type: "MultipleChoiceQuestion",
    name: huffmanCoding.name(lang),
    path: permalink,
    text: t(translations, lang, "textTable", [displayTable, "frequency-table"]),
    answers: possibleAnswersTableString,
    feedback: minimalMultipleChoiceFeedback({
      correctAnswerIndex: correctAnswerIndex,
    }),
  }
  return {
    question,
  }
}
