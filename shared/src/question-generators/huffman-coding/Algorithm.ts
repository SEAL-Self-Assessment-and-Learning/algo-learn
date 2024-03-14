/**
 * This file contains the Huffman Coding Algorithm
 */

/**
 * This function takes in a string and returns the Huffman Coding of the string
 * @param inputWord the word to be encoded
 * @param characters the characters and their frequency, if this is provided, the inputWord is ignored
 */
export function huffmanCodingAlgorithm(
  inputWord: string,
  characters: { [key: string]: number } = {},
  wrongAddition: number = 0,
): {
  result: string
  mainNode: TreeNode
} {
  let computeBasedOnWord = false
  if (Object.keys(characters).length === 0) {
    computeBasedOnWord = true
  }

  if (computeBasedOnWord) {
    for (let i = 0; i < inputWord.length; i++) {
      if (characters[inputWord[i]]) {
        characters[inputWord[i]] += 1
      } else {
        characters[inputWord[i]] = 1
      }
    }
  }

  // create nodes for each character
  const nodes: TreeNode[] = []
  for (const character in characters) {
    nodes.push({
      value: character,
      frequency: characters[character],
      left: null,
      right: null,
      personalCode: "",
    })
  }

  // create a tree based on the characters
  // connect the two smallest values
  while (nodes.length > 1) {
    nodes.sort((a, b) => sortNodes(a, b))
    const left = nodes.shift()
    const right = nodes.shift()
    if (left && right) {
      const newNode: TreeNode = {
        value: left.value + right.value,
        frequency: left.frequency + right.frequency + wrongAddition,
        left: left,
        right: right,
        personalCode: "",
      }
      nodes.push(newNode)
    }
  }

  const mainNode: TreeNode = nodes[0]

  // create the huffman coding for each character
  const huffmanCoding: { [key: string]: string } = {}
  for (const character in characters) {
    huffmanCoding[character] = ""
  }

  createHuffmanCoding(huffmanCoding, mainNode, "")

  let result: string = ""
  if (computeBasedOnWord) {
    for (let i = 0; i < inputWord.length; i++) {
      result += huffmanCoding[inputWord[i]]
    }
  }

  return { result, mainNode: mainNode }

  function sortNodes(a: TreeNode, b: TreeNode) {
    // if 'a' equals 'b' compare them alphabetically
    // compare the frequency of the two nodes
    if (a.frequency === b.frequency) {
      // compare the smallest letter of the two node strings
      return a.value.split("").sort().join("").localeCompare(b.value.split("").sort().join(""))
    }
    return a.frequency - b.frequency
  }
}

/*
   Additional functions to create the huffman coding
    */
export function createHuffmanCoding(
  huffmanCode: { [key: string]: string },
  node: TreeNode,
  code: string,
) {
  if (node.left) {
    huffmanCode = createHuffmanCoding(huffmanCode, node.left, code + "0")
  }
  if (node.right) {
    huffmanCode = createHuffmanCoding(huffmanCode, node.right, code + "1")
  }
  if (node.value.length === 1) {
    huffmanCode[node.value] = code
  }
  return huffmanCode
}

/**
 * This type represents a node in the huffman tree
 */
export type TreeNode = {
  value: string
  frequency: number
  left: TreeNode | null
  right: TreeNode | null
  personalCode: string
}

export function checkProvidedCode(
  inputFrequencies: { [key: string]: number },
  possibleCode: { [key: string]: string },
  providedCode: { [key: string]: string },
) {
  // first check if the provided code will have the same length as the possible code
  const possibleCodeLength = Object.keys(possibleCode).reduce((acc, key) => {
    return acc + possibleCode[key].length * inputFrequencies[key]
  }, 0)
  const providedCodeLength = Object.keys(providedCode).reduce((acc, key) => {
    // could be simplified, but I think this is more readable
    if (inputFrequencies[key] === undefined) {
      return NaN
    }
    return acc + providedCode[key].length * inputFrequencies[key]
  }, 0)

  if (possibleCodeLength !== providedCodeLength) {
    return false
  }

  // convert the provided code to an array
  const providedCodeArray = Object.keys(providedCode).map((key) => providedCode[key])
  providedCodeArray.sort((a, b) => a.length - b.length)

  // checks if the code is prefix-free
  // is it possible to optimize this?
  for (let i = 0; i < providedCodeArray.length - 1; i++) {
    for (let j = i + 1; j < providedCodeArray.length; j++) {
      if (providedCodeArray[j].startsWith(providedCodeArray[i])) {
        return false
      }
    }
  }

  return true
}
