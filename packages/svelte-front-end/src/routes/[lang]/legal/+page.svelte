<script lang="ts">
  import Markdown from "$lib/components/markdown/markdown.svelte"
  import { tFunction } from "@shared/utils/translations"
  import { globalTranslations } from "@/lib/translation"
  import type { PageData } from "./$types"

  const props: { data: PageData } = $props()
  const { t } = $derived(tFunction(globalTranslations, props.data.lang))
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
