<script lang="ts">
  import QuestionFooter from "$lib/components/QuestionFooter.svelte"
  import QuestionsHeader from "$lib/components/QuestionsHeader.svelte"
  import type { MODE } from "$lib/components/types.ts"
  import type { Snippet } from "svelte"
  import CenteredDivs from "./centeredDivs.svelte"

  interface Props {
    permalink?: string
    name: string
    regenerate?: () => void
    footerMode: MODE
    footerMessage: Snippet<[]>
    handleFooterClick: () => void
    children: Snippet
  }

  const { permalink, name, regenerate, footerMode, footerMessage, handleFooterClick, children }: Props =
    $props()
</script>

<CenteredDivs variant="horizontal" className="flex-grow">
  <QuestionsHeader {permalink} title={name} {regenerate} />
  <div>{@render children?.()}</div>
</CenteredDivs>
<QuestionFooter mode={footerMode} message={footerMessage} buttonClick={handleFooterClick} />
