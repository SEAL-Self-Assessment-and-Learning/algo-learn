import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { ReactNode } from "react"
import { RxDragHandleHorizontal } from "react-icons/rx"
import { AnswerBox } from "./AnswerBox"

import { DragHandle, SortableItem } from "./SortableItem"

interface BaseItem {
  key: UniqueIdentifier
  element: ReactNode
}

interface Props<T extends BaseItem> {
  items: T[]
  onChange: (array: T[]) => void
  className?: string
  disabled?: boolean
}

export function SortableList<T extends BaseItem>({
  items,
  onChange,
  className = "",
  disabled = false,
  ...props
}: Props<T>) {
  // const [active, setActive] = useState<Active | null>(null)
  // const activeItem = useMemo(
  //   () => items.find((item) => item.key === active?.id),
  //   [active, items]
  // )
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  return (
    <DndContext
      sensors={sensors}
      // onDragStart={({ active }) => {
      //   setActive(active)
      // }}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over?.id) {
          const activeIndex = items.findIndex(({ key }) => key === active.id)
          const overIndex = items.findIndex(({ key }) => key === over.id)
          onChange(arrayMove(items, activeIndex, overIndex))
        }
        // setActive(null)
      }}
      onDragCancel={() => {
        // setActive(null)
      }}
    >
      {/* <DragOverlay dropAnimation={null}>
      {activeItem ? activeItem.element : null}
      </DragOverlay> */}
      <SortableContext
        items={items.map(({ key }) => ({
          id: key,
        }))}
      >
        <ul
          {...props}
          className={`mx-auto flex max-w-max list-none flex-col gap-2 ${className}`}
          role="application"
        >
          {items.map((item) => (
            <SortableList.Item key={item.key} id={item.key} disabled={disabled}>
              <RxDragHandleHorizontal />
              <AnswerBox TagName="div" disabled={disabled}>
                {item.element}
              </AnswerBox>
              <div></div>
            </SortableList.Item>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

SortableList.Item = SortableItem
SortableList.DragHandle = DragHandle
