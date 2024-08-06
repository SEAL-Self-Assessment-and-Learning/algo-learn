import { expect, test } from "vitest"
import { checkProvidedCode } from "@shared/question-generators/huffman-coding/utils/utils.ts"
import Random from "@shared/utils/random.ts"
import { getHuffmanCodeOfTable, getHuffmanCodeOfWord } from "./Huffman.ts"

/**
 * Test to check if the huffmanCodingAlgorithm function works correctly
 */
test("huffman encoding", () => {
  for (const [word, code] of [
    // commented-out tests result in non-unique tree structure.
    // They can be included again when the code supports such cases
    ["abbcccdddd", "1001011011111110000"],
    // ["balance", "1001011011111110000"],  // non-unique tree structure
    // ["hello", "1111100010"],
    // those inputs are from https://ae.cs.uni-frankfurt.de/teaching/20ss/+algo1/selbsttest12.pdf
    // ["solve", "010011110110"],
    // ["revive", "111100110010"],
    // ["huffman", "011001010110010111"],
    // ["accuracy", "111001011001110110"],
    // ["weekend", "111001010110100"],
    ["winning", "1011100110100"],
    ["attempt", "100001011101110"],
    // those inputs are from https://ae.cs.uni-frankfurt.de/teaching/20ss/+algo1/selbsttest18.pdf
    ["test", "100011"],
    // ["access", "100111110100"],
    // ["coffee", "100101001111"],
    // ["element", "010001010110111"],
    // ["output", "100011101011"],
    // ["goethe", "11000100111110"],
    // ["minimal", "1110001011010011"],
  ]) {
    expect(getHuffmanCodeOfWord(word).huffmanTree.setLabelsByCodeword(word, code)).toBeTruthy()
  }
})

test("allow different edge labels", () => {
  const random = new Random("seed")
  const word = "huffman"
  const { encodedWord, huffmanTree } = getHuffmanCodeOfWord(word)

  expect(huffmanTree.setLabelsByCodeword(word, encodedWord)).toBeTruthy()

  for (let i = 0; i < 10; i++) {
    huffmanTree.setNewLabels(random)
    expect(huffmanTree.encode(word)).toBeTruthy()
  }
})

test("check if the user input is minimal prefix free code", () => {
  const inputFrequencies = {
    e: 44,
    g: 20,
    c: 39,
    h: 15,
    i: 36,
    b: 14,
    d: 43,
    k: 39,
  }
  const providedCodeCorrect = {
    e: "00",
    g: "010",
    c: "101",
    h: "0111",
    i: "100",
    b: "0110",
    d: "111",
    k: "110",
  }
  expect(
    checkProvidedCode(
      inputFrequencies,
      getHuffmanCodeOfTable(inputFrequencies).getEncodingTable(),
      providedCodeCorrect,
    ),
  ).toBe(true)
  const providedCode1 = {
    e: "00",
    g: "010",
    c: "101",
    h: "1111", // flipped first bit from 0 to 1
    i: "100",
    b: "0110",
    d: "111",
    k: "110",
  }
  expect(
    checkProvidedCode(
      inputFrequencies,
      getHuffmanCodeOfTable(inputFrequencies).getEncodingTable(),
      providedCode1,
    ),
  ).toBe(false)
})
