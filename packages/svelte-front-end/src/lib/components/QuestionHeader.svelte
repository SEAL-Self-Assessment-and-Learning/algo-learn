<script lang="ts">
  import { browser } from "$app/environment"
  import MyTooltip from "$lib/components/ui/MyTooltip.svelte"
  import { globalTranslations } from "$lib/translation.ts"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import { Tooltip } from "bits-ui"
  import { Link, RefreshCwIcon } from "lucide-svelte"
  import { prefixURL } from "@react-front-end/config.ts"
  import type { Language } from "@shared/api/Language.ts"
  import { tFunction } from "@shared/utils/translations.ts"

  interface Props {
    title?: string
    regenerate?: () => void
    permalink?: string
  }

  const { title, regenerate, permalink }: Props = $props()
  const lang: Language = $derived(getLanguage())
  const { t } = $derived(tFunction([globalTranslations], lang))
  let recentlyCopied: boolean = $state(false)

  function handleClick() {
    if (!browser) return
    void navigator.clipboard.writeText(prefixURL + "/" + permalink).then(() => {
      recentlyCopied = true
    })
  }

  function mouseLeave() {
    recentlyCopied = false
  }
</script>

<h1 class="text-3xl font-bold">
  {title !== undefined && title + " "}
  {#if permalink}
    <Tooltip.Provider>
      <MyTooltip
        open={recentlyCopied}
        contentProps={{ sideOffset: 5 }}
        triggerProps={{ onclick: handleClick, onmouseleave: mouseLeave }}
      >
        {#snippet trigger()}
          <Link class="pl-1" />
        {/snippet}
        {(recentlyCopied ? t("copyLinkCopied") : t("copyLinkTooltip")) || ""}
      </MyTooltip>
    </Tooltip.Provider>
  {/if}
  <!-- Todo: Check if regenerate works -->
  {#if regenerate}
    <Tooltip.Provider>
      <MyTooltip contentProps={{ sideOffset: 5 }} triggerProps={{ onclick: regenerate }}>
        {#snippet trigger()}
          <RefreshCwIcon class="pl-1" size={20} strokeWidth={1.5} absoluteStrokeWidth />
        {/snippet}
        {t("generate-new-exercise-of-same-type")}
      </MyTooltip>
    </Tooltip.Provider>
  {/if}
</h1>
