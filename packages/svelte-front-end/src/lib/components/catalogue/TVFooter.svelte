<script lang="ts">
  import TvFooterTopics from "$lib/components/catalogue/TVFooterTopics.svelte"
  import { isMobileOrTablet } from "$lib/utils/deviceInformation.ts"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import type { Language } from "@shared/api/Language.ts"
  import type { QuestionGenerator } from "@shared/api/QuestionGenerator.ts"
  import type { SingleTranslation } from "@shared/utils/translations.ts"

  interface Props {
    g: {
      name: { [key: string]: string }
      slug: string
      topics: string[]
      contents: Array<QuestionGenerator>
    }
  }
  let { g }: Props = $props()
  const lang: Language = $derived(getLanguage())

  const exploreLang: SingleTranslation = {
    en: "Explore",
    de: "Mehr",
  }
</script>

{#if isMobileOrTablet}
  <div
    class="text-accent dark:text-accent-foreground dark:border-dark-border mt-auto flex w-full items-center justify-between border-t pt-3
           text-sm font-medium"
  >
    <TvFooterTopics {g} />
    <span
      class="text-accent dark:text-accent-foreground inline-flex items-center gap-1 transition-transform duration-200 group-hover:translate-x-1"
    >
      <span class="font-medium">{exploreLang[lang]}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="h-4 w-4"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </span>
  </div>
{:else}
  <div
    class="text-accent dark:text-accent-foreground relative mt-auto flex w-full items-center justify-between border-t pt-3
         text-sm font-medium"
  >
    <!-- Topics -->
    <div class="flex items-center gap-2">
      <TvFooterTopics {g} />
    </div>

    <!-- Centered generator info -->
    <div
      class="flex flex-col items-center justify-center rounded-md border p-2 leading-tight text-gray-400 dark:text-gray-300"
    >
      {g.contents.length}
    </div>

    <!-- Explore link -->
    <span
      class="text-accent dark:text-accent-foreground inline-flex items-center gap-1 transition-transform duration-200 group-hover:translate-x-1"
    >
      <span class="font-medium">{exploreLang[lang]}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="h-4 w-4"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </span>
  </div>
{/if}
