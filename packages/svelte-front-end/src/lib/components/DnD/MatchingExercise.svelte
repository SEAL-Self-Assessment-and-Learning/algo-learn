<script lang="ts">
  import MatchingPoolItem from "$lib/components/DnD/MatchingPoolItem.svelte"
  import MatchingSlot, { type SlotItem } from "$lib/components/DnD/MatchingSlot.svelte"
  import { dropAnimation, sensors } from "$lib/components/DnD/utils.ts"
  import Markdown from "$lib/components/markdown/markdown.svelte"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import { onMount } from "svelte"
  import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from "@dnd-kit-svelte/core"
  import { SortableContext } from "@dnd-kit-svelte/sortable"
  import type { Language } from "@shared/api/Language.ts"
  import type { SingleTranslation } from "@shared/utils/translations.ts"

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

  // responsive mode flag
  let isMobile = $state(false)
  let openIndex = $state(-1)

  // translations
  const lang: Language = $derived(getLanguage())
  const matchingTapLang: SingleTranslation = {
    en: "Tap to choose",
    de: "Tippe zum Auswählen",
  }
  const matchingChosenLang: SingleTranslation = {
    en: "Chosen",
    de: "Ausgewählt",
  }

  onMount(() => {
    const check = () => (isMobile = window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  })

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

  // mobile dropdown handler
  function handleSelectChange(slotIdx: number, value: string) {
    const newSlots = [...slots]
    const selected = answers.find((a) => a.id === value) ?? null

    // if selected item is already assigned elsewhere, unassign it first
    if (selected) {
      const prevIdx = newSlots.findIndex((s, i) => s?.id === value && i !== slotIdx)
      if (prevIdx >= 0) newSlots[prevIdx] = null
    }

    newSlots[slotIdx] = selected
    slots = newSlots
    onChange(newSlots)
  }

  function isAlreadyUsed(id: string, currentIdx: number) {
    return slots.some((s, idx) => s?.id === id && idx !== currentIdx)
  }
</script>

{#if !isMobile}
  <!-- Desktop DnD -->
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
{:else}
  <!-- Mobile: dropdown -->
  <div class="grid gap-3 p-2">
    {#each pairs as pair, i (pair.id)}
      <div class="flex flex-col gap-1 rounded-md border p-2 dark:border-gray-700 dark:bg-gray-900">
        <div
          class="flex cursor-pointer items-center justify-between select-none"
          on:click={() => (openIndex = openIndex === i ? -1 : i)}
        >
          <Markdown md={pair.fixed} />
          <span class="text-sm text-gray-400">
            {slots[i] ? matchingChosenLang[lang] : matchingTapLang[lang]}
          </span>
        </div>

        {#if openIndex === i}
          <div class="mt-2 grid gap-1">
            {#each answers as ans (ans.id)}
              {@const alreadyUsed = isAlreadyUsed(ans.id, i)}
              <button
                type="button"
                class={`w-full rounded-md border p-2 text-left text-sm transition-colors
                  ${
                    slots[i]?.id === ans.id
                      ? "bg-goethe text-white"
                      : alreadyUsed
                        ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                        : "hover:bg-goethe/10 dark:hover:bg-goethe/20"
                  }`}
                on:click={() => {
                  handleSelectChange(i, ans.id)
                  openIndex = -1
                }}
              >
                <Markdown md={ans.content} />
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<style>
  .matching-board {
    align-items: flex-start;
  }
</style>
