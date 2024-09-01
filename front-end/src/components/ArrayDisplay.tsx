import { ReactElement } from "react"
import { ArrayDisplayProps } from "@shared/utils/arrayDisplayCodeBlock"
import { Markdown } from "@/components/Markdown"
import { useTranslation } from "@/hooks/useTranslation"
import { hasSpecificDeviceSize } from "@/utils/deviceInformation.ts"

/**
 * This component displays an array in a table.
 *
 * Depending on the size of the device, the array can be displayed transposed.
 *
 * The string Value can be replaced by any string.
 * But the Index is fixed.
 *
 * @param arrayObject - The stringified array object.
 */
export function ArrayDisplay<T>({ arrayObject }: { arrayObject: string }): ReactElement {
  const parsedArrayObject = JSON.parse(arrayObject) as ArrayDisplayProps<T>
  const { lang } = useTranslation()
  const transposedView = hasSpecificDeviceSize("sm") && parsedArrayObject.transposeMobile

  return transposedView
    ? renderTransposedArrayView(parsedArrayObject, lang)
    : renderNormalArrayView(parsedArrayObject, lang)
}

/**
 * This function renders the transposed view of the array.
 *
 * Index | Value
 * ------|------
 *   1   |  a
 *   2   |  b
 *
 * @param parsedArrayObject
 * @param lang
 */
function renderTransposedArrayView<T>(
  parsedArrayObject: ArrayDisplayProps<T>,
  lang: "de" | "en",
): ReactElement {
  return (
    <div className="flex justify-center">
      <div className="my-5">
        <table className="w-full border-collapse">
          <thead className="border-b border-gray-700 dark:border-gray-300">
            <tr>
              <th className="relative border-r border-gray-700 px-4 py-2 text-center text-gray-600 dark:border-gray-300 dark:text-gray-400">
                Index
              </th>
              <th className="px-4 py-2 text-center">{parsedArrayObject.secondRowName[lang]}</th>
            </tr>
          </thead>
          <tbody>
            {parsedArrayObject.array.map((value, index) => (
              <tr key={index}>
                <td className="border-r border-gray-700 px-4 py-2 text-center text-gray-600 dark:border-gray-300 dark:text-gray-400">
                  {index + parsedArrayObject.startingIndex}
                </td>
                <td className="px-4 py-2 text-center">
                  <Markdown md={String(value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * This function renders the normal view of the array.
 *
 * Index: | 1 2 3 4 ...
 * -------|-------------
 * Value: | a b c d ...
 *
 * @param parsedArrayObject
 * @param lang
 */
function renderNormalArrayView<T>(
  parsedArrayObject: ArrayDisplayProps<T>,
  lang: "de" | "en",
): ReactElement {
  return (
    <div className="flex pl-2">
      <div className="my-5">
        <table className="w-full border-collapse">
          <thead className="border-b border-gray-700 dark:border-gray-300">
            <tr>
              <th className="relative border-r border-gray-700 px-4 py-2 text-left text-gray-600 dark:border-gray-300 dark:text-gray-400">
                Index
              </th>
              {parsedArrayObject.array.map((_, index) => (
                <th key={index} className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">
                  {index + parsedArrayObject.startingIndex}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="relative border-r border-gray-700 px-4 py-2 text-left dark:border-gray-300">
                <b>{parsedArrayObject.secondRowName[lang]}</b>
              </th>
              {parsedArrayObject.array.map((value, index) => (
                <td key={index} className="px-4 py-2 text-left">
                  <Markdown md={String(value)} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
