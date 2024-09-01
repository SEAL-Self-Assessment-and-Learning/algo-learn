import { SingleTranslation } from "@shared/utils/translations"

/**
 * This type indicates the props that are needed to display an array in a code block.
 *
 * @param array The array that should be displayed.
 * @param startingIndex The index to in the top row to start with
 *                      (default is 0, mostly either 0 or 1)
 * @param secondRowName The name of the second row (default is ST "Value")
 * @param transposeMobile If true, the array will be displayed transposed on smaller devices
 */
export type ArrayDisplayProps<T> = {
  array: T[]
  startingIndex: number
  secondRowName: SingleTranslation
  transposeMobile: boolean
}

/**
 * This function stringifies the array and returns it in a code block.
 * @param array
 * @param startingIndex
 * @param secondRowName
 * @param transpose
 */
export function createArrayDisplayCodeBlock<T>({
  array,
  startingIndex = 0,
  secondRowName = { de: "Wert", en: "Value" },
  transposeMobile = false,
}: {
  array: T[]
  startingIndex?: number
  secondRowName?: SingleTranslation
  transposeMobile?: boolean
}): string {
  const parseArrayBlock: ArrayDisplayProps<T> = {
    array,
    startingIndex,
    secondRowName,
    transposeMobile: transposeMobile,
  }

  return `
\`\`\`array
${JSON.stringify(parseArrayBlock)}
\`\`\`
  `
}
