<script lang="ts">
  import Markdown from "$lib/components/markdown/markdown.svelte"
  import { GripVertical } from "lucide-svelte"
  import type { UniqueIdentifier } from "@dnd-kit-svelte/core"
  import { useSortable } from "@dnd-kit-svelte/sortable"
  import { CSS, styleObjectToString } from "@dnd-kit-svelte/utilities"

  interface Item {
    id: UniqueIdentifier
    content: string
  }

  let { task, disabled }: { task: Item; disabled?: boolean } = $props()

  const { attributes, listeners, node, transform, transition, isDragging, isSorting } = useSortable({
    id: task.id,
  })

  const style = $derived(
    styleObjectToString({
      transform: CSS.Transform.toString(transform.current),
      transition: isSorting.current ? transition.current : undefined,
      zIndex: isDragging.current ? 1 : undefined,
    }),
  )
</script>

<div
  class="relative select-none"
  bind:this={node.current}
  {style}
  {...!disabled ? listeners.current : {}}
  {...attributes.current}
>
  <!-- Original element - becomes invisible during drag but maintains dimensions -->
  <div
    class={[
      `flex w-auto items-center rounded-md bg-gray-200 p-4 dark:bg-gray-700`,
      { invisible: isDragging.current },
    ]}
  >
    <GripVertical class={`mr-4 ${disabled ? "" : "hover:cursor-pointer"}`} />
    <Markdown md={task.content} />
  </div>
</div>
