<script lang="ts">
  import Markdown from "$lib/components/markdown/markdown.svelte"
  import { useDraggable, useDroppable } from "@dnd-kit-svelte/core"

  export interface SlotItem {
    id: string
    content: string
  }

  interface Props {
    id: string
    item: SlotItem | null
    onRemove: () => void
    disabled?: boolean
  }

  const { id, item, onRemove, disabled = false }: Props = $props()

  const drop = useDroppable({ id })
  const drag = useDraggable({ id })

  $effect(() => {
    // prevent dragging when disabled
    if (disabled) drag.node.current = null
  })

  const dragStyle = $derived(
    drag.transform.current
      ? `transform: translate(${drag.transform.current.x}px, ${drag.transform.current.y}px)`
      : "",
  )
</script>

<div
  bind:this={drop.node.current}
  class={`relative flex min-h-[40px] w-full items-center justify-center rounded-md border transition-colors
          ${
            drop.isOver.current
              ? "border-blue-500 bg-blue-800/30"
              : "border-dashed border-gray-500/60 dark:border-gray-600/60"
          }`}
>
  {#if item}
    <div
      bind:this={drop.node.current}
      class={`relative flex min-h-[40px] w-full items-center justify-center rounded-md border border-gray-500/40 bg-gray-100/40
          transition-colors dark:border-gray-600/40 dark:bg-gray-900/40
          ${drop.isOver.current ? "border-blue-500 bg-blue-500/10" : ""}`}
    >
      {#if item}
        <div class="relative w-full px-2 py-2">
          <div
            bind:this={drag.node.current}
            style={dragStyle}
            {...!disabled ? { ...drag.attributes.current, ...drag.listeners.current } : {}}
            class={`cursor-move text-center ${drag.isDragging.current ? "opacity-60" : ""}`}
          >
            <Markdown md={item.content} />
          </div>

          {#if !disabled}
            <button
              type="button"
              onclick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              class="absolute top-1 right-1 z-10 inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-400/40 text-gray-400 hover:border-blue-500 hover:text-blue-500"
              aria-label="Undo"
            >
              ↺
            </button>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>
