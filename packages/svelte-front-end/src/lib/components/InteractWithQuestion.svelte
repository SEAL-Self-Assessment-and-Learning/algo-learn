<script lang="ts">
  import QuestionsHeader from "$lib/components/QuestionsHeader.svelte"
  import type { MODE } from "$lib/components/types.ts"
  import type { Snippet } from "svelte"
  import type { Language } from "@shared/api/Language.ts"
  import CenteredDivs from "./centeredDivs.svelte"

  interface Props {
    permalink?: string
    name: string
    regenerate?: () => void
    footerMode: MODE
    footerMessage: Snippet[]
    handleFooterClick: () => void
    lang: Language
    children: Snippet
  }

  const {
    permalink,
    name,
    regenerate,
    footerMode,
    footerMessage,
    handleFooterClick,
    lang,
    children,
  }: Props = $props()
</script>

<CenteredDivs variant="horizontal" className="flex-grow">
  <QuestionsHeader {permalink} title={name} {regenerate} {lang} />
  <div>{@render children?.()}</div>
</CenteredDivs>
Some footer
