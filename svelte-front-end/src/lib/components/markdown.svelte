<script lang="ts">
  import type { Snippet } from "svelte"

  interface Props {
    md: string
    children?: Snippet
  }

  const { md, children }: Props = $props()
</script>

{md}
{#if children}
  {@render children()}
{/if}
