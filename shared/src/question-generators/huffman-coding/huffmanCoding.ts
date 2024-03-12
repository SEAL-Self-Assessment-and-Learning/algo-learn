// TODO: check if the table could be to wide to be represented as possible answer

import { validateParameters } from "@shared/api/Parameters.ts"
import {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  minimalMultipleChoiceFeedback,
  Question,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import {
  createHuffmanCoding,
  huffmanCodingAlgorithm,
  TreeNode,
} from "@shared/question-generators/huffman-coding/Algorithm.ts"
import {
  generateString,
  generateWordArray,
} from "@shared/question-generators/huffman-coding/GenerateWords.ts"
import {
  generateRandomWrongAnswer,
  generateWrongAnswerChangeWord,
  generateWrongAnswerFlip01InCodeChar,
  generateWrongAnswerReduceCodeOfLetter,
  generateWrongAnswerShuffleWord,
  generateWrongAnswerSwitchLetters,
} from "@shared/question-generators/huffman-coding/GenerateWrongAnswers.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunction, tFunctional, Translations } from "@shared/utils/translations.ts"

/**
 * All text displayed text goes into the translation object.
 * Include at least english and german.
 */
const translations: Translations = {
  en: {
    name: "Compute a Huffman-Coding",
    description: "Compute the Huffman-Coding of a given string",
    text: 'Let "*{{0}}*" be {{1}}. What is a correct **Huffman-Coding** of this {{1}} "*{{0}}*"?',
    textTable: `Suppose we have the following table, which represents how often a char appears in a string:
{{0}}
What could be a correct **Huffman-Coding** for each char?`,
    feedbackInvalid: "Can only contain 1 and 0",
    bottomtext:
      "Hints for the Huffman-Code: If you have to choose between nodes with the same weight, " +
      "first choose the one in whose subtree the alphabetically smaller character is contained." +
      " Also choose as the left node, the node with the smaller weight.",
  },
  de: {
    name: "Berechne eine Hufmann-Codierung",
    description: "Bestimme die Huffman-Codierung eines gegebenen Strings",
    text: 'Sei "*{{0}}*" eine {{1}}. Was ist eine korrekte **Huffman-Codierung** dieser {{1}} "*{{0}}*"?',
    textTable: `Angenommen wir habe die folgende Tabelle, welche angebibt, wie oft ein bestimmter Buchstabe in einem String vorkommt:
{{0}}
        Was wäre eine korrekte **Huffman-Codierung** für jeden Buchstaben?`,
    feedbackInvalid: "Darf nur 1 und 0 enthalten",
    bottomtext:
      "Hinweise zum Huffman-Code: Wenn Sie zwischen Knoten mit gleichem Gewicht wählen müssen, " +
      "wählen Sie zuerst jenen, in dessen Teilbaum das alphabetisch kleinste Zeichen enthalten ist." +
      " Wähle zudem als linken Knoten den mit dem kleineren Gewicht.",
  },
}

/**
 * This function generates wrong answers using GenerateWrongsAnswers.ts
 *
 * @param random
 * @param correctAnswer a correct answer for the huffman code
 * @param correctTree a correct tree for the huffman code
 * @param word the word that is encoded
 */
function generateWrongAnswers(
  random: Random,
  correctAnswer: string,
  correctTree: TreeNode,
  word: string,
): Array<string> {
  const correctAnswerLength = correctAnswer.length + 3 // add a factor so not every answer has the same length
  const otherCorrectAnswer = switchAllOneZero(correctAnswer)
  const wrongAnswersStrings: string[] = []
  const w1 = generateRandomWrongAnswer(random, correctAnswer)
  if (wrongAnswersStrings.indexOf(w1) === -1 && w1 !== correctAnswer && w1 !== otherCorrectAnswer) {
    wrongAnswersStrings.push(w1)
  }
  const w2 = generateWrongAnswerSwitchLetters(random, correctTree, word, false).resultWord
  if (wrongAnswersStrings.indexOf(w2) === -1 && w2 !== correctAnswer && w2 !== otherCorrectAnswer) {
    wrongAnswersStrings.push(w2)
  }

  // Only chose one, because they are both quite easy and identical
  const randomUniform = random.uniform()
  if (randomUniform < 0.5) {
    const w3 = generateWrongAnswerShuffleWord(random, word).slice(0, correctAnswerLength + 3)
    if (wrongAnswersStrings.indexOf(w3) === -1 && w3 !== correctAnswer && w3 !== otherCorrectAnswer) {
      wrongAnswersStrings.push(w3)
    }
  } else {
    const w4 = generateWrongAnswerChangeWord(random, word).slice(0, correctAnswerLength + 3)
    if (wrongAnswersStrings.indexOf(w4) === -1 && w4 !== correctAnswer && w4 !== otherCorrectAnswer) {
      wrongAnswersStrings.push(w4)
    }
  }
  // This has a higher difficulty, so when want more of those answers
  for (let i = 0; i < 3; i++) {
    const w5 = generateWrongAnswerReduceCodeOfLetter(word, correctTree).wrongAnswerCoding
    if (wrongAnswersStrings.indexOf(w5) === -1 && w5 !== correctAnswer && w5 !== otherCorrectAnswer) {
      wrongAnswersStrings.push(w5)
    }
    const w6 = generateWrongAnswerFlip01InCodeChar(random, correctTree, word).wrongAnswerCoding
    if (wrongAnswersStrings.indexOf(w6) === -1 && w6 !== correctAnswer && w6 !== otherCorrectAnswer) {
      wrongAnswersStrings.push(w6)
    }
  }

  let subsetSize = 4
  if (wrongAnswersStrings.length < 4) {
    subsetSize = wrongAnswersStrings.length
  }
  return random.subset(wrongAnswersStrings, subsetSize)
}

/**
 * This function generates wrong answers for the table questions
 * @param random
 * @param _inputDict
 * @param correctTree
 */
function generateWrongAnswersDict(
  random: Random,
  _inputDict: { [p: string]: number },
  correctTree: TreeNode,
) {
  const wrongAnswerList = []

  // TODO could be a correct solution, need a check
  wrongAnswerList.push(generateWrongAnswerSwitchLetters(random, correctTree, "", true).huffmanDict)

  // will always be wrong, only check if already in the possible answers
  wrongAnswerList.push(generateWrongAnswerReduceCodeOfLetter("", correctTree).huffmanDict)

  // TODO: can this be a correct solution? Shouldn't or?
  wrongAnswerList.push(generateWrongAnswerFlip01InCodeChar(random, correctTree, "").huffmanDict)

  return wrongAnswerList
}

/**
 * This function switches all zeros and ones, because this will still be a correct Huffman-Coding
 * @param correctWord
 */
export function switchAllOneZero(correctWord: string) {
  const correctWordArray: string[] = correctWord.split("")
  for (let i = 0; i < correctWordArray.length; i++) {
    if (correctWordArray[i] === "1") {
      correctWordArray[i] = "0"
    } else {
      correctWordArray[i] = "1"
    }
  }
  return correctWordArray.join("")
}

/**
 * Creates the table for the markdown
 * @param wordArray the word arrays with frequency of each letter
 */
function convertDictToMdTable(wordArray: { [key: string]: any }) {
  const header = Object.keys(wordArray)
  const middleLine = header.map(() => "-------")
  const content = Object.values(wordArray)
  // create a table format for markdown (numbers are with $$)
  return `
|${header.join("|")}|
|${middleLine.join("|")}|
|$${content.join("$|$")}$|
`
}

export const huffmanCoding: QuestionGenerator = {
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      // Still need to change the choice to choice1 and input to input1
      allowedValues: ["choice", "input"],
    },
  ],

  /**
   * Generates a new question (currently only MultipleChoiceQuestion)
   * @param generatorPath
   * @param lang provided language
   * @param parameters the following options are possible
   *                      - choice-1: this displays are "real" word maximum length of 13 chars, it has a unique coding
   *                                  only the 1 and 0 can be flipped. The goal is to find the correct Huffman Coding
   *                                  of the String
   *                      - input-1:  this has the same base as choice-1, but instead of options, the user has to
   *                                  provide an input
   *                      - choice-2: Here the user does not get a word anymore (instead a table or an array), but
   *                                  here the user has to find the correct coding of the letters and do not concat
   *                                  those
   * @param seed
   */
  generate: (generatorPath, lang, parameters, seed) => {
    // first create a permalink for the question
    const permalink = serializeGeneratorCall({
      generator: huffmanCoding,
      lang,
      parameters,
      seed,
      generatorPath,
    })

    // throw an error if the variant is unknown
    if (!validateParameters(parameters, huffmanCoding.expectedParameters)) {
      throw new Error(
        `Unknown variant ${parameters.variant.toString()}. 
                Valid variants are: ${huffmanCoding.expectedParameters.join(", ")}`,
      )
    }

    /*
        Generate the random word and get the correct answer
         */
    const random = new Random(seed)
    const wordLengths: Array<[number, number]> = [
      [13, 0.25],
      [12, 0.25],
      [11, 0.125],
      [10, 0.125],
      [9, 0.125],
      [8, 0.125],
    ]
    const wordlength = random.weightedChoice(wordLengths)

    const variantParameter = parameters.variant as "choice" | "input"
    let variant: string
    if (variantParameter === "choice") {
      variant = random.choice(["choice", "choice2"])
    } else {
      variant = "input"
    }
    let question: Question
    if (variant === "choice" || variant === "input") {
      let word = generateString(wordlength, random)
      word = random.shuffle(word.split("")).join("")

      const correctAnswerList = huffmanCodingAlgorithm(word)
      const correctAnswer = correctAnswerList["result"]
      const correctTree = correctAnswerList["mainNode"]
      // get a set of obvious wrong answers
      const answers = generateWrongAnswers(random, correctAnswer, correctTree, word)

      answers.push(correctAnswer)
      random.shuffle(answers)
      const correctAnswerIndex = answers.indexOf(correctAnswer)

      const checkFormat: FreeTextFormatFunction = ({ text }) => {
        if (text.trim() === "") return { valid: false }
        try {
          // iterate over each letter to check if either 0 or 1
          for (let i = 0; i < text.length; i++) {
            if (text[i] !== "0" && text[i] !== "1") {
              return {
                valid: false,
                message: tFunction(translations, lang).t("feedbackInvalid"),
              }
            }
          }
        } catch (e) {
          return {
            valid: false,
            message: tFunction(translations, lang).t("feedbackInvalid"),
          }
        }

        // no format error
        return { valid: true, message: text }
      }

      const feedback: FreeTextFeedbackFunction = ({ text }) => {
        // also switch 1 and 0 to keep the correct solution
        const switchedCorrectAnswer = switchAllOneZero(correctAnswer)
        if (text == correctAnswer || text === switchedCorrectAnswer) {
          return {
            correct: true,
            message: "t(feedback.correct)",
          }
        }
        return {
          correct: false,
          message: "t(feedback.incomplete)",
          correctAnswer,
        }
      }

      if (variant === "choice") {
        question = {
          type: "MultipleChoiceQuestion",
          name: huffmanCoding.name(lang),
          path: permalink,
          text: t(translations, lang, "text", [word, "string"]),
          answers: answers,
          feedback: minimalMultipleChoiceFeedback({ correctAnswerIndex }),
        }
      } else {
        question = {
          type: "FreeTextQuestion",
          name: huffmanCoding.name(lang),
          path: permalink,
          text: t(translations, lang, "text", [word, "string"]),
          prompt: `What is a possible Huffman-Coding?`,
          bottomText: t(translations, lang, "bottomtext"),
          feedback,
          checkFormat,
        }
      }

      return {
        question,
      }
    } else {
      // this question is also MultipleChoice, but the user has to find the correct coding of the letters
      // he does not get the word, but instead the number of times a word appears

      const wordArray = generateWordArray(random)
      // only temporary displaying the word array
      const displayTable = convertDictToMdTable(wordArray)
      const correctAnswerTreeNode = huffmanCodingAlgorithm("", wordArray).mainNode
      let correctAnswerDict: { [key: string]: string } = {}
      correctAnswerDict = createHuffmanCoding(correctAnswerDict, correctAnswerTreeNode, "")

      const possibleAnswersTableString: string[] = []
      possibleAnswersTableString.push("\n" + convertDictToMdTable(correctAnswerDict) + "\n")
      generateWrongAnswersDict(random, wordArray, correctAnswerTreeNode).forEach((element) => {
        possibleAnswersTableString.push("\n" + convertDictToMdTable(element) + "\n")
      })

      // shuffle the answers and find the correct index
      random.shuffle(possibleAnswersTableString)
      const correctAnswerIndex = possibleAnswersTableString.indexOf(
        "\n" + convertDictToMdTable(correctAnswerDict) + "\n",
      )

      question = {
        type: "MultipleChoiceQuestion",
        name: huffmanCoding.name(lang),
        path: permalink,
        text: t(translations, lang, "textTable", [displayTable, "frequency-table"]),
        answers: possibleAnswersTableString,
        // maybe add a bottom text
        feedback: minimalMultipleChoiceFeedback({
          correctAnswerIndex: correctAnswerIndex,
        }),
      }

      return {
        question: question,
      }
    }
  },
}
