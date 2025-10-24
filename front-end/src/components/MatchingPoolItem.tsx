import { useDraggable } from "@dnd-kit/core"
import { Button } from "./ui/button"

export function MatchingPoolItem({
  id,
  element,
  disabled,
}: {
  id: string
  element: React.ReactNode
  disabled?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Button
        variant="secondary"
        className={`w-full max-w-[320px] min-w-[200px] cursor-move text-center ${isDragging ? "opacity-50" : ""}`}
        disabled={disabled}
        type="button"
      >
        {element}
      </Button>
    </div>
  )
}
