// todo: refactor this file

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
} from "@shared/question-generators/huffman-coding/generate/GenerateWrongAnswers"
import { HuffmanNode } from "@shared/question-generators/huffman-coding/Huffman"
import { checkProvidedCode, isDictInList } from "@shared/question-generators/huffman-coding/utils/utils"
import Random from "@shared/utils/random"

/**
 * This function generates wrong answers using GenerateWrongsAnswers
 *
 * @param random
 * @param correctAnswer a correct answer for the huffman code
 * @param correctTree a correct tree for the huffman code
 * @param word the word that is encoded
 */
export function generateWrongAnswersWord(
  random: Random,
  correctAnswer: string,
  correctTree: HuffmanNode,
  word: string,
): Array<string> {
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
    const w3 = generateWrongAnswerShuffleWord(random, word).slice(0, correctAnswer.length + 5)
    if (!wrongAnswersStrings.includes(w3) && w3 !== correctAnswer) {
      wrongAnswersStrings.push(w3)
    }
  } else {
    const w4 = generateWrongAnswerChangeWord(random, word).slice(0, correctAnswer.length + 5)
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
export function generateWrongAnswersDict(
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

  // only add those if the list is not full
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
