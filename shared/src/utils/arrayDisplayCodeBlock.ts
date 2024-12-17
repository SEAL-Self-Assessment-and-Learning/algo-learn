import { Language } from "@shared/api/Language.ts"
import { t, Translations } from "@shared/utils/translations"

const translations: Translations = {
  en: {
    index: "Index",
    value: "Value",
  },
  de: {
    index: "Index",
    value: "Wert",
  },
}

/**
 * This function creates an array display code block with user input fields.
 * @param numberOfInputFields - (more than nine input fields may be too large)
 * @param startingIndex
 * @param inputFieldSize - the max number of characters necessary to fill the input field
 * @param leadValues - the lead values are values in the columns in front of the input fields
 */
export function createArrayDisplayCodeBlockUserInput({
  numberOfInputFields,
  lang,
  startingIndex = 0,
  inputFieldCharacters = 2,
  leadValues = [],
  labelTranslations,
}: {
  numberOfInputFields: number
  lang: Language
  startingIndex?: number
  inputFieldCharacters?: number
  leadValues?: string[]
  labelTranslations?: Translations
}) {
  // create as many input fields as needed
  const inputFields: string[] = leadValues
  const fieldIDs: string[] = []
  for (let i = 0; i < numberOfInputFields; i++) {
    const fieldID = `input-${i}`
    fieldIDs.push(fieldID)
    inputFields.push(`{{${fieldID}#OS_${inputFieldCharacters.toString()}###overlay}}`)
  }
  return {
    fieldIDs,
    arrayDisplayBlock: createArrayDisplayCodeBlock({
      array: inputFields,
      lang,
      startingIndex,
      labelTranslations,
    }),
  }
}

/**
 * This function stringifies the array and returns it in a code block.
 * @param array
 * @param startingIndex
 * @param secondRowName
 */
export function createArrayDisplayCodeBlock({
  array,
  lang,
  startingIndex = 0,
  labelTranslations = translations,
}: {
  array: any[]
  lang: Language
  startingIndex?: number
  labelTranslations?: Translations
}): string {
  let indexRow = `\n| **${t(labelTranslations, lang, "index")}** |`
  let formattingRow = "|:---!|"
  let dataRow = `| **${t(labelTranslations, lang, "value")}** |`
  for (let i = 0; i < array.length; i++) {
    indexRow += ` ${startingIndex + i} |`
    formattingRow += ":---:|"
    dataRow += ` ${array[i]} |`
  }

  return `${indexRow}\n${formattingRow}\n${dataRow}`
}
