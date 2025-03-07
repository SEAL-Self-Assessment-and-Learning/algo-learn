<script lang="ts">
  import type { MODE } from "$lib/components/types.ts"
  import type { Snippet } from "svelte"
  import CenteredDivs from "./centeredDivs.svelte"

  interface Props {
    permalink?: string
    name: string
    regenerate?: () => void
    footerMode: MODE
    footerMessage: Snippet[]
    handleFooterClick: () => void
    children: Snippet
  }

  const { permalink, name, regenerate, footerMode, footerMessage, handleFooterClick, children }: Props =
    $props()
</script>

<CenteredDivs variant="horizontal" className="flex flex-grow">
  Some nice header
  <div>{@render children?.()}</div>
</CenteredDivs>
Some footer
