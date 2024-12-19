import { SingleTranslation } from "@shared/utils/translations"

/**
 * This type indicates the props that are needed to display an array in a code block.
 *
 * @param array The array that should be displayed.
 * @param startingIndex The index to in the top row to start with
 *                      (default is 0, mostly either 0 or 1)
 * @param secondRowName The name of the second row (default is ST "Value")
 * @param transpose If the array should be transposed (default is false)
 *                  - if false, on mobile it will still transpose
 */
export type ArrayDisplayProps<T> = {
  array: T[]
  startingIndex: number
  secondRowName: SingleTranslation
  transpose: boolean
}

/**
 * This function creates an array display code block with user input fields.
 * @param numberOfInputFields - (more than nine input fields may be too large)
 * @param startingIndex
 * @param secondRowName
 * @param inputFieldSize - the max number of characters necessary to fill the input field
 * @param leadValues - the lead values are values in the columns in front of the input fields
 * @param transpose - if the array should be transposed
 */
export function createArrayDisplayCodeBlockUserInput({
  numberOfInputFields,
  startingIndex = 0,
  secondRowName = { de: "Wert", en: "Value" },
  inputFieldCharacters = 2,
  leadValues = [],
  transpose = false,
}: {
  numberOfInputFields: number
  startingIndex?: number
  secondRowName?: SingleTranslation
  inputFieldCharacters?: number
  leadValues?: string[]
  transpose?: boolean
}) {
  // create as many input fields as needed
  const inputFields: string[] = leadValues
  const fieldIDs: string[] = []
  for (let i = startingIndex; i < numberOfInputFields + startingIndex; i++) {
    const fieldID = `input-${i}`
    fieldIDs.push(fieldID)
    inputFields.push(`{{${fieldID}#OS_${inputFieldCharacters.toString()}###overlay}}`)
  }
  return {
    fieldIDs,
    arrayDisplayBlock: createArrayDisplayCodeBlock({
      array: inputFields,
      startingIndex,
      secondRowName,
      transpose,
    }),
  }
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
  transpose = false,
}: {
  array: T[]
  startingIndex?: number
  secondRowName?: SingleTranslation
  transpose?: boolean
}): string {
  const parseArrayBlock: ArrayDisplayProps<T> = {
    array,
    startingIndex,
    secondRowName,
    transpose,
  }

  return `
\`\`\`array
${JSON.stringify(parseArrayBlock)}
\`\`\`
  `
}
