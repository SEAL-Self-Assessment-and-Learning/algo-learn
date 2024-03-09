/**
 * This file contains the Huffman Coding Algorithm
 */

/**
 * This function takes in a string and returns the Huffman Coding of the string
 * @param inputWord the word to be encoded
 * @param sortingVariant the variant of the sorting algorithm
 *                        currently not implemented
 */
export function huffmanCodingAlgorithm(
  inputWord: string,
  sortingVariant: number,
): {
  result: string
  mainNode: TreeNode
} {
  // split the input word into an dictionary of characters
  if (sortingVariant === 1) {
    // currently not implemented
  }
  const characters: { [key: string]: number } = {}
  for (let i = 0; i < inputWord.length; i++) {
    if (characters[inputWord[i]]) {
      characters[inputWord[i]] += 1
    } else {
      characters[inputWord[i]] = 1
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
  // connect the two smallest values together
  while (nodes.length > 1) {
    // TODO: sort the nodes based on a custom sort function (or store those in a priority queue)
    nodes.sort((a, b) => sortNodes(a, b))
    const left = nodes.shift()
    const right = nodes.shift()
    if (left && right) {
      const newNode: TreeNode = {
        value: left.value + right.value,
        frequency: left.frequency + right.frequency,
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
  for (let i = 0; i < inputWord.length; i++) {
    result += huffmanCoding[inputWord[i]]
  }

  return { result, mainNode: mainNode }

  function sortNodes(a: TreeNode, b: TreeNode) {
    // if a equals b compare them alphabetically
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
