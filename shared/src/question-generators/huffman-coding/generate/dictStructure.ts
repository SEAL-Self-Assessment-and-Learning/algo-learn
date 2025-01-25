import {
  changeFrequenciesRandomly,
  flip01InCodeChar,
  swapManyLetters,
  switchLetters,
  wrongAdditionTree,
} from "@shared/question-generators/huffman-coding/generate/answerOptions"
import type { HuffmanNode } from "@shared/question-generators/huffman-coding/Huffman"
import {
  checkProvidedCode,
  convertDictToMdTable,
} from "@shared/question-generators/huffman-coding/utils/utils"
import type Random from "@shared/utils/random"

/**
 * This function sorts a possible answer into the correct or wrong answer list
 * @param optionDict - the dictionary of the option (either correct or wrong)
 * @param inputDict - the dictionary of the input
 * @param correctTree - the correct tree
 * @param correctAnswerSet
 * @param wrongAnswerSet
 */
export function categorizeAnswerOption({
  optionDict,
  inputDict,
  correctTree,
  correctAnswerSet,
  wrongAnswerSet,
}: {
  optionDict: { [key: string]: string }
  inputDict: { [p: string]: number }
  correctTree: HuffmanNode
  correctAnswerSet: Set<string>
  wrongAnswerSet: Set<string>
}) {
  const encodingTable = correctTree.getEncodingTable()
  const optionMdTable = convertDictToMdTable(optionDict)

  if (checkProvidedCode(inputDict, encodingTable, optionDict)) {
    correctAnswerSet.add(optionMdTable)
  } else {
    wrongAnswerSet.add(optionMdTable)
  }
}

/**
 * This function generates random answers for the table questions
 * @param random
 * @param inputDict
 * @param correctTree
 */
export function generatePossibleAnswersChoice2(
  random: Random,
  inputDict: { [p: string]: number },
  correctTree: HuffmanNode,
) {
  // List of correct answers
  const wrongAnswerSet: Set<string> = new Set<string>()
  const correctAnswerSet: Set<string> = new Set<string>()
  correctAnswerSet.add(convertDictToMdTable(correctTree.getEncodingTable()))

  const inputAndCorrectData = {
    inputDict,
    correctTree,
    correctAnswerSet,
    wrongAnswerSet,
  }

  while (wrongAnswerSet.size + correctAnswerSet.size < 4) {
    // Generate and evaluate categorize options into correct and wrong answers
    categorizeAnswerOption({
      optionDict: changeFrequenciesRandomly(random, inputDict),
      ...inputAndCorrectData,
    })
    categorizeAnswerOption({ optionDict: wrongAdditionTree(random, inputDict), ...inputAndCorrectData })
    categorizeAnswerOption({ optionDict: swapManyLetters(inputDict), ...inputAndCorrectData })
    categorizeAnswerOption({
      optionDict: flip01InCodeChar(random, correctTree, "").huffmanDict,
      ...inputAndCorrectData,
    })
    categorizeAnswerOption({
      optionDict: switchLetters(random, correctTree, "").huffmanDict,
      ...inputAndCorrectData,
    })
  }

  const { answers, correctAnswerIndices } = combineAndShuffleAnswers(
    correctAnswerSet,
    wrongAnswerSet,
    random,
  )

  return { answers, correctAnswerIndices }
}

/**
 * This function creates the answer options for the multiple choice question
 * Using correct and wrong answers, shuffling them and returning a list of both (at least one correct answer)
 * Also returns the indices of the correct answers
 * @param correctAnswerList
 * @param wrongAnswerList
 * @param random
 */
function combineAndShuffleAnswers(
  correctAnswerList: Set<string>,
  wrongAnswerList: Set<string>,
  random: Random,
) {
  const correctAnswers = Array.from(correctAnswerList)
  const wrongAnswers = Array.from(wrongAnswerList)

  const answers: string[] = random.subset(
    correctAnswers,
    random.int(1, correctAnswers.length < 3 ? correctAnswers.length : 3),
  )
  answers.push(...random.subset(wrongAnswers, 4 - answers.length))
  random.shuffle(answers)

  // get the indices of the correct answers inside answers
  const correctAnswerIndices: number[] = []
  for (let i = 0; i < answers.length; i++) {
    if (correctAnswers.includes(answers[i])) {
      correctAnswerIndices.push(i)
    }
  }
  return { answers, correctAnswerIndices }
}
