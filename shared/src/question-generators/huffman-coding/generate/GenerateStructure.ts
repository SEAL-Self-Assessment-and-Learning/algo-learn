// todo: refactor this file

import {
  changeFrequenciesRandomly,
  generateWrongAnswerFlip01InCodeChar,
  generateWrongAnswerSwitchLetters,
  swapManyLetters,
  wrongAdditionTree,
} from "@shared/question-generators/huffman-coding/generate/GenerateChoiceAnswers.ts"
import { HuffmanNode } from "@shared/question-generators/huffman-coding/Huffman"
import { checkProvidedCode, isDictInList } from "@shared/question-generators/huffman-coding/utils/utils"
import Random from "@shared/utils/random"

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
    const w6 = generateWrongAnswerSwitchLetters(random, correctTree, "").huffmanDict
    if (!isDictInList(w6, wrongAnswerList) && !checkProvidedCode(inputDict, correctAnswer, w6)) {
      wrongAnswerList.push(w6)
    }
  }

  const size = wrongAnswerList.length
  const subSetSize = Math.min(3, size)
  return random.subset(wrongAnswerList, subSetSize)
}
