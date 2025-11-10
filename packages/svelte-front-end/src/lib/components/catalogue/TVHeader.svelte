<script lang="ts">
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import type { Language } from "@shared/api/Language.ts"
  import type { QuestionGenerator } from "@shared/api/QuestionGenerator.ts"
  import type { SingleTranslation } from "@shared/utils/translations.ts"

  interface Props {
    gSelected: {
      slug: string
      name: Readonly<Partial<Record<Language, string>>>
      contents: QuestionGenerator[]
    }
    showAllVariants: Record<string, boolean>
  }
  let { gSelected, showAllVariants = $bindable<Record<string, boolean>>({}) }: Props = $props()
  const lang: Language = $derived(getLanguage())

  const showVariantsLang: SingleTranslation = {
    en: "Show Variants",
    de: "Varianten anzeigen",
  }
  const hideVariantsLang: SingleTranslation = {
    en: "Hide Variants",
    de: "Varianten ausblenden",
  }

  function toggleVariants(topicId: string) {
    showAllVariants = { ...showAllVariants, [topicId]: !showAllVariants[topicId] }
  }
</script>

<div class="mb-6 flex flex-wrap items-center">
  <!-- Topic Name -->
  <h2 class="mr-4 text-3xl font-bold text-gray-900 dark:text-gray-50">
    {gSelected.name[lang]}
  </h2>

  <!-- Toggle Button -->
  {#if gSelected.contents.some((x) => x.expectedParameters.length > 0)}
    <button
      class={`mr-4 transform rounded-md border px-3 py-0.5 text-sm font-medium transition-colors duration-200 ease-in-out
        ${
          showAllVariants[gSelected.slug]
            ? // Active state
              "border-accent bg-accent text-accent-foreground dark:border-accent dark:bg-accent dark:text-accent-foreground hover:brightness-110 dark:hover:brightness-110"
            : // Inactive state
              "hover:border-accent hover:text-accent dark:hover:border-accent dark:hover:text-accent-foreground border-gray-300 text-gray-800 hover:bg-blue-50 dark:border-slate-600 dark:text-gray-100 dark:hover:bg-slate-700/60"
        }`}
      onclick={() => toggleVariants(gSelected.slug)}
    >
      {showAllVariants[gSelected.slug] ? hideVariantsLang[lang] : showVariantsLang[lang]}
    </button>
  {/if}
</div>
