import Random from "@shared/utils/random"

// Todo: generate those frequencies
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
    [2, 3, 7],
    [3, 4, 5],
    [1, 2, 4, 5],
    [1, 2, 4, 5],
  ],
  13: [
    [2, 4, 7],
    [3, 4, 6],
    [1, 2, 4, 6],
    [1, 2, 4, 6],
  ],
}

// alphabet from A to Z
const possibleChars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

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

/**
 * Generates a word based on the frequency of the characters (characters are not chosen yet)
 * @param chosenFrequency - the frequency of the characters
 * @param random - the random object
 */
function generateWordBasedOnFrequency(chosenFrequency: number[], random: Random) {
  let word = ""
  const chosenChars = random.subset(possibleChars.split(""), chosenFrequency.length)
  for (let j = 0; j < chosenFrequency.length; j++) {
    word += chosenChars[j].repeat(chosenFrequency[j])
  }
  return word
}

/**
 * This function creates an array of chars, this is for more challenging questions
 * (but easier to read, instead of a word with 26 letters or so)
 * @param numDifferentCharacters - how many different chars appear (max 26)
 * @param random
 */
export function generateCharacterFrequencyTable(numDifferentCharacters: number, random: Random) {
  const chosenChars = random.subset(possibleChars.split(""), numDifferentCharacters)
  const amountCharsArray = random.shuffle([...Array(50).keys()]).slice(0, numDifferentCharacters)
  const charArray: { [key: string]: number } = {}
  for (let i = 0; i < numDifferentCharacters; i++) {
    charArray[chosenChars[i]] = amountCharsArray[i] + 1
  }

  return charArray
}
