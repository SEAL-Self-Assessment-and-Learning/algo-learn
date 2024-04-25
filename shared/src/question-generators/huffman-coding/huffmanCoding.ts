import { min } from "mathjs"
import {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  minimalMultipleChoiceFeedback,
  Question,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import {
  checkProvidedCode,
  createHuffmanCoding,
  huffmanCodingAlgorithm,
  TreeNode,
} from "@shared/question-generators/huffman-coding/Algorithm.ts"
import {
  generateString,
  generateWordArray,
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
import Random from "@shared/utils/random.ts"
import { t, tFunction, tFunctional, Translations } from "@shared/utils/translations.ts"
import { validateParameters } from "../../api/Parameters.ts"

/**
 * All text displayed text goes into the translation object.
 * Include at least english and german.
 */
const translations: Translations = {
  en: {
    name: "Compute a Huffman-Coding",
    description: "Compute the Huffman-Coding of a given string",
    text: 'Let "*{{0}}*" be {{1}}. What is a correct **Huffman-Coding** of this {{1}}? Please do not consider the spaces.',
    prompt: "What is a possible Huffman-Coding?",
    textTable: `Suppose we have the following table, which represents how often each character appears in a given string:
{{0}}
What could be a correct **Huffman-Coding** for each char?`,
    feedbackInvalid: "Please only use the characters 0 and 1.",
    bottomtext:
      "Hints for the Huffman-Code: If you have to choose between nodes with the same weight, " +
      "first choose the one in whose subtree the alphabetically smaller character is contained." +
      " Also choose as the left node, the node with the smaller weight.",
    multiInputText: `Suppose we have the following table, which represents how often each character appears in a given string:
{{0}}
What could be a correct **Huffman-Coding** for each character?
{{1}}`,
  },

  de: {
    name: "Berechne eine Hufmann-Codierung",
    description: "Bestimme die Huffman-Codierung eines gegebenen Strings",
    text: 'Sei "*{{0}}*" ein {{1}}. Was ist eine korrekte **Huffman-Codierung** für diesen {{1}}? Bitte ignorieren Sie die Leerzeichen.',
    prompt: "Was ist eine mögliche Huffman-Codierung?",
    textTable: `Angenommen wir habe die folgende Tabelle, welche angebibt, wie oft jeder Buchstabe in einem gegebenen String vorkommt:
{{0}}
        Was wäre eine korrekte **Huffman-Codierung** für jeden Buchstaben?`,
    feedbackInvalid: "Bitte verwenden Sie nur die Zeichen 0 und 1.",
    bottomtext:
      "Hinweise zum Huffman-Code: Wenn Sie zwischen Knoten mit gleichem Gewicht wählen müssen, " +
      "wählen Sie zuerst jenen, in dessen Teilbaum das alphabetisch kleinste Zeichen enthalten ist." +
      " Wähle zudem als linken Knoten den mit dem kleineren Gewicht.",
    multiInputText: `Suppose we have the following table, which represents how oftne a char appears in a string:
{{0}}
What could be a correct **Huffman-Coding** for each char?`,
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
  const otherCorrectAnswer = switchAllOneZeroString(correctAnswer)
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
 * Maybe optimize the wrong answer generation later (but I don't have any idea at the moment)
 * @param random
 * @param inputDict
 * @param correctTree
 */
function generateWrongAnswersDict(
  random: Random,
  inputDict: { [p: string]: number },
  correctTree: TreeNode,
) {
  // List of correct answers
  const correctAnswer = createHuffmanCoding({}, correctTree, "")

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
  const subSetSize = min(3, size)
  return random.subset(wrongAnswerList, subSetSize)
}

/**
 * Function to check if two dictionaries are equal
 * @param dict1
 * @param dict2
 */
function isDictEqual(dict1: { [key: string]: any }, dict2: { [key: string]: any }): boolean {
  const keys1 = Object.keys(dict1)
  const keys2 = Object.keys(dict2)

  if (keys1.length !== keys2.length) {
    return false
  }

  for (const key of keys1) {
    if (dict1[key] !== dict2[key]) {
      return false
    }
  }

  return true
}

/**
 * Function to check if a dict is already in a list of dictionaries
 * @param dict
 * @param listDict
 */
function isDictInList(dict: { [key: string]: any }, listDict: { [key: string]: any }[]): boolean {
  for (const item of listDict) {
    if (isDictEqual(dict, item)) {
      return true
    }
  }
  return false
}

/**
 * This function switches all zeros and ones, because this will still be a correct Huffman-Coding
 * @param correctWord
 */
export function switchAllOneZeroString(correctWord: string) {
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
 * @param extraFeature
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
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
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
      return {
        valid: true,
      }
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
      variant = random.choice(["input", "input2"])
    }
    let question: Question
    if (variant === "choice" || variant === "input") {
      let word = generateString(wordlength, random)
      word = random.shuffle(word.split("")).join("")

      const correctAnswerList = huffmanCodingAlgorithm(word)
      const correctAnswer = correctAnswerList.result
      const correctTree = correctAnswerList.mainNode
      // get a set of obvious wrong answers
      const answers = generateWrongAnswers(random, correctAnswer, correctTree, word)

      answers.push(correctAnswer)
      random.shuffle(answers)
      const correctAnswerIndex = answers.indexOf(correctAnswer)

      const feedback: FreeTextFeedbackFunction = ({ text }) => {
        // also switch 1 and 0 to keep the correct solution
        const switchedCorrectAnswer = switchAllOneZeroString(correctAnswer)
        if (text == correctAnswer || text === switchedCorrectAnswer) {
          return {
            correct: true,
            message: tFunction(translations, lang).t("feedback.correct"),
          }
        }
        return {
          correct: false,
          message: tFunction(translations, lang).t("feedback.incomplete"),
          correctAnswer,
        }
      }

      // add a space after every 3rd letter
      word = word.match(/.{1,3}/g)?.join(" ") || word

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
          text: t(translations, lang, "text", [word, "String"]),
          bottomText: t(translations, lang, "bottomtext"),
          feedback,
          checkFormat,
        }
      }

      return {
        question,
      }
      // else of choice2 or input2
    } else {
      // this question is also MultipleChoice, but the user has to find the correct coding of the letters
      // he does not get the word, but instead the number of times a word appears

      const differentLetters = random.int(8, 11)
      const wordArray = generateWordArray(differentLetters, random)
      // only temporary displaying the word array
      // add some spacing to table in the question text using extra feature div_my-5
      const displayTable = convertDictToMdTable(wordArray, "#div_my-5#")
      const correctAnswerTreeNode = huffmanCodingAlgorithm("", wordArray).mainNode
      const correctAnswerDict: { [key: string]: string } = createHuffmanCoding(
        {},
        correctAnswerTreeNode,
        "",
      )
      console.log(correctAnswerDict)

      if (variant === "choice2") {
        const possibleAnswersTableString: string[] = []
        possibleAnswersTableString.push("\n" + convertDictToMdTable(correctAnswerDict, "#sd#") + "\n")
        generateWrongAnswersDict(random, wordArray, correctAnswerTreeNode).forEach((element) => {
          possibleAnswersTableString.push("\n" + convertDictToMdTable(element, "#sd#") + "\n")
        })

        // shuffle the answers and find the correct index
        random.shuffle(possibleAnswersTableString)
        const correctAnswerIndex = possibleAnswersTableString.indexOf(
          "\n" + convertDictToMdTable(correctAnswerDict, "#sd#") + "\n",
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
      } else {
        let inputFields = ""
        const fieldIDCharMap: { [key: string]: string } = {}
        // iterate through the wordArray
        let i = 0
        for (const key in wordArray) {
          const fieldID = `index-${i}` // this is the unique ID for the input field
          fieldIDCharMap[fieldID] = key
          inputFields += "|{{" + fieldID + "#TL#" + key + ": ##overlay}}"
          if (i % 2 == 1) {
            inputFields += "|\n"
          }
          i++
        }
        inputFields += "|\n|#border_none?table_w-full#||"

        console.log(inputFields)

        const feedback: FreeTextFeedbackFunction = ({ text }) => {
          // text is a provided using JSON.stringify, so we need to revert this
          let textDict: unknown
          try {
            textDict = JSON.parse(text)
          } catch (error) {
            console.error("Invalid JSON:", text)
            return {
              correct: false,
              message: tFunction(translations, lang).t("feedback.incomplete"),
              correctAnswer: "The answer is not a valid JSON",
            }
          }
          function isStringDict(obj: unknown): obj is { [key: string]: string } {
            if (typeof obj !== "object" || obj === null) return false
            for (const key in obj) {
              if (typeof (obj as any)[key] !== "string") {
                return false
              }
            }
            return true
          }

          if (!isStringDict(textDict)) {
            throw new Error("There has been a parse error, parsing text to {[key: string]: string}")
          }

          for (const key in textDict) {
            const charKey = fieldIDCharMap[key]
            if (textDict[key] !== correctAnswerDict[charKey]) {
              return {
                correct: false,
                message: tFunction(translations, lang).t("feedback.incomplete"),
                correctAnswer: "This would be the correct answer",
              }
            }
          }
          return {
            correct: true,
            message: tFunction(translations, lang).t("feedback.correct"),
          }
        }

        question = {
          type: "MultiFreeTextQuestion",
          name: huffmanCoding.name(lang),
          path: permalink,
          fillOutAll: true,
          text: t(translations, lang, "multiInputText", [displayTable, inputFields]),
          feedback,
          checkFormat,
        }

        return {
          question: question,
        }
      }
    }
  },
}
