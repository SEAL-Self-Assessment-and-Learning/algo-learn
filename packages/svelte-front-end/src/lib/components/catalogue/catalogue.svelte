<script lang="ts">
  import { cn } from "$lib/utils.js"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import type { HTMLAttributes } from "svelte/elements"
  import { collection } from "@settings/questionsSelection"
  import type { Language } from "@shared/api/Language"
  import CenteredDivs from "../centeredDivs.svelte"
  import QuestionGeneratorCard from "./questionGeneratorCard.svelte"
  import TopicSelectorSidebar from "./topicSelectorSidebar.svelte"

  let selectedGroup: string | null = $state(null)
  let showAllVariants = $state(false)

  interface Props extends HTMLAttributes<HTMLDivElement> {
    lang: Language
  }
  const { ...rest }: Props = $props()
  const lang: Language = $derived(getLanguage())
</script>

<CenteredDivs variant="horizontal">
  <div
    {...rest}
    class={cn("flex flex-col items-start justify-center gap-6 py-6 sm:flex-row", rest.class)}
  >
    <TopicSelectorSidebar
      {selectedGroup}
      setSelectedGroup={(g) => (selectedGroup = g)}
      {showAllVariants}
      setShowAllVariants={(s) => (showAllVariants = s)}
      class="mx-auto sm:mx-0"
    />
    <div class="w-full">
      {#if selectedGroup}
        <div class="flex flex-col gap-4">
          {#each collection as e (e.slug)}
            {#if e.slug === selectedGroup}
              {#each e.contents as x (x.name)}
                <QuestionGeneratorCard generator={x} {showAllVariants} class="w-full" {lang} />
              {/each}
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  </div>
</CenteredDivs>
