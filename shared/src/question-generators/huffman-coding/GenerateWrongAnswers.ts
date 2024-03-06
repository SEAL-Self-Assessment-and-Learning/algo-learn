import {
  createHuffmanCoding,
  createHuffmanCodingBitError,
  huffmanCodingAlgorithm,
  TreeNode,
} from "@shared/question-generators/huffman-coding/Algorithm.ts"
import Random from "@shared/utils/random.ts"

/**
 * This function generates a new random word by switching some random 1 to 0 and 0 to 1
 * Not this high difficulty, because it is quite obvious to find the error
 * @Difficulty Easy
 * @param random
 * @param correctAnswer
 */
export function generateRandomWrongAnswer(
  random: Random,
  correctAnswer: string,
) {
  const wrongAnswer = correctAnswer.split("")
  while (wrongAnswer.join("") === correctAnswer) {
    for (let i = 0; i < correctAnswer.length / 2; i++) {
      const randomChangedIndex = random.int(0, correctAnswer.length - 1)
      if (wrongAnswer[randomChangedIndex] === "0") {
        wrongAnswer[randomChangedIndex] = "1"
      } else {
        wrongAnswer[randomChangedIndex] = "0"
      }
    }
  }
  return wrongAnswer.join("")
}

/**
 * This function generates a new random word by switching the coding of two random letters
 * And cutting the new coding of the whole word to match the length of the coding of the correct answer
 * @Difficulty Easy
 * @param random
 * @param currentTree
 * @param word
 */
export function generateWrongAnswerSwitchLetters(
  random: Random,
  currentTree: TreeNode,
  word: string,
) {
  const huffmanDict: { [key: string]: string } = createHuffmanCoding(
    {},
    currentTree,
    "",
  )
  const keySet: string[] = Object.keys(huffmanDict)
  const [randomKey1, randomKey2] = keySet
    .sort(() => random.uniform() - 0.5)
    .slice(0, 2)
  ;[huffmanDict[randomKey1], huffmanDict[randomKey2]] = [
    huffmanDict[randomKey2],
    huffmanDict[randomKey1],
  ]
  const resultWord: string = word
    .split("")
    .map((char) => huffmanDict[char])
    .join("")
  // crop the result word to the same length as the correct answer
  resultWord.slice(0, word.length - 1)
  return resultWord
}

/**
 * This function generates a new random word by shuffling the letters of the word
 * Then coding the new word, it will have the same length as the correct answer
 * Because coding of the words is the same as the word itself
 * @Difficulty Easy
 * @param random
 * @param word
 */
export function generateWrongAnswerShuffleWord(random: Random, word: string) {
  const wrongAnswer = random.shuffle(word.split("")).join("")
  return huffmanCodingAlgorithm(wrongAnswer, 0)["result"]
}

/**
 * This function generates a new random word by changing a random letter to another random letter
 * The new word coding could be a little longer or shorter than the correct answer
 * @Difficulty Easy
 * @param random
 * @param word
 */
export function generateWrongAnswerChangeWord(random: Random, word: string) {
  const wordArray = word.split("")
  const randomIndex = random.int(0, word.length - 1)
  let randomIndex2 = random.int(0, word.length - 1)
  while (randomIndex === randomIndex2) {
    randomIndex2 = random.int(0, word.length - 1)
  }
  wordArray[randomIndex] = word[randomIndex2]
  return huffmanCodingAlgorithm(wordArray.join(""), 0)["result"]
}

/**
 * We use another function and build the random, sometimes left is 0 and sometime 1
 * So we don't have a prefix free code
 * TODO is this really a wrong answer? Because it will still be a minimal prefix free code, but not correctly
 *      implemented huffman code
 *      I took this question out, but I will leave it here for now, maybe we can use it for priority queue
 *      You could still decode the word
 * @Difficulty Medium
 * @param random
 * @param word
 * @param currentTree
 */
export function generateWrongAnswerFalseTreeConstrution(
  random: Random,
  word: string,
  currentTree: TreeNode,
) {
  let wrongHuffmanDict: { [key: string]: string } = {}
  wrongHuffmanDict = createHuffmanCodingBitError(
    wrongHuffmanDict,
    currentTree,
    "",
    random,
  )
  // create the word based on the wrong coding
  let wrongAnswerCoding = ""
  for (let i = 0; i < word.length; i++) {
    wrongAnswerCoding += wrongHuffmanDict[word[i]]
  }
  return wrongAnswerCoding
}

/**
 * Function to generate a wrong code, it takes the longest code and reduces the length by 1 (deleting the last char)
 * @Difficulty Medium
 * @param word
 * @param currentTree
 */
export function generateWrongAnswerReduceCodeOfLetter(
  word: string,
  currentTree: TreeNode,
) {
  const huffmanDictKey = createHuffmanDict(currentTree)
  const huffmanDict = huffmanDictKey.huffmanDict
  const current_longest_key = huffmanDictKey.current_longest_key
  huffmanDict[current_longest_key] = huffmanDict[current_longest_key].slice(
    0,
    huffmanDict[current_longest_key].length - 1,
  )
  let wrongAnswerCoding = ""
  for (let i = 0; i < word.length; i++) {
    wrongAnswerCoding += huffmanDict[word[i]]
  }
  return wrongAnswerCoding
}

export function generateWrongAnswerFlip01InCodeChar(
  random: Random,
  currentTree: TreeNode,
  word: string,
) {
  const huffmanDictKey = createHuffmanDict(currentTree)
  const huffmanDict = huffmanDictKey.huffmanDict
  const current_longest_key = huffmanDictKey.current_longest_key
  // flip a 0 or 1 in the longest key
  const randomIndex = random.int(0, huffmanDict[current_longest_key].length - 1)
  const newChar =
    huffmanDict[current_longest_key][randomIndex] === "0" ? "1" : "0"
  huffmanDict[current_longest_key] =
    huffmanDict[current_longest_key].slice(0, randomIndex) +
    newChar +
    huffmanDict[current_longest_key].slice(randomIndex + 1)
  let wrongAnswerCoding = ""
  for (let i = 0; i < word.length; i++) {
    wrongAnswerCoding += huffmanDict[word[i]]
  }
  return wrongAnswerCoding
}

function createHuffmanDict(currentTree: TreeNode) {
  let huffmanDict: { [key: string]: string } = {}
  huffmanDict = createHuffmanCoding(huffmanDict, currentTree, "")
  // get the key with the longest value
  let current_longest_key: string = ""
  for (const current_key in huffmanDict) {
    if (current_longest_key === "") {
      current_longest_key = current_key
      continue
    }
    if (
      huffmanDict[current_key].length > huffmanDict[current_longest_key].length
    ) {
      current_longest_key = current_key
    }
  }
  return { huffmanDict, current_longest_key }
}

/*
Maybe add more difficult wrong answers, but I don't have any idea at the moment

- Maybe another wrong answer where the code is too short at the end

*/
