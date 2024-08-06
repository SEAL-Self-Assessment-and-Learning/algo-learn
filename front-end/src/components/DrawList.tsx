import { ReactElement } from "react"
import { Markdown } from "@/components/Markdown.tsx"

export interface ListItem {
  level: number
  text: string
}

export function DrawList({ list }: { list: ListItem[] }): ReactElement {
  const paddingClasses = [
    "pl-0",
    "pl-1",
    "pl-2",
    "pl-3",
    "pl-4",
    "pl-5",
    "pl-6",
    "pl-7",
    "pl-8",
    "pl-9",
    "pl-10",
  ]

  return (
    <div className="my-5">
      <ul>
        {list.map((item, index) => (
          <li key={index} className={paddingClasses[item.level]}>
            • <Markdown md={item.text} />
          </li>
        ))}
      </ul>
    </div>
  )
}
