<script lang="ts">
  import Markdown from "$lib/components/markdown/markdown.svelte"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import type { Language } from "@shared/api/Language.ts"
  import { tFunction } from "@shared/utils/translations"
  import { globalTranslations } from "@/lib/translation"

  const lang: Language = $derived(getLanguage())
  const { t } = $derived(tFunction(globalTranslations, lang))
</script>

<h1>{t("Legal.label")}</h1>
<p>{t("Legal.text")}</p>
<p>
  <Markdown md={t("Legal.detailed.text")} />
</p>
<h2>{t("Legal.authors.label")}</h2>
<p>
  <Markdown md={t("Legal.authors.text")} />
</p>
