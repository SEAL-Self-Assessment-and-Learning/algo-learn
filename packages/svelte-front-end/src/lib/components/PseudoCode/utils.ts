/**
 * Adds 0.15em to each line
 *
 * Otherwise the lines are too close to each other
 * For example:
 * 1: \\frac{m}{5}
 * 2: \\frac{m}{5}
 * Those nearly touch
 *
 * @param code
 */
export function addBiggerLineSpacing(code: string): string {
  return `${code} \\\\[0.15em]`
}

/**
 * Returns the number of whitespaces at the start of the string
 * @param text
 */
export function getAmountLeadingWhiteSpaces(text: string): number {
  let count = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i] === " ") {
      count++
    } else {
      break
    }
  }
  return count
}
