import {
  createHuffmanCoding,
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
  const flipPositions = random.subset(Array.from({length: correctAnswer.length}, (_, i) => i), random.int(1, 5))

  for (let i = 0; i < flipPositions.length / 2; i++) {
    if (wrongAnswer[flipPositions[i]] === "0") {
      wrongAnswer[flipPositions[i]] = "1"
    } else {
      wrongAnswer[flipPositions[i]] = "0"
    }
  }
  console.log(correctAnswer, wrongAnswer.join(""))
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
  const randomKeys = random.subset(keySet, 2);
  [huffmanDict[randomKeys[0]], huffmanDict[randomKeys[1]]] = [
    huffmanDict[randomKeys[1]], huffmanDict[randomKeys[0]],
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

export function createHuffmanCodingBitError(
    huffmanCode: { [key: string]: string },
    node: TreeNode,
    code: string,
    random: Random,
) {
  const firstValue = random.int(0, 1)
  const secondValue = 1 - firstValue
  if (node.left) {
    huffmanCode = createHuffmanCodingBitError(
        huffmanCode,
        node.left,
        code + firstValue.toString(),
        random,
    )
  }
  if (node.right) {
    huffmanCode = createHuffmanCodingBitError(
        huffmanCode,
        node.right,
        code + secondValue.toString(),
        random,
    )
  }
  if (node.value.length === 1) {
    huffmanCode[node.value] = code
  }
  return huffmanCode
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
  const currentLongestKey = huffmanDictKey.currentLongestKey
  huffmanDict[currentLongestKey] = huffmanDict[currentLongestKey].slice(
    0,
    huffmanDict[currentLongestKey].length - 1,
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
  const currentLongestKey = huffmanDictKey.currentLongestKey
  // flip a 0 or 1 in the longest key
  const randomIndex = random.int(0, huffmanDict[currentLongestKey].length - 1)
  const newChar =
    huffmanDict[currentLongestKey][randomIndex] === "0" ? "1" : "0"
  huffmanDict[currentLongestKey] =
    huffmanDict[currentLongestKey].slice(0, randomIndex) +
    newChar +
    huffmanDict[currentLongestKey].slice(randomIndex + 1)
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
  let currentLongestKey: string = ""
  for (const current_key in huffmanDict) {
    if (currentLongestKey === "") {
      currentLongestKey = current_key
      continue
    }
    if (
      huffmanDict[current_key].length > huffmanDict[currentLongestKey].length
    ) {
      currentLongestKey = current_key
    }
  }
  return { huffmanDict, currentLongestKey: currentLongestKey }
}

/*
Maybe add more difficult wrong answers, but I don't have any idea at the moment

- Maybe another wrong answer where the code is too short at the end

*/
