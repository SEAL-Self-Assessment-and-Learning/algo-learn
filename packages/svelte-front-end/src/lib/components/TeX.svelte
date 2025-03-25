<script lang="ts">
  import katex from "katex"

  interface Props {
    expr: string
    displayMode: boolean
  }
  const { expr, displayMode }: Props = $props()

  const r = $derived(katex.renderToString(expr))
</script>

{#if displayMode}
  <div class="p-4">
    <!-- Pretty sure this html as we render LaTeX -->
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html r}
  </div>
{:else}
  <span>
    <!-- Pretty sure this html as we render LaTeX -->
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html r}
  </span>
{/if}
