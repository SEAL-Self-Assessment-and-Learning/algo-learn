<script lang="ts">
  import Markdown from "$lib/components/markdown/markdown.svelte"
  import Duolingo from "@icons-pack/svelte-simple-icons/icons/SiDuolingo"
  import Github from "@icons-pack/svelte-simple-icons/icons/SiGithub"
  import React from "@icons-pack/svelte-simple-icons/icons/SiReact"
  import { tFunction } from "@shared/utils/translations"
  import CenteredDivs from "@/lib/components/centeredDivs.svelte"
  import { globalTranslations } from "@/lib/translation"
  import type { PageData } from "./$types"

  const props: { data: PageData } = $props()
  const { t } = $derived(tFunction(globalTranslations, props.data.lang))
</script>

<CenteredDivs variant="horizontal">
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
  <h2>{t("About.opensource.label")}</h2>
  <p>
    <Markdown md={t("About.opensource.text")}>
      {#snippet child0()}<React />{/snippet}
      {#snippet child1()}<Github />{/snippet}
    </Markdown>
  </p>
  <h2>{t("About.inspiration.label")}</h2>
  <p>
    <Markdown md={t("About.inspiration.text")}>
      {#snippet child0()}<Duolingo />{/snippet}
    </Markdown>
  </p>
  {" "}
  <h2>{t("About.authors.label")}</h2>
  <p>
    <Markdown md={t("About.authors.text")} />
  </p>
</CenteredDivs>
