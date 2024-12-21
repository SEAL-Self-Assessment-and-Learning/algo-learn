<script lang="ts">
  import type { Snippet } from "svelte"
  import { parseMarkdown, type ParseTree, type ParseTreeNode } from "@shared/utils/parseMarkdown"

  interface Props {
    md: string
    child0?: Snippet<[]>
    child1?: Snippet<[]>
    child2?: Snippet<[]>
    child3?: Snippet<[]>
    child4?: Snippet<[]>
    child5?: Snippet<[]>
  }

  const props: Props = $props()
  const t = $derived(parseMarkdown(props.md))
</script>

{#snippet tree(t: ParseTree, props: Props)}
  {#each t as n}
    {@render node(n, props)}
  {/each}
{/snippet}

{#snippet node(x: ParseTreeNode, props: Props)}
  {#if typeof x === "string"}
    {#each x.split(/(\{\{\d+\}\})/) as y}
      {#if y === "{{0}}"}
        {@render props.child0?.()}
      {:else if y === "{{1}}"}
        {@render props.child1?.()}
      {:else if y === "{{2}}"}
        {@render props.child2?.()}
      {:else if y === "{{3}}"}
        {@render props.child3?.()}
      {:else if y === "{{4}}"}
        {@render props.child4?.()}
      {:else if y === "{{5}}"}
        {@render props.child5?.()}
      {:else}
        {y}
      {/if}
    {/each}
  {:else if x.kind === "`"}
    <span class="rounded-sm bg-gray-200 px-2 py-1 font-mono dark:bg-gray-700">{x}</span>
  {:else if x.kind === "```"}
    <!-- TODO -->
    <pre class="block">{x}</pre>
  {:else if x.kind === "$$" || x.kind === "$"}
    <!-- TODO -->
    {x.kind}{x}{x.kind}
  {:else if x.kind === "**"}
    <strong>{@render tree(x.child, props)}</strong>
  {:else if x.kind === "*"}
    <em>{@render tree(x.child, props)}</em>
  {:else if x.kind === ">"}
    <blockquote class="my-4 border-l-4 pl-2">{@render tree(x.child, props)}</blockquote>
  {:else if x.kind === "a"}
    <a href={x.url}>{@render tree(x.child, props)}</a>
  {:else if x.kind === "list"}
    <ul>
      {#each x.child as c}
        <li>{@render tree(c, props)}</li>
      {/each}
    </ul>
  {:else}
    TODO: Rendering of Markdown nodes <pre>{x.kind}</pre>
    is not yet implemented.
  {/if}
{/snippet}

{@render tree(t, props)}
