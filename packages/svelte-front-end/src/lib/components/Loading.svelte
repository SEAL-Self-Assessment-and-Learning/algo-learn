<script lang="ts">
  import { globalTranslations } from "$lib/translation.ts"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import type { Language } from "@shared/api/Language.ts"
  import { tFunction } from "@shared/utils/translations.ts"
  import CenteredDivs from "./centeredDivs.svelte"

  const lang: Language = $derived(getLanguage())
  const { t } = $derived(tFunction([globalTranslations], lang))
</script>

<CenteredDivs variant="horizontal">
  <h1>{t("loading")}</h1>
</CenteredDivs>
