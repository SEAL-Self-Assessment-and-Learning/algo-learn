import { SingleTranslation } from "@shared/utils/translations.ts"

export type ArrayDisplayProps<T> = {
  array: T[]
  startingIndex: number
  fuckingNamesSecondRowDisplay: SingleTranslation
}

export function createArrayDisplayCodeBlock<T>({
  array,
  startingIndex = 0,
  fuckingNamesSecondRowDisplay = { de: "Wert:", en: "Value" },
}: {
  array: T[]
  startingIndex?: number
  fuckingNamesSecondRowDisplay?: SingleTranslation
}): string {
  const parseArrayBlock: ArrayDisplayProps<T> = {
    array,
    startingIndex,
    fuckingNamesSecondRowDisplay,
  }

  return JSON.stringify(parseArrayBlock)
}
