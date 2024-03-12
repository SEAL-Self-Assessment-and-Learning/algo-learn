import { expect, test } from "vitest"
import { checkProvidedCode, createHuffmanCoding, huffmanCodingAlgorithm } from "./Algorithm.ts"

/**
 * Test to check if the huffmanCodingAlgorithm function works correctly
 */
test("huffmanCodingAlgorithm", () => {
  expect(huffmanCodingAlgorithm("abbcccdddd").result).toBe("1001011011111110000")
  expect(huffmanCodingAlgorithm("balance").result).toBe("100011110100101110")
  expect(huffmanCodingAlgorithm("hello").result).toBe("1111100010")

  // those inputs are from https://ae.cs.uni-frankfurt.de/teaching/20ss/+algo1/selbsttest12.pdf
  expect(huffmanCodingAlgorithm("solve").result).toBe("010011110110")
  expect(huffmanCodingAlgorithm("revive").result).toBe("111100110010")
  expect(huffmanCodingAlgorithm("huffman").result).toBe("011001010110010111")
  expect(huffmanCodingAlgorithm("accuracy").result).toBe("111001011001110110")
  expect(huffmanCodingAlgorithm("weekend").result).toBe("111001010110100")
  expect(huffmanCodingAlgorithm("winning").result).toBe("1011100110100")
  expect(huffmanCodingAlgorithm("attempt").result).toBe("100001011101110")

  // those inputs are from https://ae.cs.uni-frankfurt.de/teaching/20ss/+algo1/selbsttest18.pdf
  expect(huffmanCodingAlgorithm("test").result).toBe("100011")
  expect(huffmanCodingAlgorithm("access").result).toBe("100111110100")
  expect(huffmanCodingAlgorithm("coffee").result).toBe("100101001111")
  expect(huffmanCodingAlgorithm("element").result).toBe("010001010110111")
  expect(huffmanCodingAlgorithm("output").result).toBe("100011101011")
  expect(huffmanCodingAlgorithm("goethe").result).toBe("11000100111110")
  expect(huffmanCodingAlgorithm("minimal").result).toBe("1110001011010011")
})

test("check if the user input is minimal prefix free code", () => {
  const inputFrequncies = {
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
      inputFrequncies,
      createHuffmanCoding({}, huffmanCodingAlgorithm("", inputFrequncies).mainNode, ""),
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
      inputFrequncies,
      createHuffmanCoding({}, huffmanCodingAlgorithm("", inputFrequncies).mainNode, ""),
      providedCode1,
    ),
  ).toBe(false)
})
