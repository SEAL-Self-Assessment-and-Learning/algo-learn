<script lang="ts">
  import { collection } from "@settings/questionsSelection"
  import type { Language } from "@shared/api/Language"
  import QuestionGeneratorCard from "./questionGeneratorCard.svelte"
  import TopicSelectorSidebar from "./topicSelectorSidebar.svelte"

  let selectedGroup: string | null = $state(null)
  let showAllVariants = $state(false)

  interface Props {
    lang: Language
  }
  const { lang }: Props = $props()
</script>

<div class="flex flex-col items-start justify-center gap-6 py-6 sm:flex-row">
  <TopicSelectorSidebar
    {selectedGroup}
    setSelectedGroup={(g) => (selectedGroup = g)}
    {showAllVariants}
    setShowAllVariants={(s) => (showAllVariants = s)}
    {lang}
    class="mx-auto sm:mx-0"
  />
  <div class="w-full">
    {#if selectedGroup}
      <div class="flex flex-col gap-6">
        {#each collection as e}
          {#if e.slug === selectedGroup}
            {#each e.contents as x}
              <QuestionGeneratorCard generator={x} {showAllVariants} class="w-full" {lang} />
            {/each}
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</div>
