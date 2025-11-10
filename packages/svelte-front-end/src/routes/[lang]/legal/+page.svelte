<script lang="ts">
  import Footer from "$lib/components/footer.svelte"
  import Markdown from "$lib/components/markdown/markdown.svelte"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import type { Language } from "@shared/api/Language.ts"
  import { tFunction } from "@shared/utils/translations"
  import CenteredDivs from "@/lib/components/centeredDivs.svelte"
  import { globalTranslations } from "@/lib/translation"

  const lang: Language = $derived(getLanguage())
  const { t } = $derived(tFunction(globalTranslations, lang))
</script>

<CenteredDivs variant="horizontal">
  {@render legal()}
  {@render detailedImprint()}
  {@render authors()}
</CenteredDivs>
<Footer />

{#snippet legal()}
  <div class="pl-2 text-4xl font-extrabold">
    {t("Legal.label")}
  </div>
  {@render sep()}
  <div class="mb-4 px-2 leading-relaxed dark:text-gray-200">
    {t("Legal.text")}
  </div>
{/snippet}

{#snippet detailedImprint()}
  <div class="mb-4 px-2 leading-relaxed dark:text-gray-200">
    <Markdown md={t("Legal.detailed.text")} />
  </div>
{/snippet}

{#snippet authors()}
  <div class="pt-3 pb-1 pl-2 text-2xl font-bold">
    {t("Legal.authors.label")}
  </div>
  <div class="mb-4 px-2 leading-relaxed dark:text-gray-200">
    <Markdown md={t("Legal.authors.text")} />
  </div>
{/snippet}

{#snippet sep()}
  <div class="flex flex-col items-center">
    <hr class="my-4 w-full border-t-2 border-gray-300 dark:border-gray-700" />
  </div>
{/snippet}
