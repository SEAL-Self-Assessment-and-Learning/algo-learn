<script lang="ts">
  import { Duolingo, Github, React } from "@designthen/svelte-icons/simple-icons"
  import Markdown from "@/lib/components/markdown.svelte"

  const props = $props()
  const { t } = $derived(props.data)
</script>

<h1>{t("About.label")}</h1>
<p>{t("About.text")}</p>
<h2>{t("About.activeLearning.label")}</h2>
<p>{t("About.activeLearning.text")}</p>
<h2>{t("About.spacedRepetition.label")}</h2>
<p>
  <Markdown md={t("About.spacedRepetition.text")} />
</p>
<h2>{t("About.individuallyAdaptive.label")}</h2>
<p>
  <Markdown md={t("About.individuallyAdaptive.text")} />
</p>
<h2>{t("About.development.label")}</h2>
<p>
  <Markdown md={t("About.development.text")} />
</p>
<h2>{t("About.sourceCode.label")}</h2>
<p>
  <Markdown md={t("About.sourceCode.text")}>
    {#snippet child0()}<React class="w-4" />{/snippet}
    {#snippet child1()}<Github class="w-4" />{/snippet}
  </Markdown>
</p>
<h2>{t("About.inspiration.label")}</h2>
<p>
  <Markdown md={t("About.inspiration.text")}>
    {#snippet child0()}<Duolingo class="w-4" />{/snippet}
  </Markdown>
</p>
{" "}
<h2>{t("About.authors.label")}</h2>
<p>
  <Markdown md={t("About.authors.text")} />
</p>
