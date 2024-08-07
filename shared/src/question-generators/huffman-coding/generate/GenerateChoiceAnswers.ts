// TODO refactor this file

import {
  getHuffmanCodeOfTable,
  getHuffmanCodeOfWord,
  HuffmanNode,
} from "@shared/question-generators/huffman-coding/Huffman.ts"
import Random from "@shared/utils/random.ts"

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

  answerSet.add(generateRandomWrongAnswer(random, correctAnswer))
  answerSet.add(generateWrongAnswerSwitchLetters(random, correctTree, word).resultWord)
  answerSet.add(generateWrongAnswerChangeWord(random, word).slice(0, correctAnswer.length + 5))
  answerSet.add(generateWrongAnswerReduceCodeOfLetter(word, correctTree).wrongAnswerCoding)
  answerSet.add(generateWrongAnswerFlip01InCodeChar(random, correctTree, word).wrongAnswerCoding)
  for (let i = 0; i < 2; i++) {
    answerSet.add(generateNewLabelSetting(word, correctTree, random))
  }
  answerSet.delete(correctAnswer)

  return random.shuffle(random.subset(Array.from(answerSet), 3))
}

/**
 * This function generates a new random word by switching some random 1 to 0 and 0 to 1
 * Not this high difficulty, because it is quite obvious to find the error
 * @param random
 * @param correctAnswer
 */
export function generateRandomWrongAnswer(random: Random, correctAnswer: string) {
  const wrongAnswer = correctAnswer.split("")
  const flipPositions = random.subset(
    Array.from({ length: correctAnswer.length }, (_, i) => i),
    random.int(1, 3),
  )

  for (let i = 0; i < flipPositions.length; i++) {
    if (wrongAnswer[flipPositions[i]] === "0") {
      wrongAnswer[flipPositions[i]] = "1"
    } else {
      wrongAnswer[flipPositions[i]] = "0"
    }
  }

  return wrongAnswer.join("")
}

/**
 * This function generates a new random word by switching the coding of two random letters
 * And cutting the new coding of the whole word to match the length of the coding of the correct answer
 * @param random
 * @param currentTree
 * @param word
 */
export function generateWrongAnswerSwitchLetters(
  random: Random,
  currentTree: HuffmanNode,
  word: string,
) {
  const huffmanDict: { [key: string]: string } = currentTree.getEncodingTable()
  const randomKeys = random.subset(Object.keys(huffmanDict), 2)
  ;[huffmanDict[randomKeys[0]], huffmanDict[randomKeys[1]]] = [
    huffmanDict[randomKeys[1]],
    huffmanDict[randomKeys[0]],
  ]

  const resultWord = word
    .split("")
    .map((char) => huffmanDict[char])
    .join("")

  // crop the result word to the same length as the correct answer
  resultWord.slice(0, word.length - 1)
  return {
    resultWord,
    huffmanDict,
  }
}

/**
 * Function to generate a wrong code, it takes the longest code and reduces the length by 1 (deleting the last char)
 * @Difficulty Medium
 * @param word
 * @param currentTree
 */
export function generateWrongAnswerReduceCodeOfLetter(word: string, currentTree: HuffmanNode) {
  const huffmanDict = currentTree.getEncodingTable()
  const currentLongestKey = getKeyWithLongestHuffmanCode(huffmanDict)
  huffmanDict[currentLongestKey] = huffmanDict[currentLongestKey].slice(
    0,
    huffmanDict[currentLongestKey].length - 1,
  )
  const wrongAnswerCoding = createEncodingFromDict(huffmanDict, word)
  return { wrongAnswerCoding, huffmanDict }
}

/**
 * Flips 0 <-> 1 in one random key and one random index
 * @param random
 * @param currentTree
 * @param word
 */
