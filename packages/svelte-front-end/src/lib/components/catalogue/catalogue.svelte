<script lang="ts">
  import { resolve } from "$app/paths"
  import FilterSortHeader from "$lib/components/catalogue/FilterSortHeader.svelte"
  import SlugIcon from "$lib/components/catalogue/SlugIcon.svelte"
  import TopicsFooter from "$lib/components/catalogue/TopicsFooter.svelte"
  import { Button } from "$lib/components/ui/button"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import type { HTMLAttributes } from "svelte/elements"
  import { X } from "@lucide/svelte"
  import { collection, type QuestionTopic } from "@settings/questionsSelection"
  import type { Language } from "@shared/api/Language"
  import { allParameterCombinations, serializeParameters } from "@shared/api/Parameters.ts"
  import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"

  const { ...rest }: HTMLAttributes<HTMLDivElement> = $props()
  const lang: Language = $derived(getLanguage())

  let selectedTopic: QuestionTopic | "all" = $state("all")
  let sortBy: "Name" | "Default" = $state("Default")
  let selectedGroup: string | null = $state(null)
  let expandedContentEl: HTMLDivElement | null = $state(null)
  // Track showAllVariants per topic (keyed by topic ID or slug)
  let showAllVariants: Record<string, boolean> = $state({})

  function toggleVariants(topicId: string) {
    showAllVariants = { ...showAllVariants, [topicId]: !showAllVariants[topicId] }
  }

  // 1. A reactive variable to hold the current number of columns
  let columns = $state(4) // Default to max columns
  // 2. A ResizeObserver action to detect the active number of columns
  function resizeObserverAction(_node: HTMLElement) {
    void _node // to avoid unused var warning
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
    selectedTopic === "all"
      ? collection
      : collection.filter((g) => g.topics.includes(selectedTopic as QuestionTopic)),
  )

  const sorted = $derived(
    [...filtered].sort((a, b) => {
      // typescript needs this assertion
      if (sortBy === "Default") return 0 // Keep original order
      if (sortBy === "Name") return a.name[lang]!.localeCompare(b.name[lang]!)
      // For default, we can just return 0 to keep the original (filtered) order,
      return 0
    }),
  )

  // 4. A derived store that creates the rows based on the current column count
  const rows = $derived(chunk(sorted, columns))

  function toggleGroup(slug: string) {
    // Toggle open/close instantly
    selectedGroup = selectedGroup === slug ? null : slug

    // Scroll new section into view (optional)
    if (selectedGroup) {
      setTimeout(() => {
        expandedContentEl?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }, 20)
    }
  }
</script>

<div class="mt-4 flex items-center justify-center px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12">
  <div {...rest} class="w-full p-2" use:resizeObserverAction>
    <FilterSortHeader bind:selectedTopic bind:sortBy />

    {#each rows as row (row[0]?.slug)}
      <div class="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {#each row as g (g.slug)}
          <button
            type="button"
            aria-expanded={selectedGroup === g.slug}
            onclick={() => toggleGroup(g.slug)}
            class={`group relative flex w-full cursor-pointer flex-col items-start justify-between rounded-xl border p-5 text-left shadow-sm transition-all duration-200
              ${
                selectedGroup === g.slug
                  ? "border-accent-500 bg-accent-50/50 ring-accent-500 dark:border-accent-400 dark:ring-accent-400 shadow-lg ring-2 ring-offset-2 ring-offset-white dark:bg-slate-800 dark:ring-offset-slate-900"
                  : "hover:border-accent-300 dark:hover:border-accent-500 border-gray-200 bg-white hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
              }`}
          >
            <div class="mb-3 flex w-full items-center justify-between">
              <div class="flex items-center gap-3">
                <SlugIcon slug={g.slug} />

                <h2
                  class="text-lg leading-tight font-semibold tracking-tight text-gray-900 dark:text-gray-100"
                  style="word-break: break-word;"
                >
                  {g.name[lang]}
                </h2>
              </div>
            </div>

            <p class="mb-4 text-sm leading-snug text-gray-600 dark:text-gray-300">
              {g.description[lang]}
            </p>

            <TopicsFooter {g} />
          </button>
        {/each}
      </div>

      {#if row.find((g) => g.slug === selectedGroup)}
        {#each row.filter((g) => g.slug === selectedGroup) as gSelected (gSelected.slug)}
          <div bind:this={expandedContentEl} class="mt-2 mb-8">
            <div
              class="relative rounded-xl border border-slate-300 bg-slate-100 p-6 shadow-inner sm:p-8 dark:border-slate-700 dark:bg-slate-900"
            >
              <button
                onclick={() => (selectedGroup = null)}
                class="absolute top-4 right-4 rounded-full p-1 text-gray-500 transition hover:bg-white/10 hover:text-gray-300"
                title="Close"
              >
                <X class="h-6 w-6" />
              </button>

              <div class="mx-auto max-w-7xl">
                <div class="mb-6 flex flex-wrap items-center">
                  <!-- Topic Name -->
                  <h2 class="mr-4 text-3xl font-bold text-gray-900 dark:text-gray-50">
                    {gSelected.name[lang]}
                  </h2>

                  <!-- Toggle Button -->
                  <button
                    class={`mr-4 transform rounded-full border px-3 py-0.5 text-sm
          font-medium transition-colors duration-200 ease-in-out
          ${
            showAllVariants[gSelected.slug]
              ? "border-accent text-accent hover:border-accent-400 hover:text-accent-400"
              : "border-gray-300 text-gray-800 dark:border-slate-600 dark:text-gray-100 dark:hover:border-gray-400 dark:hover:text-gray-200"
          }`}
                    onclick={() => toggleVariants(gSelected.slug)}
                  >
                    {showAllVariants[gSelected.slug] ? "Hide Variants" : "Show Variants"}
                  </button>
                </div>

                {#if gSelected.contents?.length}
                  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {#each gSelected.contents as generator (generator.name)}
                      <div
                        class="group block rounded-lg border border-gray-300 bg-white p-4 transition-all hover:scale-[1.02] hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                      >
                        <!-- Topic name -->
                        <div class="flex flex-col">
                          <a href={resolve(`/${lang}/${generator.id}`)}>
                            <h3
                              class="group-hover:text-accent-600 dark:group-hover:text-accent-400 font-semibold text-gray-800 transition-colors dark:text-gray-100"
                            >
                              {generator.name(lang)}
                            </h3>
                          </a>
                        </div>

                        {#if generator.description}
                          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {generator.description(lang)}
                          </p>
                        {/if}

                        {#if showAllVariants[gSelected.slug]}
                          <div class="mt-2 flex flex-wrap gap-2">
                            {#each allParameterCombinations(generator.expectedParameters) as parameters (parameters)}
                              {@const path = serializeGeneratorCall({ lang, generator, parameters })}
                              {@const params = serializeParameters(
                                parameters,
                                generator.expectedParameters,
                              )}
                              {#if params}
                                <Button size="xsm" variant="secondary" href={resolve(`/${path}`)}>
                                  {params}
                                </Button>
                              {/if}
                            {/each}
                          </div>
                        {/if}
                      </div>
                    {/each}
                  </div>
                {:else}
                  <p class="text-gray-500 dark:text-gray-400">No generators available.</p>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      {/if}
    {/each}
  </div>
</div>
