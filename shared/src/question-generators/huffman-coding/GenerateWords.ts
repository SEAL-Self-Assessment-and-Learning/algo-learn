import Random from "@shared/utils/random.ts"

/**
 * This function generates a random string of a given length and difficulty
 * @param length the length of the string
 * @param difficulty the difficulty of the string
 *                   if the string should be more difficult, it's probably also longer
 *                   it has 3 stages
 *                   1 - very easy - no choosing between characters
 *                   2 - medium - choosing between characters but not too many
 *                   3 - hard - choosing often between characters
 * @param random the random object
 */
export function generateString(
  length: number,
  difficulty: number,
  random: Random,
): string {
  if (difficulty === 0) {
    return ""
  }

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

  if (difficulty === 1) {
    // generate a word length at maximum of 13 chars
    const chosenFrequency = tmpFrequencies[length]
    const randomIndex = random.int(0, chosenFrequency.length - 1)

    return generateWordBasedOnFrequency(chosenFrequency[randomIndex], random)
  } else {
    // generate a word length with any amount of chars
    return ""
  }
}

function generateWordBasedOnFrequency(
  chosenFrequency: number[],
  random: Random,
) {
  let word = ""
  // not using "i", "j", "l", "n", "q" because they have similar shapes
  let possibleChars: string = "abcdefghkmoprstuvwxyz"

  // create the word based on the chosen frequencies
  for (let i = 0; i < chosenFrequency.length; i++) {
    const char = possibleChars[random.int(0, possibleChars.length - 1)]
    possibleChars = possibleChars.replace(char, "")
    for (let j = 0; j < chosenFrequency[i]; j++) {
      word += char
    }
  }
  return word
}

/**
 * This function creates an array of chars, this is for more difficult questions (but more easy too read, instead of a
 * word with 26 letters or so)
 * @param differentLetters
 * @param difficulty
 * @param random
 */
export function generateWordArray(
  differentLetters: number,
  difficulty: number,
  random: Random,
) {
  // TODO better control over how the array is constructed and not only random use

  if (difficulty === 0) {
    return { charArray: {}, word: "" }
  }

  const possibleChars: string = "abcdefghijklmnopqrstuvwxyz"
  const amountCharsArray = []
  for (let i = 0; i < differentLetters; i++) {
    amountCharsArray.push(random.int(3, 50))
  }
  const charArray: { [key: string]: number } = {}
  amountCharsArray.forEach((item) => {
    const randomLetter = random.choice(possibleChars.split(""))
    possibleChars.replace(randomLetter, "")
    charArray[randomLetter] = item
  })

  // also create the word for faster huffman Coding
  let word = ""
  for (const key in charArray) {
    for (let i = 0; i < charArray[key]; i++) {
      word += key
    }
  }

  return { charArray, word }
}
