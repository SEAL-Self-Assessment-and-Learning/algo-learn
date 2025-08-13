import { X } from "lucide-react"
import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { Markdown } from "./Markdown"
import { Button } from "./ui/button"

export function MatchingSlot({
  index,
  label,
  item,
  onRemove,
  disabled = false,
}: {
  index: number
  label: string
  item: { position: number; element: React.ReactNode } | null
  onRemove: () => void
  disabled?: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${index}` })

  return (
    <div className="flex items-center gap-2">
      {/* left label */}
      <div
        className={cn(
          "flex min-h-[40px] flex-grow items-center justify-center rounded-md border px-3 py-2 text-center",
          "border-neutral-600/40 bg-neutral-800/40 text-neutral-300",
        )}
      >
        <Markdown md={label} />
      </div>

      {/* right droppable area */}
      <div
        ref={setNodeRef}
        className={cn(
          "relative w-[200px] rounded-md border px-2 py-1",
          "flex items-center justify-between gap-2",
          isOver ? "border-blue-500 bg-blue-800/30" : "border-dashed border-neutral-500",
        )}
      >
        {item && (
          <>
            <div className="flex-grow break-words text-center">{item.element}</div>
            {!disabled && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onRemove}
                className="h-6 w-6 shrink-0 text-red-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
