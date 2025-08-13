import { useState } from "react"
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext } from "@dnd-kit/sortable"
import { cn } from "@/lib/utils"
import { MatchingPoolItem } from "./MatchingPoolItem"
import { MatchingSlot } from "./MatchingSlot"
import type { BaseItem } from "./SortableList"

export function MatchingBoard({
  leftItems,
  rightItems,
  onChange,
  className = "",
  disabled = false,
}: {
  leftItems: string[]
  rightItems: BaseItem[]
  onChange: (slots: (BaseItem | null)[]) => void
  className?: string
  disabled?: boolean
}) {
  const sensors = useSensors(useSensor(PointerSensor))

  const [slots, setSlots] = useState<(BaseItem | null)[]>(Array(leftItems.length).fill(null))
  const [pool, setPool] = useState<BaseItem[]>(rightItems)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = String(active.id)
    const overId = String(over.id)

    // move from pool to slot
    if (activeId.startsWith("pool-") && overId.startsWith("slot-")) {
      const poolIdx = parseInt(activeId.replace("pool-", ""))
      const slotIdx = parseInt(overId.replace("slot-", ""))

      const item = pool[poolIdx]
      const newSlots = [...slots]
      const newPool = [...pool]

      // remove from pool
      newPool.splice(poolIdx, 1)

      // if slot is occupied, return previous tenant to pool
      if (newSlots[slotIdx]) newPool.push(newSlots[slotIdx])

      newSlots[slotIdx] = item
      setSlots(newSlots)
      setPool(newPool)
      onChange(newSlots)
    }

    // move between slots
    if (activeId.startsWith("slot-") && overId.startsWith("slot-")) {
      const fromIdx = parseInt(activeId.replace("slot-", ""))
      const toIdx = parseInt(overId.replace("slot-", ""))

      const newSlots = [...slots]
      ;[newSlots[fromIdx], newSlots[toIdx]] = [newSlots[toIdx], newSlots[fromIdx]]
      setSlots(newSlots)
      onChange(newSlots)
    }
  }

  const returnToPool = (slotIndex: number) => {
    const item = slots[slotIndex]
    if (!item) return

    const newSlots = [...slots]
    newSlots[slotIndex] = null

    setSlots(newSlots)
    setPool((p) => [...p, item])
    onChange(newSlots)
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className={cn("flex flex-wrap gap-8", className)}>
        {/* matching rows */}
        <div className="flex flex-col gap-2">
          {leftItems.map((label, i) => (
            <MatchingSlot
              key={i}
              row={i}
              label={label}
              item={[slots[i]]} // wrap in array
              onRemove={() => returnToPool(i)}
              disabled={disabled}
            />
          ))}
        </div>

        {/* draggable pool */}
        <SortableContext items={pool.map((_, idx) => ({ id: `pool-${idx}` }))}>
          <ul className="flex flex-col gap-2">
            {pool.map((item, idx) => (
              <MatchingPoolItem
                key={idx}
                id={`pool-${idx}`}
                element={item.element}
                disabled={disabled}
              />
            ))}
          </ul>
        </SortableContext>
      </div>
    </DndContext>
  )
}
