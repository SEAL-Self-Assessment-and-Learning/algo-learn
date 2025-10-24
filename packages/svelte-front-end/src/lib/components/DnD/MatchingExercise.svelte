<script lang="ts">
  import MatchingPoolItem from "$lib/components/DnD/MatchingPoolItem.svelte"
  import MatchingSlot, { type SlotItem } from "$lib/components/DnD/MatchingSlot.svelte"
  import { dropAnimation, sensors } from "$lib/components/DnD/utils.ts"
  import Markdown from "$lib/components/markdown/markdown.svelte"
  import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from "@dnd-kit-svelte/core"
  import { SortableContext } from "@dnd-kit-svelte/sortable"

  export interface Pair {
    id: string
    fixed: string
    answerId: string | null
  }

  interface Props {
    pairs: Pair[]
    answers: SlotItem[] // MUST have a stable `id: string` property
    disabled?: boolean
    onChange: (slots: (SlotItem | null)[]) => void
  }

  const { pairs, answers, disabled = false, onChange }: Props = $props()

  // pool uses the supplied items (cloned so we don't mutate caller's array)
  let pool = $state<SlotItem[]>(structuredClone(answers))
  let slots = $state<(SlotItem | null)[]>(Array(pairs.length).fill(null))
  let activeItem = $state<SlotItem | null>(null)

  // helper: find by stable id
  function findPoolIndexById(id: string) {
    return pool.findIndex((it) => it.id === id)
  }

  function handleDragStart(e: DragStartEvent) {
    const id = String(e.active.id)
    // slot ids are "slot-<idx>", pool items are their own stable ids
    if (id.startsWith("slot-")) {
      const slotIdx = parseInt(id.replace("slot-", ""))
      activeItem = slots[slotIdx] ?? null
    } else {
      // pool item id
      const poolIdx = findPoolIndexById(id)
      activeItem = poolIdx >= 0 ? pool[poolIdx] : null
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e

    // clear the overlay immediately (prevent stale overlay)
    const prevActive = activeItem
    activeItem = null

    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    // pool item → slot
    // pool ids are the stable item ids; over is slot-<idx>
    if (!activeId.startsWith("slot-") && overId.startsWith("slot-")) {
      const slotIdx = parseInt(overId.replace("slot-", ""))
      const poolIdx = findPoolIndexById(activeId)
      if (poolIdx < 0) return

      const item = prevActive ?? pool[poolIdx]
      const newSlots = [...slots]
      const newPool = [...pool]

      // remove the dragged item from pool
      newPool.splice(poolIdx, 1)

      // if target slot had an item, return it to the pool
      if (newSlots[slotIdx]) {
        newPool.push(newSlots[slotIdx]!)
      }

      newSlots[slotIdx] = item
      slots = newSlots
      pool = newPool
      onChange(newSlots)
      return
    }

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

    // slot ↔ slot swap
    if (activeId.startsWith("slot-") && overId.startsWith("slot-")) {
      const fromIdx = parseInt(activeId.replace("slot-", ""))
      const toIdx = parseInt(overId.replace("slot-", ""))

      const newSlots = [...slots]
      ;[newSlots[fromIdx], newSlots[toIdx]] = [newSlots[toIdx], newSlots[fromIdx]]
      slots = newSlots
      onChange(newSlots)
      return
    }
  }

  // called by MatchingSlot remove button
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

<DndContext
  {sensors}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
  onDragCancel={() => (activeItem = null)}
>
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
    <!-- SortableContext expects a list of ids (strings) that are stable -->
    <SortableContext items={pool.map((it) => it.id)}>
      <ul class="flex flex-col gap-2">
        {#each pool as item (item.id)}
          <MatchingPoolItem id={item.id} {item} {disabled} />
        {/each}
      </ul>
    </SortableContext>
  </div>

  <DragOverlay {dropAnimation}>
    {#if activeItem}
      <div class="rounded-md border bg-gray-100 p-2 text-center dark:bg-gray-800">
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
