import { X } from "lucide-react"
import { useDraggable } from "@dnd-kit/core"
import { Button } from "./ui/button"

export function MatchingPoolItem({
  id,
  element,
  disabled = false,
  slotted = false,
  onRemove,
}: {
  id: string
  element: React.ReactNode
  disabled?: boolean
  slotted?: boolean
  onRemove?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : {}

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Button
        variant={slotted ? "outline" : "secondary"}
        className={`flex w-[200px] cursor-move items-center justify-center gap-2 text-center ${
          isDragging ? "opacity-50" : ""
        }`}
        disabled={disabled}
        onClick={() => {
          if (slotted && !disabled && onRemove) onRemove()
        }}
      >
        {element}
        {slotted && !disabled && <X size={16} />}
      </Button>
    </div>
  )
}
