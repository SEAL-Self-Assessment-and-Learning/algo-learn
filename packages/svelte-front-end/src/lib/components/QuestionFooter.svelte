<script lang="ts">
  import type { MODE } from "$lib/components/types.ts"
  import { Button } from "$lib/components/ui/button"
  import { globalTranslations } from "$lib/translation.ts"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import ChevronRight from "lucide-svelte/icons/chevron-right"
  import type { Snippet } from "svelte"
  import type { Language } from "@shared/api/Language.ts"
  import { tFunction } from "@shared/utils/translations.ts"
  import CenteredDivs from "./centeredDivs.svelte"

  interface Props {
    mode?: MODE
    message?: Snippet<[]>
    buttonClick: (finished: boolean) => void
  }

  const { mode, message, buttonClick }: Props = $props()
  const lang: Language = $derived(getLanguage())
  const { t } = $derived(tFunction([globalTranslations], lang))

  const backgroundColor: string = $derived(
    mode === "correct" ? "bg-green-200" : mode === "incorrect" ? "bg-red-200" : "bg-secondary",
  )
  const textColor: string = $derived(
    mode === "correct" ? "text-green-900" : mode === "incorrect" ? "text-red-900" : "",
  )
  console.log(mode)
</script>

<div class={backgroundColor}>
  <CenteredDivs variant="horizontal">
    <div class="flex flex-col gap-y-5 pb-5 text-left">
      <div class="flex text-left {textColor}">
        {#if mode === "correct" || mode === "incorrect"}
          <!--{@render icon()}-->
          {@render message?.()}
        {/if}
      </div>
      <div class="text-right">
        {#if mode !== "initial" && mode !== "draft" && mode !== "invalid"}
          <Button
            variant={mode === "incorrect"
              ? "wrongAnswer"
              : mode === "correct"
                ? "rightAnswer"
                : "default"}
            onclick={() => buttonClick(false)}
            class="cursor-pointer self-end sm:self-center"
          >
            {t("FooterButtonText.Next")}
          </Button>
        {/if}
        <Button
          variant={mode === "incorrect" ? "wrongAnswer" : mode === "correct" ? "rightAnswer" : "default"}
          onclick={() => buttonClick(true)}
          class="cursor-pointer self-end sm:self-center"
          disabled={mode === "invalid" || mode === "submitted"}
        >
          {@render footerButtonExit()}
        </Button>
      </div>
    </div>
  </CenteredDivs>
</div>

{#snippet footerButtonExit()}
  {#if mode === "correct" || mode === "incorrect"}
    {t("FooterButtonText.Exit")} <ChevronRight class="inline" />
  {:else}
    {t("FooterButtonText.Check")}
  {/if}
{/snippet}
