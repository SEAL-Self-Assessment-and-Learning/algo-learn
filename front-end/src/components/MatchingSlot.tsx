import { useDraggable, useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { Markdown } from "./Markdown"

export function MatchingSlot({
  row,
  label,
  item: items,
  onRemove,
  disabled = false,
}: {
  row: number
  label: string
  item: ({ position: number; element: React.ReactNode } | null)[]
  onRemove: (col: number) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-start gap-2">
      {/* left label */}
      <div
        className={cn(
          "flex min-h-[40px] min-w-[120px] items-center justify-center rounded-md border px-3 py-2 text-center",
          "border-neutral-600/40 bg-neutral-800/40 text-neutral-300",
        )}
      >
        <Markdown md={label} />
      </div>

      {/* right droppable area */}
      {items.map((item, colIdx) => {
        const dropId = `slot-${row}-${colIdx}`
        const { setNodeRef: setDropRef, isOver } = useDroppable({ id: dropId })

        const {
          attributes,
          listeners,
          setNodeRef: setDragRef,
          transform,
          isDragging,
        } = useDraggable({ id: dropId })

        const dragStyle = transform
          ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
          : undefined

        return (
          <div
            key={colIdx}
            ref={setDropRef}
            className={cn(
              "relative flex min-h-[40px] max-w-[320px] min-w-[200px] items-stretch justify-stretch rounded-md border",
              "transition-colors",
              isOver ? "border-blue-500 bg-blue-800/30" : "border-dashed border-neutral-500",
            )}
          >
            {item && (
              <div className="relative w-full px-2 py-2">
                {/* drag only on inner wrapper */}
                <div
                  ref={setDragRef}
                  style={dragStyle}
                  {...attributes}
                  {...listeners}
                  className={cn(
                    "cursor-move pr-6", // room for button
                    isDragging ? "opacity-60" : "",
                  )}
                >
                  {item.element}
                </div>

                {/* button outside drag target */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemove(colIdx)
                    }}
                    className="absolute top-1 right-1 z-10 inline-flex h-6 w-6 items-center justify-center rounded-md border border-red-400/60 text-red-400 hover:bg-red-500/10"
                    aria-label="Remove"
                    tabIndex={0}
                  >
                    ×
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
