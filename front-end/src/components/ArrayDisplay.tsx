import { ReactElement } from "react"
import { ArrayDisplayProps } from "@shared/utils/arrayDisplayCodeBlock"
import { Markdown } from "@/components/Markdown"
import { Separator } from "@/components/ui/separator"
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
          <thead className="border-b">
            <tr>
              <th className="relative px-4 py-2 text-left text-gray-600 dark:text-gray-400">
                <b>Index:</b>
                <Separator orientation={`vertical`} className={`absolute inset-y-0 right-0`} />
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
              <th className="relative px-4 py-2 text-left">
                <b>{parsedArrayObject.secondRowName[lang]}:</b>
                <Separator orientation={`vertical`} className={`absolute inset-y-0 right-0`} />
              </th>
              {parsedArrayObject.array.map((value, index) => (
                <td key={index} className="px-4 py-2 text-left">
                  <Markdown md={value as string} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
