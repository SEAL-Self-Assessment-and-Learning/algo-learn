import { ReactElement } from "react"
import { ArrayDisplayProps } from "@shared/utils/arrayDisplayCodeBlock"
import { Markdown } from "@/components/Markdown"
import { Separator } from "@/components/ui/separator"
import { useTranslation } from "@/hooks/useTranslation"

export function ArrayDisplay<T>({ arrayObject }: { arrayObject: string }): ReactElement {
  const parsedArrayObject: ArrayDisplayProps<T> = JSON.parse(arrayObject) as ArrayDisplayProps<T>

  const { lang } = useTranslation()

  return (
    <div className="flex pl-2">
      <div className="my-5">
        <table className="w-full border-collapse">
          <thead className="border-b">
            <tr>
              <th className="relative px-4 py-2 text-left">
                Index:
                <Separator orientation={`vertical`} className={`absolute inset-y-0 right-0`} />
              </th>
              {parsedArrayObject.array.map((_, index) => (
                <th key={index} className="px-4 py-2 text-left">
                  {index + parsedArrayObject.startingIndex}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="relative px-4 py-2 text-left">
                {parsedArrayObject.secondRowName[lang]}
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
