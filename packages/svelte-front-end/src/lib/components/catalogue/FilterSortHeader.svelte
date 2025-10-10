<script lang="ts">
  import { topicColorBorder, topicColorsBG } from "$lib/components/catalogue/utils.ts"
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js"
  import { getLanguage } from "$lib/utils/langState.svelte.js"
  import { ListFilterPlus } from "@lucide/svelte"
  import { allQuestionTopics, topicNames, type QuestionTopic } from "@settings/questionsSelection.js"
  import type { Language } from "@shared/api/Language.ts"

  interface Props {
    selectedTopic?: QuestionTopic | "all"
    sortBy?: "Name" | "Default"
  }
  // Mark props as bindable and provide defaults
  let {
    selectedTopic = $bindable<QuestionTopic | "all">("all"),
    sortBy = $bindable<"Name" | "Default">("Default"),
  }: Props = $props()

  const lang: Language = $derived(getLanguage())
</script>

<div class="mb-6 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
  <div class="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
    <button
      onclick={() => (selectedTopic = "all")}
      class="flex h-8 items-center justify-center rounded-full border-2 px-3 text-xs font-medium transition-all
      {selectedTopic === 'all'
        ? 'border-slate-800 bg-slate-800 text-white dark:border-slate-300 dark:bg-slate-300 dark:text-gray-900'
        : 'border-gray-300 text-gray-500 hover:border-black hover:text-black dark:border-gray-700 dark:text-gray-400 dark:hover:border-white dark:hover:text-white'}"
    >
      All
    </button>

    {#each allQuestionTopics as topic (topic)}
      <button
        onclick={() => (selectedTopic = topic)}
        title={topic}
        class={`flex h-7 transform-gpu items-center justify-center rounded-full border px-3 text-xs font-medium transition-all hover:scale-105
                  hover:brightness-95 dark:hover:brightness-110
          ${
            selectedTopic === topic
              ? `${topicColorsBG[topic]} border-transparent text-white`
              : `text-gray-700 dark:text-gray-300 ${topicColorBorder[topic]}`
          }`}
      >
        {topicNames[topic][lang]}
      </button>
    {/each}
  </div>

  <div class="mt-2 flex w-full sm:mt-0 sm:w-auto">
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        class="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm transition hover:bg-gray-50 sm:w-auto sm:justify-start
               dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        <ListFilterPlus class="h-4 w-4" /> Sort by: <span class="font-medium">{sortBy}</span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onclick={() => (sortBy = "Name")}>Name</DropdownMenu.Item>
        <DropdownMenu.Item onclick={() => (sortBy = "Default")}>Default</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
</div>
