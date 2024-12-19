<script lang="ts">
  import type { Snippet } from "svelte"
  import { parseMarkdown, type ParseTree, type ParseTreeNode } from "@shared/utils/parseMarkdown"

  interface Props {
    md: string
    children?: Snippet
  }

  const { md, children }: Props = $props()
  const t = $derived(parseMarkdown(md))
</script>

{#snippet tree(t: ParseTree)}
  {#each t as n}
    {@render node(n)}
  {/each}
{/snippet}

{#snippet node(x: ParseTreeNode)}
  {#if typeof x === "string"}
    {x}
  {:else if x.kind === "`"}
    <span class="rounded-sm bg-gray-200 px-2 py-1 font-mono dark:bg-gray-700">{x}</span>
  {:else if x.kind === "```"}
    <!-- TODO -->
    <pre class="block">{x}</pre>
  {:else if x.kind === "$$" || x.kind === "$"}
    <!-- TODO -->
    {x.kind}{x}{x.kind}
  {:else if x.kind === "**"}
    <strong>{@render tree(x.child)}</strong>
  {:else if x.kind === "*"}
    <em>{@render tree(x.child)}</em>
  {:else if x.kind === ">"}
    <blockquote class="my-4 border-l-4 pl-2">{@render tree(x.child)}</blockquote>
  {:else if x.kind === "a"}
    <a href={x.url}>{@render tree(x.child)}</a>
  {:else if x.kind === "list"}
    <ul>
      {#each x.child as c}
        <li>{@render tree(c)}</li>
      {/each}
    </ul>
  {:else}
    TODO: Rendering of Markdown nodes <pre>{x.kind}</pre>
    is not yet implemented.
  {/if}
{/snippet}

{@render tree(t)}
{@render children?.()}
