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
  inputFieldSize?: number
}

/**
 * This function creates an array display code block with user input fields.
 * @param numberOfInputFields - (more than nine input fields may be too large)
 * @param startingIndex
 * @param secondRowName
 * @param transposeMobile
 * @param inputFieldSize - the size of the input field (11 is the default size (it fits two digits))
 *                         (currently only **w-(10|11|12|14)** are included in the safelist,
 *                         in case you need a different size, please add it to the safelist)
 * @param leadValues - the lead values are values in the columns in front of the input fields
 */
export function createArrayDisplayCodeBlockUserInput({
  numberOfInputFields,
  startingIndex = 0,
  secondRowName = { de: "Wert", en: "Value" },
  transposeMobile = false,
  inputFieldSize = 11,
  leadValues = [],
}: {
  numberOfInputFields: number
  startingIndex?: number
  secondRowName?: SingleTranslation
  transposeMobile?: boolean
  inputFieldSize?: number
  leadValues?: string[]
}) {
  // create as many input fields as needed
  const inputFields: string[] = leadValues
  for (let i = 0; i < numberOfInputFields; i++) {
    inputFields.push(`{{input-${i}#OS_w-${inputFieldSize.toString()}###overlay}}`)
  }
  return {
    inputFields,
    arrayDisplayBlock: createArrayDisplayCodeBlock({
      array: inputFields,
      startingIndex,
      secondRowName,
      transposeMobile,
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
