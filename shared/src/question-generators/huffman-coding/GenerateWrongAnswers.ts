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
export function generateRandomWrongAnswer(random: Random, correctAnswer: string) {
  const wrongAnswer = correctAnswer.split("")
  const flipPositions = random.subset(
    Array.from({ length: correctAnswer.length }, (_, i) => i),
    random.int(1, 5),
  )

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
 * @param table if the question is a table question of a question where the word is represented
 */
export function generateWrongAnswerSwitchLetters(
  random: Random,
  currentTree: TreeNode,
  word: string,
  table: boolean,
) {
  const huffmanDict: { [key: string]: string } = createHuffmanCoding({}, currentTree, "")
  const keySet: string[] = Object.keys(huffmanDict)
  const randomKeys = random.subset(keySet, 2)
  ;[huffmanDict[randomKeys[0]], huffmanDict[randomKeys[1]]] = [
    huffmanDict[randomKeys[1]],
    huffmanDict[randomKeys[0]],
  ]
  let resultWord: string = ""
  if (!table) {
    resultWord = word
      .split("")
      .map((char) => huffmanDict[char])
      .join("")
  }
  // crop the result word to the same length as the correct answer
  resultWord.slice(0, word.length - 1)
  return {
    resultWord,
    huffmanDict,
  }
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
  return huffmanCodingAlgorithm(wrongAnswer).result
}

/**
 * Function to generate a wrong code, it takes the longest code and reduces the length by 1 (deleting the last char)
 * @Difficulty Medium
 * @param word
 * @param currentTree
 */
export function generateWrongAnswerReduceCodeOfLetter(word: string, currentTree: TreeNode) {
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
  return { wrongAnswerCoding, huffmanDict }
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
  const newChar = huffmanDict[currentLongestKey][randomIndex] === "0" ? "1" : "0"
  huffmanDict[currentLongestKey] =
    huffmanDict[currentLongestKey].slice(0, randomIndex) +
    newChar +
    huffmanDict[currentLongestKey].slice(randomIndex + 1)

  let wrongAnswerCoding = ""
  for (let i = 0; i < word.length; i++) {
    wrongAnswerCoding += huffmanDict[word[i]]
  }

  return { wrongAnswerCoding, huffmanDict }
}

/*
Maybe add more challenging wrong answers, but I don't have any idea at the moment
- Maybe another wrong answer where the code is too short at the end
*/

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

  for (let i = 0; i < charList.length; i += 2) {
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
  return createHuffmanDict(huffmanCodingAlgorithm("", newDict).mainNode).huffmanDict
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
  return createHuffmanDict(huffmanCodingAlgorithm("", inputDict).mainNode).huffmanDict
}

export function wrongAdditionTree(random: Random, inputDict: { [key: string]: number }) {
  // create a correct huffman dictionary
  return createHuffmanDict(huffmanCodingAlgorithm("", inputDict, random.int(-10, 20)).mainNode)
    .huffmanDict
}

/*
Helper
 */

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
  return huffmanCodingAlgorithm(wordArray.join("")).result
}

function createHuffmanDict(currentTree: TreeNode) {
  let huffmanDict: { [key: string]: string } = {}
  huffmanDict = createHuffmanCoding(huffmanDict, currentTree, "")
  // get the key with the longest value
  let currentLongestKey: string = ""
  for (const currentKey in huffmanDict) {
    if (currentLongestKey === "") {
      currentLongestKey = currentKey
      continue
    }
    if (huffmanDict[currentKey].length > huffmanDict[currentLongestKey].length) {
      currentLongestKey = currentKey
    }
  }
  return { huffmanDict, currentLongestKey: currentLongestKey }
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
