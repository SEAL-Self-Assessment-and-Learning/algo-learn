// TODO: check if the table could be to wide to be represented as possible answer

import {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  minimalMultipleChoiceFeedback,
  Question,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import {
  generateCharacterFrequencyTable,
  generateString,
} from "@shared/question-generators/huffman-coding/GenerateWords.ts"
import {
  changeFrequenciesRandomly,
  generateRandomWrongAnswer,
  generateWrongAnswerChangeWord,
  generateWrongAnswerFlip01InCodeChar,
  generateWrongAnswerReduceCodeOfLetter,
  generateWrongAnswerShuffleWord,
  generateWrongAnswerSwitchLetters,
  swapManyLetters,
  wrongAdditionTree,
} from "@shared/question-generators/huffman-coding/GenerateWrongAnswers.ts"
import {
  checkProvidedCode,
  getHuffmanCodeOfTable,
  getHuffmanCodeOfWord,
  HuffmanNode,
} from "@shared/question-generators/huffman-coding/Huffman.ts"
import { _ } from "@shared/utils/generics.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, Translations } from "@shared/utils/translations.ts"

/**
 * All text displayed text goes into the translation object.
 * Include at least english and german.
 */
const translations: Translations = {
  en: {
    name: "Huffman-Coding",
    description: "Compute the Huffman-Coding of a given string",
    text: "What is a correct **Huffman encoding** of the string `{{0}}`?",
    textChoice: "What are correct **Huffman encodings** of the string `{{0}}`?",
    prompt: "What is a possible Huffman-Coding?",
    textTable: `Suppose we have the following table, which represents how often each character appears in a given string:
{{0}}
What could be a correct **Huffman-Coding** for each char?`,
    feedbackInvalid: "Can only contain 1 and 0",
  },
  de: {
    name: "Hufmann-Codierung",
    description: "Bestimme die Huffman-Codierung eines gegebenen Strings",
    text: 'Was ist eine korrekte **Huffman-Kodierung** für den String "*{{0}}*"?',
    textChoice: 'Was sind korrekte **Huffman-Kodierungen** für den String "*{{0}}*"?',
    prompt: "Was ist eine mögliche Huffman-Kodierung?",
    textTable: `Angenommen wir habe die folgende Tabelle, welche angibt, wie oft jeder Buchstabe in einem gegebenen String vorkommt:
{{0}}
        Was wäre eine korrekte **Huffman-Codierung** für jeden Buchstaben?`,
    feedbackInvalid: "Darf nur 1 und 0 enthalten",
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
// todo the name suggests it should live in the GenerateWrongAnswers file.
function generateWrongAnswers(
  random: Random,
  correctAnswer: string,
  correctTree: HuffmanNode,
  word: string,
): Array<string> {
  // todo correctAnswerLength has not the correct answer length. better name? remove completely?
  const correctAnswerLength = correctAnswer.length + 3 // add a factor so not every answer has the same length
  const wrongAnswersStrings: string[] = []
  const w1 = generateRandomWrongAnswer(random, correctAnswer)
  if (!wrongAnswersStrings.includes(w1) && w1 !== correctAnswer) {
    wrongAnswersStrings.push(w1)
  }

  const w2 = generateWrongAnswerSwitchLetters(random, correctTree, word, false).resultWord
  if (!wrongAnswersStrings.includes(w2) && w2 !== correctAnswer) {
    wrongAnswersStrings.push(w2)
  }

  // Only chose one, because they are both quite easy and identical
  if (random.bool()) {
    // todo here is correctAnswerLength used and it has for some reason again + 3?
    const w3 = generateWrongAnswerShuffleWord(random, word).slice(0, correctAnswerLength + 3)
    if (!wrongAnswersStrings.includes(w3) && w3 !== correctAnswer) {
      wrongAnswersStrings.push(w3)
    }
  } else {
    // todo here is correctAnswerLength used and it has for some reason again + 3?
    const w4 = generateWrongAnswerChangeWord(random, word).slice(0, correctAnswerLength + 3)
    if (!wrongAnswersStrings.includes(w4) && w4 !== correctAnswer) {
      wrongAnswersStrings.push(w4)
    }
  }

  // This has a higher difficulty, so when want more of those answers
  for (let i = 0; i < 3; i++) {
    const w5 = generateWrongAnswerReduceCodeOfLetter(word, correctTree).wrongAnswerCoding
    if (!wrongAnswersStrings.includes(w5) && w5 !== correctAnswer) {
      wrongAnswersStrings.push(w5)
    }
    const w6 = generateWrongAnswerFlip01InCodeChar(random, correctTree, word).wrongAnswerCoding
    if (!wrongAnswersStrings.includes(w6) && w6 !== correctAnswer) {
      wrongAnswersStrings.push(w6)
    }
  }

  let subsetSize = 3
  if (wrongAnswersStrings.length < subsetSize) {
    subsetSize = wrongAnswersStrings.length
  }

  return random.subset(wrongAnswersStrings, subsetSize)
}

/**
 * This function generates wrong answers for the table questions
 * Maybe optimize the wrong answer generation later (but I don't have any idea at the moment)
 * @param random
 * @param inputDict
 * @param correctTree
 */
// todo the name suggests it should live in the GenerateWrongAnswers file.
function generateWrongAnswersDict(
  random: Random,
  inputDict: { [p: string]: number },
  correctTree: HuffmanNode,
) {
  // List of correct answers
  const correctAnswer = correctTree.getEncodingTable()

  const wrongAnswerList: { [key: string]: string }[] = []

  for (let i = 0; i < 5; i++) {
    const w2 = changeFrequenciesRandomly(random, inputDict)
    if (!isDictInList(w2, wrongAnswerList) && !checkProvidedCode(inputDict, correctAnswer, w2)) {
      wrongAnswerList.push(w2)
    }
  }

  for (let i = 0; i < 5; i++) {
    const w3 = wrongAdditionTree(random, inputDict)
    if (!isDictInList(w3, wrongAnswerList) && !checkProvidedCode(inputDict, correctAnswer, w3)) {
      wrongAnswerList.push(w3)
    }
  }

  // only add this if the list is not full
  if (wrongAnswerList.length < 3) {
    // sometimes this does not generate any wrong answer
    const w4 = swapManyLetters(inputDict)
    if (!isDictInList(w4, wrongAnswerList) && !checkProvidedCode(inputDict, correctAnswer, w4)) {
      wrongAnswerList.push(w4)
    }
    const w5 = generateWrongAnswerFlip01InCodeChar(random, correctTree, "").huffmanDict
    if (!isDictInList(w5, wrongAnswerList) && !checkProvidedCode(inputDict, correctAnswer, w5)) {
      wrongAnswerList.push(w5)
    }
    const w6 = generateWrongAnswerSwitchLetters(random, correctTree, "", true).huffmanDict
    if (!isDictInList(w6, wrongAnswerList) && !checkProvidedCode(inputDict, correctAnswer, w6)) {
      wrongAnswerList.push(w6)
    }
  }

  const size = wrongAnswerList.length
  const subSetSize = Math.min(3, size)
  return random.subset(wrongAnswerList, subSetSize)
}

/**
 * Function to check if a dict is already in a list of dictionaries
 * @param dict
 * @param listDict
 */
function isDictInList(dict: { [key: string]: any }, listDict: { [key: string]: any }[]): boolean {
  for (const item of listDict) {
    if (_.isEqual(dict, item)) {
      return true
    }
  }

  return false
}

/**
 * Creates the table for the markdown
 * @param wordArray the word arrays with frequency of each letter
 * @param extraFeature todo
 */
function convertDictToMdTable(wordArray: { [key: string]: any }, extraFeature: string = "none") {
  const header = Object.keys(wordArray)
  const middleLine = header.map(() => "-------")
  const content = Object.values(wordArray)
  // create a table format for markdown (numbers are with $$)
  const returnValue = `
|${header.join("|")}|
|${middleLine.join("|")}|
|$${content.join("$|$")}$|
`
  if (extraFeature !== "none") {
    const extraFeatureLine = header.map(() => extraFeature)
    return returnValue + `|${extraFeatureLine.join("|")}|`
  }
  return returnValue
}

export const huffmanCoding: QuestionGenerator = {
  id: "huffman",
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
   * @param lang provided language
   * @param parameters the following options are possible
   *                      - choice-1: this displays a "real" word with at most 13 chars, it has a unique coding
   *                                  only the 1 and 0 can be flipped. The goal is to find the correct Huffman Coding
   *                                  of the String
   *                      - input-1:  this has the same base as choice-1, but instead of options, the user has to
   *                                  provide an input
   *                      - choice-2: Here the user does not get a word anymore (instead a table or an array), but
   *                                  here the user has to find the correct coding of the letters and do not concat
   *                                  those
   * @param seed
   */
  // todo separate into multiple function, one for each variant (choice, choice2, input, input2)
  //  currently choice and input questions are generated both and only one is returned.
  generate: (lang, parameters, seed) => {
    // first create a permalink for the question
    const permalink = serializeGeneratorCall({
      generator: huffmanCoding,
      lang,
      parameters,
      seed,
    })

    // Generate the random word and get the correct answer
    const random = new Random(seed)

    const variantParameter = parameters.variant as "choice" | "input"
    let variant: string
    if (variantParameter === "choice") {
      variant = random.choice(["choice", "choice2"])
    } else {
      variant = random.choice(["input"])
    }

    let question: Question
    if (variant === "choice" || variant === "input") {
      const wordLength = random.weightedChoice([
        [13, 0.25],
        [12, 0.25],
        [11, 0.125],
        [10, 0.125],
        [9, 0.125],
        [8, 0.125],
      ])

      let word = generateString(wordLength, random)
      word = random.shuffle(word.split("")).join("")

      const { encodedWord: correctAnswer, huffmanTree: correctTree } = getHuffmanCodeOfWord(word)

      // get a set of obvious wrong answers
      const answers = generateWrongAnswers(random, correctAnswer, correctTree, word)

      answers.push(correctAnswer)
      // add second correct answer
      correctTree.setNewLabels(random)
      answers.push(correctTree.encode(word))
      random.shuffle(answers)
      const correctAnswerIndexes = []
      // find all correct answers. maybe some of the wrong answers are correct by accident
      for (let i = 0; i < answers.length; i++) {
        if (correctTree.setLabelsByCodeword(word, answers[i])) correctAnswerIndexes.push(i)
      }

      const checkFormat: FreeTextFormatFunction = ({ text }) => {
        if (text.trim() === "") return { valid: false }
        try {
          // iterate over each letter to check if either 0 or 1
          for (let i = 0; i < text.length; i++) {
            if (text[i] !== "0" && text[i] !== "1") {
              return {
                valid: false,
                message: t(translations, lang, "feedbackInvalid"),
              }
            }
          }
        } catch (e) {
          // todo what is this catching? nothing in the try block seems to be able to throw
          return {
            valid: false,
            message: t(translations, lang, "feedbackInvalid"),
          }
        }

        // no format error
        return { valid: true, message: "\u2713" }
      }

      const feedback: FreeTextFeedbackFunction = ({ text: codeword }) => {
        const valid = correctTree.setLabelsByCodeword(word, codeword)

        if (valid) {
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
          allowMultiple: true,
          text: t(translations, lang, "textChoice", [word]),
          answers: answers,
          feedback: minimalMultipleChoiceFeedback({ correctAnswerIndex: correctAnswerIndexes }),
        }
      } else {
        question = {
          type: "FreeTextQuestion",
          name: huffmanCoding.name(lang),
          path: permalink,
          text: t(translations, lang, "text", [word]),
          feedback,
          checkFormat,
        }
      }

      return {
        question,
      }
      // else of choice2 or input2
    } else {
      // TODO: for input2 missing: - feedback and checkFormat functions

      // this question is also MultipleChoice, but the user has to find the correct coding of the letters
      // he does not get the word, but instead the number of times a word appears
      const numDifferentCharacters = random.int(8, 11)
      const characterFrequencies = generateCharacterFrequencyTable(numDifferentCharacters, random)
      // only temporary displaying the word array
      // add some spacing to table in the question text using extra feature div_my-5
      const displayTable = convertDictToMdTable(characterFrequencies, "#div_my-5#")
      const correctAnswerTreeNode = getHuffmanCodeOfTable(characterFrequencies)
      const correctAnswerDict = correctAnswerTreeNode.getEncodingTable()

      const possibleAnswersTableString: string[] = []
      possibleAnswersTableString.push("\n" + convertDictToMdTable(correctAnswerDict) + "\n")
      generateWrongAnswersDict(random, characterFrequencies, correctAnswerTreeNode).forEach(
        (element) => {
          possibleAnswersTableString.push("\n" + convertDictToMdTable(element) + "\n")
        },
      )

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
