<script lang="ts">
  import { topicColorsBG } from "$lib/components/catalogue/utils.ts"
  import MyTooltip from "$lib/components/ui/MyTooltip.svelte"
  import { isMobileOrTablet } from "$lib/utils/deviceInformation.ts"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import { Tooltip } from "bits-ui"
  import { topicNames, type QuestionTopic } from "@settings/questionsSelection.ts"
  import type { Language } from "@shared/api/Language.ts"
  import type { SingleTranslation } from "@shared/utils/translations.ts"

  interface Props {
    g: {
      topics: string[]
    }
  }
  const { g }: Props = $props()

  const topicName: SingleTranslation = {
    en: "Topic",
    de: "Thema",
  }
  const topicsName: SingleTranslation = {
    en: "Topics",
    de: "Themen",
  }

  const lang: Language = $derived(getLanguage())
</script>

{#if isMobileOrTablet}
  <div class="mr-2 flex flex-wrap justify-center gap-1.5">
    {#each g.topics as topic (topic)}
      <div
        class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200
               dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        title={topic}
      >
        {topicNames[topic as QuestionTopic][lang]}
      </div>
    {/each}
  </div>
{:else}
  <Tooltip.Provider>
    <MyTooltip
      contentProps={{
        side: "top",
        align: "center",
      }}
    >
      {#snippet trigger()}
        <div
          class="flex cursor-default flex-col items-start gap-1 text-gray-600 transition-colors hover:text-gray-800 hover:underline
                 dark:text-gray-300 dark:hover:text-gray-100"
        >
          <div>
            {g.topics.length}
            {g.topics.length === 1 ? topicName[lang] : topicsName[lang]}
          </div>

          <div class="flex gap-1">
            {#each g.topics as topic (topic)}
              <span
                class="ml-0.5 h-1.5 w-1.5 rounded-full {topicColorsBG[topic as QuestionTopic] ??
                  'bg-gray-400 dark:bg-gray-600'}"
              ></span>
            {/each}
          </div>
        </div>
      {/snippet}

      <div
        class="mb-1 flex max-w-[200px] flex-wrap justify-center gap-1 text-[0.7rem] leading-tight text-gray-700"
      >
        {#each g.topics as topic (topic)}
          <div
            class="rounded-sm bg-gray-100 px-1.5 py-[1px] whitespace-nowrap transition-colors hover:bg-gray-200
                   dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {topicNames[topic as QuestionTopic][lang]}
          </div>
        {/each}
      </div>
    </MyTooltip>
  </Tooltip.Provider>
{/if}
