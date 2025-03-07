<script lang="ts">
  import { globalTranslations } from "$lib/translation.ts"
  import type { Language } from "@shared/api/Language.ts"
  import { tFunction } from "@shared/utils/translations.ts"
  import CenteredDivs from "./centeredDivs.svelte"

  interface Props {
    lang: Language
  }

  const { lang }: Props = $props()
  const { t } = $derived(tFunction([globalTranslations], lang))
</script>

<CenteredDivs variant="horizontal">
  <h1>{t("loading")}</h1>
</CenteredDivs>
