import { GripHorizontal } from "lucide-react"
import { ReactNode } from "react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { cn } from "@/lib/utils"
import { SortableItem } from "./SortableItem"
import { Button } from "./ui/button"

export interface BaseItem {
  position: number
  element: ReactNode
}

export interface Props {
  items: BaseItem[]
  onChange: (array: BaseItem[]) => void
  className?: string
  disabled?: boolean
}

/**
 * SortableList is a wrapper for a sortable list.
 *
 * @param props
 * @param props.items The items to be sorted.
 * @param props.onChange A callback to be called when the order of the items
 *   changes.
 * @param props.className A class name to be applied to the list.
 * @param props.disabled Whether the list is disabled.
 * @param props.children Children of the list.
 */
export function SortableList({
  items,
  onChange,
  className = "",
  disabled = false,
  ...props
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )
  if (new Set(items.map(({ position }) => position)).size !== items.length) {
    throw new Error("Duplicate positions in SortableList!")
  }
  const itemsWithIds: Array<{
    id: string
    position: number
    element: ReactNode
  }> = items.map((x) => ({ ...x, id: `id-${x.position}` }))
  return (
    <DndContext
      sensors={sensors}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over?.id) {
          const activeIndex = itemsWithIds.findIndex(
            ({ id }) => id === active.id,
          )
          const overIndex = itemsWithIds.findIndex(({ id }) => id === over.id)
          onChange(arrayMove(items, activeIndex, overIndex))
        }
      }}
    >
      <SortableContext items={itemsWithIds.map(({ id }) => ({ id }))}>
        <ul
          {...props}
          className={cn(
            "mx-auto flex max-w-max list-none flex-col gap-2",
            className,
          )}
          role="application"
        >
          {itemsWithIds.map((item) => (
            <SortableList.Item key={item.id} id={item.id} disabled={disabled}>
              <GripHorizontal />
              <Button variant="outline" asChild>
                <div>{item.element}</div>
              </Button>
              <div></div>
            </SortableList.Item>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

SortableList.Item = SortableItem
