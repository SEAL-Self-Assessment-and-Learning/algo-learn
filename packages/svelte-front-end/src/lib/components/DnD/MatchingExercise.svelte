<script lang="ts">
  import {
    DndContext,
    DragOverlay,
    type DragStartEvent,
    type DragEndEvent,
  } from "@dnd-kit-svelte/core"
  import { SortableContext } from "@dnd-kit-svelte/sortable"
  import { dropAnimation, sensors } from "$lib/components/DnD/utils.ts"
  import MatchingSlot, { type SlotItem } from "$lib/components/DnD/MatchingSlot.svelte"
  import MatchingPoolItem from "$lib/components/DnD/MatchingPoolItem.svelte"
  import Markdown from "$lib/components/markdown/markdown.svelte"

  export interface Pair {
    id: string
    fixed: string
    answerId: string | null
  }

  interface Props {
    pairs: Pair[]
    answers: SlotItem[]
    disabled?: boolean
    onChange: (slots: (SlotItem | null)[]) => void
  }

  const { pairs, answers, disabled = false, onChange }: Props = $props()

  let slots = $state<(SlotItem | null)[]>(Array(pairs.length).fill(null))
  let pool = $state<SlotItem[]>(structuredClone(answers))
  let activeItem = $state<SlotItem | null>(null)

  function handleDragStart(e: DragStartEvent) {
    const id = String(e.active.id)
    if (id.startsWith("pool-")) {
      const idx = parseInt(id.replace("pool-", ""))
      activeItem = pool[idx]
    } else if (id.startsWith("slot-")) {
      const idx = parseInt(id.replace("slot-", ""))
      activeItem = slots[idx]
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    activeItem = null
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    // pool to slot
    if (activeId.startsWith("pool-") && overId.startsWith("slot-")) {
      const poolIdx = parseInt(activeId.replace("pool-", ""))
      const slotIdx = parseInt(overId.replace("slot-", ""))

      const item = pool[poolIdx]
      const newSlots = [...slots]
      const newPool = [...pool]

      newPool.splice(poolIdx, 1)
      if (newSlots[slotIdx]) newPool.push(newSlots[slotIdx]!)

      newSlots[slotIdx] = item
      slots = newSlots
      pool = newPool
      onChange(newSlots)
    }

    // slot ↔ slot
    if (activeId.startsWith("slot-") && overId.startsWith("slot-")) {
      const fromIdx = parseInt(activeId.replace("slot-", ""))
      const toIdx = parseInt(overId.replace("slot-", ""))

      const newSlots = [...slots]
      ;[newSlots[fromIdx], newSlots[toIdx]] = [newSlots[toIdx], newSlots[fromIdx]]
      slots = newSlots
      onChange(newSlots)
    }
  }

  function returnToPool(slotIndex: number) {
    const item = slots[slotIndex]
    if (!item) return

    const newSlots = [...slots]
    newSlots[slotIndex] = null
    slots = newSlots
    pool = [...pool, item]
    onChange(newSlots)
  }
</script>

<DndContext {sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
  <div class="matching-board flex flex-wrap gap-8">
    <!-- left column: droppable slots -->
    <div class="flex flex-col gap-2">
      {#each pairs as pair, i (pair.id)}
        <MatchingSlot
          id={`slot-${i}`}
          label={pair.fixed}
          item={slots[i]}
          onRemove={() => returnToPool(i)}
          {disabled}
        />
      {/each}
    </div>

    <!-- right column: draggable pool -->
    <SortableContext items={pool.map((_, i) => ({ id: `pool-${i}` }))}>
      <ul class="flex flex-col gap-2">
        {#each pool as item, i (`pool-${i}`)}
          <MatchingPoolItem id={`pool-${i}`} {item} {disabled} />
        {/each}
      </ul>
    </SortableContext>
  </div>

  <DragOverlay {dropAnimation}>
    {#if activeItem}
      <div class="border rounded-md p-2 bg-gray-100 dark:bg-gray-800">
        <Markdown md={activeItem.content ?? ""} />
      </div>
    {/if}
  </DragOverlay>
</DndContext>

<style>
  .matching-board {
    align-items: flex-start;
  }
</style>
