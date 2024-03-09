import Random from "@shared/utils/random.ts"

/* eslint-disable @typescript-eslint/naming-convention */
const tmpFrequencies: { [key: number]: number[][] } = {
  8: [
    [1, 2, 5],
    [1, 3, 4],
  ],
  9: [
    [1, 2, 6],
    [1, 3, 5],
    [2, 3, 4],
  ],
  10: [
    [1, 2, 7],
    [1, 3, 6],
  ],
  11: [
    [1, 2, 8],
    [1, 3, 7],
    [1, 4, 6],
    [2, 4, 5],
    [2, 3, 6],
  ],
  12: [
    //[1, 2, 9],
    //[1, 3, 8],
    //[1, 4, 7],
    [2, 3, 7],
    [3, 4, 5],
    [1, 2, 4, 5],
    [1, 2, 4, 5],
  ],
  13: [
    //[1, 4, 8],
    //[1, 5, 7],
    //[2, 3, 8],
    [2, 4, 7],
    //[2, 5, 6],
    [3, 4, 6],
    [1, 2, 4, 6],
    [1, 2, 4, 6],
  ],
}

/**
 * This function generates a random string of a given length and difficulty
 * @param length the length of the string
 * @param random the random object
 */
export function generateString(length: keyof typeof tmpFrequencies, random: Random): string {
  // generate a word length at maximum of 13 chars
  const chosenFrequency = tmpFrequencies[length]
  const randomIndex = random.int(0, chosenFrequency.length - 1)

  return generateWordBasedOnFrequency(chosenFrequency[randomIndex], random)
}

function generateWordBasedOnFrequency(chosenFrequency: number[], random: Random) {
  let word = ""
  // not using "i", "j", "l", "n", "q" because they have similar shapes
  const possibleChars: string = "abcdefghkmoprstuvwxyz"
  const chosenChars = random.subset(possibleChars.split(""), chosenFrequency.length)

  for (let j = 0; j < chosenFrequency.length; j++) {
    word += chosenChars[j].repeat(chosenFrequency[j])
  }

  return word
}

/**
 * This function creates an array of chars, this is for more difficult questions (but more easy too read, instead of a
 * word with 26 letters or so)
 * @param random
 */
export function generateWordArray(random: Random) {
  // TODO better control over how the array is constructed and not only random use

  const differentLetters = random.int(7, 12)

  const possibleChars: string = "abcdefghijklmnopqrstuvwxyz"
  const chosenChars = random.subset(possibleChars.split(""), differentLetters)
  const amountCharsArray = []
  for (let i = 0; i < differentLetters; i++) {
    amountCharsArray.push(random.int(3, 50))
  }
  const charArray: { [key: string]: number } = {}
  for (let i = 0; i < differentLetters; i++) {
    charArray[chosenChars[i]] = amountCharsArray[i]
  }

  // also create the word for faster huffman Coding
  let word = ""
  for (const key in charArray) {
    for (let i = 0; i < charArray[key]; i++) {
      word += key
    }
  }

  return { charArray, word }
}
