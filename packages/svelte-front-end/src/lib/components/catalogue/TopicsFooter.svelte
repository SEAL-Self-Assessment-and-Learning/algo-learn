<script lang="ts">
  import CardTopics from "$lib/components/catalogue/CardTopics.svelte"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import type { Language } from "@shared/api/Language.ts"
  import type { SingleTranslation } from "@shared/utils/translations.ts"

  interface Props {
    g: {
      name: { [key: string]: string }
      slug: string
      topics: string[]
    }
  }
  let { g }: Props = $props()
  const lang: Language = $derived(getLanguage())

  const exploreLang: SingleTranslation = {
    en: "Explore",
    de: "Mehr",
  }
</script>

<div
  class="text-accent dark:text-dark-accent dark:border-dark-border mt-auto flex w-full items-center justify-between border-t pt-3
         text-sm font-medium"
>
  <CardTopics {g} />
  <span
    class="dark:text-dark-accent inline-flex items-center gap-1 text-white transition-transform duration-200
           group-hover:translate-x-1"
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
