<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import { globalTranslations } from "$lib/translation.ts"
  import { Tooltip } from "bits-ui"
  import { Link, RefreshCwIcon } from "lucide-svelte"
  import { prefixURL } from "@react-front-end/config.ts"
  import type { Language } from "@shared/api/Language.ts"
  import { tFunction } from "@shared/utils/translations.ts"

  interface Props {
    title?: string
    regenerate?: () => void
    permalink?: string
    lang: Language
  }

  const { title, regenerate, permalink, lang }: Props = $props()
  const { t } = $derived(tFunction([globalTranslations], lang))
  let recentlyCopied: boolean = $state(false)
  function setRecentlyCopied(newValue: boolean) {
    recentlyCopied = newValue
  }

  function handleClick() {
    void navigator.clipboard.writeText(prefixURL + "/" + permalink).then(() => {
      recentlyCopied = true
    })
  }

  function mouseLeave() {
    setTimeout(() => setRecentlyCopied(false), 200)
  }
</script>

<h1>
  {title !== undefined && title + " "}
  {#if permalink}
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger>
          <Button
            class="inline text-2xl"
            size="icon"
            variant="link"
            onclick={handleClick}
            onmouseleave={mouseLeave}
          >
            <Link class="inline" />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {(recentlyCopied ? t("copyLinkCopied") : t("copyLinkTooltip")) || ""}
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  {/if}
  <!-- Todo: Check if regenerate works -->
  {#if regenerate}
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger>
          <Button onclick={regenerate}><RefreshCwIcon /></Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {t("generate-new-exercise-of-same-type")}
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  {/if}
</h1>
