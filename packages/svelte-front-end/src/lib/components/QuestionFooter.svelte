<script lang="ts">
  import type { MODE } from "$lib/components/types.ts"
  import { Button } from "$lib/components/ui/button"
  import { globalTranslations } from "$lib/translation.ts"
  import { CheckCheck, CircleX } from "lucide-svelte"
  import ChevronRight from "lucide-svelte/icons/chevron-right"
  import type { Snippet } from "svelte"
  import type { Language } from "@shared/api/Language.ts"
  import { tFunction } from "@shared/utils/translations.ts"

  interface Props {
    mode?: MODE
    message?: Snippet<[]>
    buttonClick: () => void
    lang: Language
  }

  const { mode, message, buttonClick, lang }: Props = $props()
  const { t } = $derived(tFunction([globalTranslations], lang))

  const backgroundColor: string = $derived(
    mode === "correct" ? "bg-green-200" : mode === "incorrect" ? "bg-red-200" : "bg-secondary",
  )
  const textColor: string = $derived(
    mode === "correct" ? "text-green-900" : mode === "incorrect" ? "text-red-900" : "",
  )
</script>

<div class={backgroundColor}>
  <div
    class="m-auto flex max-w-xl flex-col justify-end gap-4 p-5 sm:min-h-[8rem] sm:flex-row sm:justify-between"
  >
    <div class="flex place-items-center self-center text-left {textColor}">
      {#if mode === "correct" || mode === "incorrect"}
        {@render icon()}
        {@render message?.()}
      {/if}
    </div>
    <Button
      variant={mode === "incorrect" ? "wrongAnswer" : mode === "correct" ? "rightAnswer" : "default"}
      onclick={buttonClick}
      class="cursor-pointer self-end sm:self-center"
      disabled={mode === "invalid" || mode === "submitted"}
    >
      {@render footerButtonText()}
    </Button>
  </div>
</div>

{#snippet footerButtonText()}
  {#if mode === "correct" || mode === "incorrect"}
    {t("FooterButtonText.Continue")} <ChevronRight class="inline" />
  {:else}
    {t("FooterButtonText.Check")}
  {/if}
{/snippet}

{#snippet icon()}
  {#if mode === "correct"}
    <CheckCheck class="mr-5 inline-block text-7xl" />
  {:else}
    <CircleX class="mr-5 inline-block text-6xl" />
  {/if}
{/snippet}
