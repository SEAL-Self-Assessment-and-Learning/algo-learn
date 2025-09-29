/**
 * Function to insert a space after every x characters
 * @param input - the input string
 * @param x - the number of characters after which a space should be inserted
 */
export function insertSpaceAfterEveryXChars(input: string, x: number): string {
  let result = ""
  for (let i = 0; i < input.length; i += x) {
    result += input.substring(i, i + x) + " "
  }
  return result.trim() // Remove the trailing space
}

/**
 * Creates the table for markdown
 * @param wordArray - the word arrays with frequency of each letter
 */
export function convertDictToMdTable(wordArray: { [key: string]: string | number }) {
  const header = Object.keys(wordArray)
  const content = Object.values(wordArray)
  return `\n|${header.join("|")}|\n${"|:---:".repeat(header.length)}|\n|$${content.join("$|$")}$|\n`
}

/**
 * This function checks if a given code is a correct encoding of inputFrequencies
 *
 * @param inputFrequencies - how often each char appears
 * @param possibleCode - an already correct computed code
 * @param providedCode - the code to check for correctness
 */
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

  const providedCodeArray: string[] = Object.values(providedCode)
  providedCodeArray.sort((a, b) => a.length - b.length)

  // checks if the code is prefix-free
  for (let i = 0; i < providedCodeArray.length - 1; i++) {
    for (let j = i + 1; j < providedCodeArray.length; j++) {
      if (providedCodeArray[j].startsWith(providedCodeArray[i])) {
        return false
      }
    }
  }

  return true
}
