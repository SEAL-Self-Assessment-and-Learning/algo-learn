<script lang="ts">
  import type { Snippet } from "svelte"
  import type { ParseTree } from "@shared/utils/parseMarkdown.ts"
  import MarkdownNode from "./markdownNode.svelte"

  interface Props {
    t: ParseTree
    children?: {
      child0?: Snippet<[]>
      child1?: Snippet<[]>
      child2?: Snippet<[]>
      child3?: Snippet<[]>
      child4?: Snippet<[]>
      child5?: Snippet<[]>
    }
  }
  const { t, children }: Props = $props()
</script>

{#each t as n, i (i)}
  <MarkdownNode x={n} {children} />
{/each}
