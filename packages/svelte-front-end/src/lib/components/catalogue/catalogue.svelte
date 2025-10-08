<script lang="ts">
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import { quintOut } from "svelte/easing" // import { quintOut } from "svelte/easing"
  import type { HTMLAttributes } from "svelte/elements"
  import { slide } from "svelte/transition"
  import { ListFilterPlus, X } from "@lucide/svelte"
  import { collection } from "@settings/questionsSelection"
  import type { Language } from "@shared/api/Language"

  const { ...rest }: HTMLAttributes<HTMLDivElement> = $props()
  const lang: Language = $derived(getLanguage())

  const topicStyles = {
    math: { icon: "∑", color: "text-red-500" },
    logic: { icon: "↔", color: "text-green-500" },
    graphs: { icon: "⟶", color: "text-blue-500" },
    algorithms: { icon: "⚙", color: "text-purple-500" },
    cs: { icon: "💻", color: "text-indigo-500" },
    "data structures": { icon: "🧱", color: "text-orange-500" },
    default: { icon: "?", color: "text-gray-400" },
  }

  const categories = [
    { id: "math", label: "Math", ...topicStyles.math },
    { id: "logic", label: "Logic", ...topicStyles.logic },
    { id: "graphs", label: "Graphs", ...topicStyles.graphs },
    { id: "algorithms", label: "Algorithms", ...topicStyles.algorithms },
  ]

  let selectedCategory = $state("all")
  let sortBy: "name" | "random" = $state("name")
  let selectedGroup: string | null = $state(null)
  let expandedContentEl: HTMLDivElement | null = $state(null) // For scrolling

  // 1. A reactive variable to hold the current number of columns
  let columns = $state(4) // Default to max columns
  // 2. A ResizeObserver action to detect the active number of columns
  function resizeObserverAction() {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width >= 1024) columns = 4
      else if (width >= 768) columns = 3
      else if (width >= 640) columns = 2
      else columns = 1
    }

    updateColumns() // initial
    window.addEventListener("resize", updateColumns)

    return {
      destroy: () => window.removeEventListener("resize", updateColumns),
    }
  }

  // 3. A utility function to chunk an array
  function chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  const filtered = $derived(
    selectedCategory === "all"
      ? collection
      : collection.filter((g) => g.topics.includes(selectedCategory)),
  )

  const sorted = $derived(
    [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.name[lang]!.localeCompare(b.name[lang]!)
      // For random, we can just return 0 to keep the original (filtered) order,
      // or implement a shuffle if true randomness is needed on each sort change.
      // For now, returning 0 is fine.
      return 0
    }),
  )

  // 4. A derived store that creates the rows based on the current column count
  const rows = $derived(chunk(sorted, columns))

  function toggleGroup(slug: string) {
    const isOpening = selectedGroup !== slug
    selectedGroup = isOpening ? slug : null
    if (isOpening) {
      setTimeout(() => {
        expandedContentEl?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }, 50)
    }
  }
</script>

<!-- Main container -->
<div class="flex items-center justify-center px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12">
  <div {...rest} class="w-full p-2" use:resizeObserverAction>
    <!-- Filter + Sort Header -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-2 sm:gap-4">
        <button
          onclick={() => (selectedCategory = "all")}
          class="flex h-10 items-center justify-center rounded-full border-2 px-4 text-sm font-semibold transition-all
          {selectedCategory === 'all'
            ? 'border-slate-800 bg-slate-800 text-white'
            : 'border-gray-300 text-gray-500 hover:border-black hover:text-black'}"
        >
          All
        </button>
        {#each categories as cat (cat.id)}
          <button
            onclick={() => (selectedCategory = cat.id)}
            title={cat.label}
            class="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all
            {selectedCategory === cat.id
              ? `${cat.color} border-current ring-2 ring-current ring-offset-2`
              : 'border-gray-300 text-gray-400 hover:border-black hover:text-black'}"
          >
            <span class="text-xl font-semibold">{cat.icon}</span>
          </button>
        {/each}
      </div>

      <div class="flex items-center gap-2">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            class="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm transition hover:bg-gray-50"
          >
            <ListFilterPlus class="h-4 w-4" /> Sort by: <span class="font-medium">{sortBy}</span>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item onclick={() => (sortBy = "name")}>Name</DropdownMenu.Item>
            <DropdownMenu.Item onclick={() => (sortBy = "random")}>Random</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>

    <!-- Topic grid -->
    {#each rows as row (row[0]?.slug)}
      <div class="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {#each row as g (g.slug)}
          <button
            type="button"
            aria-expanded={selectedGroup === g.slug}
            class="group flex cursor-pointer flex-col items-center justify-between rounded-xl border p-4 text-center shadow-sm transition-all duration-200 hover:border-blue-500 hover:shadow-lg
    {selectedGroup === g.slug
              ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-500 ring-offset-2'
              : 'border-gray-200 bg-white hover:bg-gray-50'}"
            onclick={() => toggleGroup(g.slug)}
          >
            <div>
              <div class="mb-4 flex justify-center">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 transition-transform group-hover:scale-110"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="h-8 w-8 text-blue-600"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 6v6h4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              <h2 class="mb-2 justify-center text-lg font-bold text-gray-800">{g.name[lang]}</h2>
              <p class="mb-4 text-sm leading-relaxed text-gray-500">"Just a placeholder description."</p>
            </div>

            <div class="mt-auto flex justify-center gap-3 border-t border-gray-100 pt-3">
              {#each g.topics as topic (topic)}
                <div class="text-xl font-semibold" title={topic}>
                  {topicStyles[topic]?.icon || topicStyles.default.icon}
                </div>
              {/each}
            </div>
          </button>
        {/each}
      </div>

      {#if row.find((g) => g.slug === selectedGroup)}
        {#each row.filter((g) => g.slug === selectedGroup) as gSelected (gSelected.slug)}
          <div
            bind:this={expandedContentEl}
            class="mt-2 mb-8"
            transition:slide={{ duration: 350, easing: quintOut }}
          >
            <div class="relative rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-inner sm:p-8">
              <button
                onclick={() => (selectedGroup = null)}
                class="absolute top-4 right-4 text-gray-400 transition hover:text-gray-800"
                title="Close"
              >
                <X class="h-6 w-6" />
              </button>

              <div class="mx-auto max-w-7xl">
                <h2 class="mb-4 text-3xl font-bold text-gray-900">{gSelected.name[lang]}</h2>

                {#if gSelected.contents?.length}
                  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {#each gSelected.contents as x (x.name)}
                      <a
                        href="#"
                        class="group block rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:bg-blue-50"
                      >
                        <h3 class="font-semibold text-gray-800 group-hover:text-blue-800">
                          {x.name(lang)}
                        </h3>
                        {#if x.description}
                          <p class="mt-1 text-sm text-gray-600">{x.description(lang)}</p>
                        {/if}
                      </a>
                    {/each}
                  </div>
                {:else}
                  <p class="text-gray-500 italic">No subtopics yet.</p>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      {/if}
    {/each}
  </div>
</div>
