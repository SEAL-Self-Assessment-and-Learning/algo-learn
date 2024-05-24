import { GripHorizontal } from "lucide-react"
import { memo, ReactNode } from "react"
import { FaArrowDown, FaArrowUp } from "react-icons/fa"
import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
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
export function SortableList({ items, onChange, className = "", disabled = false, ...props }: Props) {
  const MemoizedButton = memo(Button)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
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
          const activeIndex = itemsWithIds.findIndex(({ id }) => id === active.id)
          const overIndex = itemsWithIds.findIndex(({ id }) => id === over.id)
          onChange(arrayMove(items, activeIndex, overIndex))
        }
      }}
    >
      <SortableContext items={itemsWithIds.map(({ id }) => ({ id }))}>
        <ul
          {...props}
          className={cn("mx-auto flex max-w-max list-none flex-col gap-2", className)}
          role="application"
        >
          {itemsWithIds.map((item, index) => (
            <div key={item.id} className="flex items-center">
              <div className={`inline-block items-center justify-center sm:hidden`}>
                <MemoizedButton
                  variant="ghost"
                  size="sm"
                  className={`${index === 0 ? "invisible" : "visible"} mr-0.5`}
                  onClick={() => onChange(arrayMove(items, index, index - 1))}
                >
                  <FaArrowUp />
                </MemoizedButton>
                <MemoizedButton
                  variant="ghost"
                  size="sm"
                  className={`${index === itemsWithIds.length - 1 ? "invisible" : "visible"} mr-0.5`}
                  onClick={() => onChange(arrayMove(items, index, index + 1))}
                >
                  <FaArrowDown />
                </MemoizedButton>
              </div>
              <SortableList.Item id={item.id} disabled={disabled}>
                <GripHorizontal className="hidden sm:flex" />
                <Button variant="outline" asChild className="flex-grow text-center">
                  <div>{item.element}</div>
                </Button>
                <div></div>
              </SortableList.Item>
            </div>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

SortableList.Item = SortableItem
