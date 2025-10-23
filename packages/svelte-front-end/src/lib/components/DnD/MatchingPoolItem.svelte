<script lang="ts">
  import { useDraggable } from "@dnd-kit-svelte/core"
  import Markdown from "$lib/components/markdown/markdown.svelte"

  export interface SlotItem {
    id: string
    content: string
  }

  interface Props {
    id: string
    item: SlotItem
    disabled?: boolean
  }

  const { id, item, disabled = false }: Props = $props()

  const drag = useDraggable({ id })

  const dragStyle = $derived(
    drag.transform.current
      ? `transform: translate(${drag.transform.current.x}px, ${drag.transform.current.y}px)`
      : "",
  )
</script>

<li
  bind:this={drag.node.current}
  style={dragStyle}
  {...(!disabled ? { ...drag.attributes.current, ...drag.listeners.current } : {})}
  class={`border rounded-md p-2 select-none text-center cursor-move transition-all
          ${disabled ? "opacity-60" : "hover:bg-goethe"}
          dark:border-gray-700`}
>
  <Markdown md={item.content ?? ""} />
</li>
