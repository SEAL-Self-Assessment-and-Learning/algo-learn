import { ReactElement } from "react"
import { ArrayDisplayProps } from "@shared/utils/arrayDisplayCodeBlock"
import { Markdown } from "@/components/Markdown.tsx"

export function ArrayDisplay<T>({ arrayObject }: { arrayObject: string }): ReactElement {
  const parsedArrayObject: ArrayDisplayProps<T> = JSON.parse(arrayObject) as ArrayDisplayProps<T>

  return <>TMP</>
}
