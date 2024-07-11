import { ReactElement } from "react"
import { ArrayDisplayProps } from "@shared/utils/arrayDisplayCodeBlock"
import { Markdown } from "@/components/Markdown"
import { useTranslation } from "@/hooks/useTranslation"

/**
 * This component displays an array in a table.
 *
 * Index: | 1 2 3 4 ...
 * -------|-------------
 * Value: | a b c d ...
 *
 * The string Value can be replaced by any string.
 * But the Index is fixed.
 *
 * @param arrayObject - The stringified array object.
 */
export function ArrayDisplay<T>({ arrayObject }: { arrayObject: string }): ReactElement {
  const parsedArrayObject: ArrayDisplayProps<T> = JSON.parse(arrayObject) as ArrayDisplayProps<T>

  const { lang } = useTranslation()

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
                <th key={index} className="text-gray-600 dark:text-gray-400">
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
