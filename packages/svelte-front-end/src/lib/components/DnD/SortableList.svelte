<script lang="ts">
  import Droppable from "$lib/components/DnD/droppable.svelte"
  import { crossfade } from "svelte/transition"
  import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from "@dnd-kit-svelte/core"
  import { arrayMove, SortableContext } from "@dnd-kit-svelte/sortable"
  import SortableItem from "./SortableItem.svelte"
  import { dropAnimation, sensors } from "./utils.ts"

  export interface Item {
    id: string
    position: number
    content: string
  }

  interface Props {
    initItems: Item[]
    onChange: (array: Item[]) => void
    disabled: boolean
  }
  const { initItems, onChange, disabled }: Props = $props()

  const items = $derived<Item[]>(initItems)
  let activeId = $state<string | null>(null)
  const activeItem = $derived(items.find((item) => item.id === activeId))

  function handleDragStart(event: DragStartEvent) {
    activeId = event.active.id as string
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over) return

    const overItem = $state.snapshot(items.find((item) => item.id === over?.id))
    if (!overItem || activeId === overItem.id) return

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    onChange(arrayMove(items, oldIndex, newIndex))

    activeId = null
  }

  const [send, receive] = crossfade({ duration: 100 })
</script>

<DndContext {sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
  <div class="flex items-center justify-center">
    {@render taskList("in-progress", items)}
  </div>

  <DragOverlay {dropAnimation}>
    {#if activeItem && activeId}
      <SortableItem task={activeItem} />
    {/if}
  </DragOverlay>
</DndContext>

{#snippet taskList(id: string, tasks: Item[])}
  <SortableContext items={tasks}>
    <Droppable class="p-3 pt-6" {id}>
      <div class="grid gap-2">
        {#each tasks as task (task.id)}
          <div class="" in:receive={{ key: task.id }} out:send={{ key: task.id }}>
            <SortableItem {task} {disabled} />
          </div>
        {/each}
      </div>
    </Droppable>
  </SortableContext>
{/snippet}
