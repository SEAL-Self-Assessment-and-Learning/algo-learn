<script lang="ts">
  import Markdown from "@/lib/components/markdown.svelte"

  const props = $props()
  const { t } = $derived(props.data)
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
