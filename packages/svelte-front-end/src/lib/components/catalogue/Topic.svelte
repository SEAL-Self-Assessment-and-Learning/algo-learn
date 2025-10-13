<script lang="ts">
  import TvFooter from "$lib/components/catalogue/TVFooter.svelte"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import type { Language } from "@shared/api/Language.ts"

  interface Props {
    selectedGroup: string | null
    toggleGroup: (slug: string) => void
    g: {
      name: { [key: string]: string }
      slug: string
      description: { [key: string]: string }
      topics: string[]
      contents: Array<any>
    }
  }
  let { selectedGroup, toggleGroup, g }: Props = $props()
  const lang: Language = $derived(getLanguage())
</script>

<div
  role="button"
  tabindex="0"
  aria-expanded={selectedGroup === g.slug}
  onclick={() => toggleGroup(g.slug)}
  onkeydown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      toggleGroup(g.slug)
    }
  }}
  class={`group relative flex w-full cursor-pointer flex-col items-start justify-between rounded-md border p-5 text-left shadow-sm transition-all duration-200
    ${
      selectedGroup === g.slug
        ? "border-goethe ring-goethe bg-blue-50/10 shadow-md ring-1 ring-offset-1 ring-offset-white dark:bg-slate-800 dark:ring-offset-slate-900"
        : "border-gray-200 bg-white hover:border-blue-100 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-300 dark:hover:bg-slate-800"
    }`}
>
  <div class="mb-3 flex w-full items-center justify-between">
    <h2
      class="text-lg leading-tight font-semibold tracking-tight text-gray-900 transition-transform duration-200 group-hover:scale-[1.02] dark:text-gray-100"
      style="word-break: break-word;"
    >
      {g.name[lang]}
    </h2>
  </div>

  <p class="mb-4 text-sm leading-snug text-gray-600 dark:text-gray-300">
    {g.description[lang]}
  </p>
  <TvFooter {g} />
</div>
