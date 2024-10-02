import Random from "@shared/utils/random"

/**
 * Generates a Huffman tree + encoded word from a given word of character frequencies.
 * @param inputWord
 * @param random If provided introduces random math mistakes into the tree
 */
export function getHuffmanCodeOfWord(
  inputWord: string,
  random?: Random,
): {
  encodedWord: string
  huffmanTree: HuffmanNode
} {
  const charactersFrequencies: { [key: string]: number } = {}

  for (let i = 0; i < inputWord.length; i++) {
    charactersFrequencies[inputWord[i]] ??= 0
    charactersFrequencies[inputWord[i]] += 1
  }

  const huffmanTree = getHuffmanCodeOfTable(charactersFrequencies, random)

  return { encodedWord: huffmanTree.encode(inputWord), huffmanTree }
}

/**
 * Generates a Huffman tree from a given table of character frequencies.
 * @param charactersFrequencies the frequency of each character
 * @param random If provided introduces random math mistakes into the tree
 */
export function getHuffmanCodeOfTable(
  charactersFrequencies: { [key: string]: number } = {},
  random?: Random,
): HuffmanNode {
  // create nodes for each character
  const nodes: HuffmanNode[] = []
  for (const character in charactersFrequencies) {
    nodes.push(new HuffmanNode(character, charactersFrequencies[character]))
  }

  // create a tree based on the charactersFrequencies
  // connect the two smallest values
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.frequency - b.frequency)
    const left = nodes.shift()
    const right = nodes.shift()
    if (left && right) {
      const frequencySum = left.frequency + right.frequency
      const mathMistake =
        random === undefined
          ? 0
          : random.int(Math.ceil(frequencySum * 0.9), Math.floor(frequencySum * 1.1))
      nodes.push(new HuffmanNode(left.value + right.value, frequencySum + mathMistake, left, right))
    }
  }

  return nodes[0]
}

/**
 * This type represents a node in the huffman tree
 */
export class HuffmanNode {
  // todo some properties are currently used by an unused function.
  //  If it gets removed the properties can be set to private.
  public value: string
  public frequency: number
  public left: HuffmanNode | null
  public right: HuffmanNode | null
  private leftLabel: "0" | "1" | null = null
  private rightLabel: "0" | "1" | null = null

  constructor(value: string, frequency: number, left?: HuffmanNode, right?: HuffmanNode) {
    this.value = value
    this.frequency = frequency
    this.left = left ?? null
    this.right = right ?? null
  }

  /**
   * Removes all labels so the tree can be labels again
   */
  private clearLabels() {
    this.leftLabel = null
    this.rightLabel = null
    this.left?.clearLabels()
    this.right?.clearLabels()
  }

  /**
   * Labels the edges of the HuffmanTree with "0" and "1".
   * By default, left edges are labels with "0", right edges with "1". If random is provided, the labeling is random.
   * @param random
   */
  public setNewLabels(random?: Random) {
    this.clearLabels()
    this.setLabels(random)
  }

  /**
   * Does the actual labeling mentioned in setNewLabels()
   * @param random
   */
  private setLabels(random?: Random) {
    const labels: ("0" | "1")[] = random ? random.shuffle(["0", "1"]) : ["0", "1"]

    if (this.left !== null) {
      this.leftLabel = labels[0]
      this.left.setLabels(random)
    }

    if (this.right !== null) {
      this.rightLabel = labels[1]
      this.right.setLabels(random)
    }
  }

  /**
   * Tries to label the tree such that encoding word results in the given code.
   * Returns true if the tree was labeled successfully, else false.
   * IMPORTANT: This function assumes that all valid huffman trees have the exact same structure.
   * This is not always true. E.g. for the word "abc" each character can be encoded with a 1 and the others with 00 and 01.
   * So this function only works reliably as long as it is only used for words that do not have this issue.
   * @param word
   * @param code
   */
  public setLabelsByCodeword(word: string, code: string): boolean {
    this.clearLabels()

    for (let i = 0; i < word.length; i++) {
      try {
        code = this.setCharacterLabel(word[i], code)
      } catch (e) {
        return false
      }
    }

    return true
  }

  /**
   * Tries to label the path for a given character in the Huffman tree.
   * Returns the remaining code suffix after the prefix is used to label a part of the tree.
   * @param character
   * @param code
   * @private
   */
  private setCharacterLabel(character: string, code: string): string {
    if (this.value === character) return code

    if (code === "") throw Error(`Invalid codeword: to short`)

    const codeBit = code[0]
    const codeSuffix = code.substring(1)
    if (codeBit !== "0" && codeBit !== "1")
      throw Error(`Invalid codeword: contains character ${codeBit}`)

    if (this.left?.value.includes(character)) {
      if (this.leftLabel !== null && this.leftLabel !== codeBit) throw Error("Code is not prefix free")
      this.leftLabel = codeBit
      this.rightLabel = this.getInverseBit(codeBit)
      return this.left?.setCharacterLabel(character, codeSuffix)
    } else if (this.right?.value.includes(character)) {
      if (this.rightLabel !== null && this.rightLabel !== codeBit) throw Error("Code is not prefix free")
      this.rightLabel = codeBit
      this.leftLabel = this.getInverseBit(codeBit)
      return this.right?.setCharacterLabel(character, codeSuffix)
    }

    throw Error(`Character "${character}" is not encoded by this Huffman code.`)
  }

  private getInverseBit(bit: "0" | "1"): "0" | "1" {
    return bit === "0" ? "1" : "0"
  }

  /**
   * Encodes word using the given encoding table. If the table is not provided it is calculated.
   * @param word
   * @param encodingTable
   */
  public encode(word: string, encodingTable?: Record<string, string>): string {
    encodingTable ??= this.getEncodingTable()

    let codeword = ""
    for (let i = 0; i < word.length; i++) {
      codeword += encodingTable[word[i]]
    }

    return codeword
  }

  /**
   * Generates the encoding table for the tree.
   */
  public getEncodingTable(): Record<string, string> {
    const encodingTable: Record<string, string> = {}
    for (let i = 0; i < this.value.length; i++) {
      encodingTable[this.value[i]] = this.getCharacterCode(this.value[i])
    }

    return encodingTable
  }

  /**
   * Calculates the encoding for a single character from the labels in te tree.
   * If the tree is not labeled yet, the default labeling is implicitly applied
   * @param character
   * @private
   */
  private getCharacterCode(character: string): string {
    if (this.value === character) return ""

    if (this.left?.value.includes(character))
      return (this.leftLabel ?? "0") + this.left?.getCharacterCode(character)

    if (this.right?.value.includes(character))
      return (this.rightLabel ?? "1") + this.right?.getCharacterCode(character)

    throw Error(`Character ${character} cannot be encoded`)
  }
}
