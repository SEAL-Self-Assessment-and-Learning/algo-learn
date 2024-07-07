import { SingleTranslation } from "@shared/utils/translations"

export type ArrayDisplayProps<T> = {
  array: T[]
  startingIndex: number
  secondRowName: SingleTranslation
}

export function createArrayDisplayCodeBlock<T>({
  array,
  startingIndex = 0,
  secondRowName = { de: "Wert:", en: "Value" },
}: {
  array: T[]
  startingIndex?: number
  secondRowName?: SingleTranslation
}): string {
  const parseArrayBlock: ArrayDisplayProps<T> = {
    array,
    startingIndex,
    secondRowName,
  }

  return JSON.stringify(parseArrayBlock)
}
