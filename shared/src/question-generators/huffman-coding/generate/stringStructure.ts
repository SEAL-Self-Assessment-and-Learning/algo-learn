import {
  flip01InCodeChar,
  generateNewLabelSetting,
  generateWrongAnswerChangeWord,
  randomSwitch01,
  reduceCodeOfLetter,
  switchLetters,
} from "@shared/question-generators/huffman-coding/generate/answerOptions"
import { generateString } from "@shared/question-generators/huffman-coding/generate/words"
import {
  getHuffmanCodeOfWord,
  type HuffmanNode,
} from "@shared/question-generators/huffman-coding/Huffman"
import { insertSpaceAfterEveryXChars } from "@shared/question-generators/huffman-coding/utils/utils"
import type Random from "@shared/utils/random"

/**
 * This function generates the foundation for input and choice question
 * It generates a random word and computes a correct answer
 * @param random
 */
export function generateInputChoice1Foundations({ random }: { random: Random }) {
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

  return { correctAnswer, correctTree, word }
}

/**
 * This function generates wrong and correct answers
 *
 * @param random
 * @param correctAnswer a correct answer for the huffman code
 * @param correctTree a correct tree for the huffman code
 * @param word the word that is encoded
 */
export function generatePossibleAnswersChoice1(
  random: Random,
  correctAnswer: string,
  correctTree: HuffmanNode,
  word: string,
): Array<string> {
  const answerSet: Set<string> = new Set<string>()

  while (answerSet.size < 4) {
    answerSet.add(randomSwitch01(random, correctAnswer))
    answerSet.add(switchLetters(random, correctTree, word).resultWord)
    answerSet.add(generateWrongAnswerChangeWord(random, word).slice(0, correctAnswer.length + 5))
    answerSet.add(reduceCodeOfLetter(word, correctTree).wrongAnswerCoding)
    answerSet.add(flip01InCodeChar(random, correctTree, word).wrongAnswerCoding)
    for (let i = 0; i < 2; i++) {
      answerSet.add(generateNewLabelSetting(word, correctTree, random))
    }
  }
  // removing the correct answer from the set, because we are adding it later again
  // this ensures at least one correct answer is in the answer options
  answerSet.delete(correctAnswer)

  return random.subset(Array.from(answerSet), 3)
}

/**
 * This function generates the question (word, answer options, correct answer indices)
 * @param random
 */
export function generateChoice1Question(random: Random) {
  const { correctAnswer, correctTree, word } = generateInputChoice1Foundations({ random })

  const answers = generatePossibleAnswersChoice1(random, correctAnswer, correctTree, word)
  answers.push(correctAnswer)
  random.shuffle(answers)

  const correctAnswerIndexes: number[] = []
  // find all the correct answers and store the indices
  for (let i = 0; i < answers.length; i++) {
    if (correctTree.setLabelsByCodeword(word, answers[i])) correctAnswerIndexes.push(i)
    answers[i] = "`" + insertSpaceAfterEveryXChars(answers[i], 5) + "`"
  }

  return { word, answers, correctAnswerIndexes }
}
