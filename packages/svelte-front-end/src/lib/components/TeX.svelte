<script lang="ts">
  import katex from "katex"

  interface Props {
    expr: string
    displayMode: boolean
  }
  const { expr, displayMode }: Props = $props()

  const r = katex.renderToString(expr, { displayMode })
</script>

<span>
  <!-- Pretty sure this html as we render LaTeX -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html r}
</span>