export function generateWrongAnswerFlip01InCodeChar(
  random: Random,
  currentTree: HuffmanNode,
  word: string,
) {
  const huffmanDict = currentTree.getEncodingTable()
  const randomKey = random.choice(Object.keys(huffmanDict))
  const randomIndex = random.int(0, huffmanDict[randomKey].length - 1)
  const newChar = huffmanDict[randomKey][randomIndex] === "0" ? "1" : "0"
  huffmanDict[randomKey] =
    `${huffmanDict[randomKey].slice(0, randomIndex)}${newChar}${huffmanDict[randomKey].slice(randomIndex + 1)}`

  const wrongAnswerCoding = createEncodingFromDict(huffmanDict, word)
  return { wrongAnswerCoding, huffmanDict }
}

export function generateNewLabelSetting(word: string, correctTree: HuffmanNode, random: Random) {
  correctTree.setNewLabels(random)
  return correctTree.encode(word)
}

/**
 * This function swaps the two letters with the lowest frequency, then the next two and so on
 * Does not always create a wrong answer, but it is a good way to create a wrong answer
 */
export function swapManyLetters(inputDict: { [key: string]: number }) {
  const charList: string[] = Object.keys(inputDict)
  const frequencyList: number[] = charList.map((char) => inputDict[char])

  // sort the frequency list and keep the order in the charList
  // could also be done with mergesort or so (but this is easier) and we have only 13 different letters
  for (let i = 0; i < frequencyList.length; i++) {
    for (let j = i + 1; j < frequencyList.length; j++) {
      if (frequencyList[i] > frequencyList[j]) {
        const temp = frequencyList[i]
        frequencyList[i] = frequencyList[j]
        frequencyList[j] = temp
        const tempChar = charList[i]
        charList[i] = charList[j]
        charList[j] = tempChar
      }
    }
  }

  for (let i = 0; i < charList.length - 1; i += 2) {
    const temp = frequencyList[i]
    frequencyList[i] = frequencyList[i + 1]
    frequencyList[i + 1] = temp
  }

  // create the new dictionary
  const newDict: { [key: string]: number } = {}
  for (let i = 0; i < frequencyList.length; i++) {
    newDict[charList[i]] = frequencyList[i]
  }

  // create a correct huffman dictionary
  return getHuffmanCodeOfTable(newDict).getEncodingTable()
}

/**
 * Quite easy, it just changes the frequencies randomly by adding a value between -10 and 10
 * @param random
 * @param inputDict
 */
export function changeFrequenciesRandomly(random: Random, inputDict: { [key: string]: number }) {
  for (const key in inputDict) {
    inputDict[key] += random.int(-10, 10)
    if (inputDict[key] < 1) {
      inputDict[key] = 1
    } else if (inputDict[key] > 100) {
      inputDict[key] = 100
    }
  }

  // create a correct huffman dictionary
  return getHuffmanCodeOfTable(inputDict).getEncodingTable()
}

export function wrongAdditionTree(random: Random, inputDict: { [key: string]: number }) {
  // create an incorrect huffman dictionary
  return getHuffmanCodeOfTable(inputDict, random).getEncodingTable()
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
  return getHuffmanCodeOfWord(wordArray.join("")).encodedWord
}

function getKeyWithLongestHuffmanCode(encodingTable: Record<string, string>) {
  let currentLongestKey: string = Object.keys(encodingTable)[0]
  for (const currentKey in encodingTable) {
    if (encodingTable[currentKey].length > encodingTable[currentLongestKey].length) {
      currentLongestKey = currentKey
    }
  }

  return currentLongestKey
}

function createEncodingFromDict(huffmanDict: { [key: string]: string }, word: string) {
  let encoding = ""
  for (let i = 0; i < word.length; i++) {
    encoding += huffmanDict[word[i]]
  }
  return encoding
}

// todo not used at the moment. is the only function that modifies the tree.
//  if this function is obsolete, some properties of HuffmanNode can be made private
export function createHuffmanCodingBitError(
  huffmanCode: { [key: string]: string },
  node: HuffmanNode,
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
