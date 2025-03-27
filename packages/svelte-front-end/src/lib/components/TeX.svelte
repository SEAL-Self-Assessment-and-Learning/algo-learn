<script lang="ts">
  import katex from "katex"

  interface Props {
    expr: string
    displayMode: boolean
  }
  const { expr, displayMode }: Props = $props()

  let span: HTMLSpanElement
  $effect(() => {
    katex.render(expr, span, { displayMode })
  })
</script>

<span bind:this={span}></span>

<style>
  :global(.katex-display > .katex) {
    white-space: normal;
  }
  :global(.katex-display > .base) {
    margin: 0.25em 0;
  }
  :global(.katex-display) {
    margin: 0.5em 0;
  }
</style>
