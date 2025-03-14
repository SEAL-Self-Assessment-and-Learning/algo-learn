<script lang="ts">
  import DrawPeuseoCode from "$lib/components/PseudoCode/DrawPseudoCode.svelte"
  import DrawTable from "$lib/components/table/DrawTable.svelte"
  import TeX from "$lib/components/TeX.svelte"
  import FormInputField from "$lib/components/ui/MultiInput/FormInputField.svelte"
  import type { Snippet } from "svelte"
  import type { ParseTreeNode } from "@shared/utils/parseMarkdown.ts"
  import Markdown from "./markdown.svelte"
  import MarkdownNode from "./markdownNode.svelte"
  import MarkdownTree from "./markdownTree.svelte"

  interface Props {
    x: ParseTreeNode
    children?: {
      child0?: Snippet<[]>
      child1?: Snippet<[]>
      child2?: Snippet<[]>
      child3?: Snippet<[]>
      child4?: Snippet<[]>
      child5?: Snippet<[]>
    }
  }
  const { x, children }: Props = $props()
</script>

{#if typeof x === "string"}
  {#each x.split(/(\{\{\d+\}\})/) as y}
    {#if y === "{{0}}"}
      {@render children?.child0?.()}
    {:else if y === "{{1}}"}
      {@render children?.child1?.()}
    {:else if y === "{{2}}"}
      {@render children?.child2?.()}
    {:else if y === "{{3}}"}
      {@render children?.child3?.()}
    {:else if y === "{{4}}"}
      {@render children?.child4?.()}
    {:else if y === "{{5}}"}
      {@render children?.child5?.()}
    {:else}
      {y}
    {/if}
  {/each}
{:else if x.kind === "`"}
  <span class="rounded-sm bg-gray-200 px-2 py-1 font-mono dark:bg-gray-700">
    <Markdown md={x.child} />
  </span>
{:else if x.kind === "```"}
  {#if x.language === "pseudoCode"}
    <DrawPeuseoCode displayCode={x.child} />
  {:else}
    <pre class="block">{x}</pre>
  {/if}
{:else if x.kind === "$$" || x.kind === "$"}
  <TeX expr={x.child} displayMode={x.kind === "$$"} />
{:else if x.kind === "**"}
  <strong>
    <MarkdownTree t={x.child} {children} />
  </strong>
{:else if x.kind === "*"}
  <em>
    <MarkdownTree t={x.child} {children} />
  </em>
{:else if x.kind === ">"}
  <blockquote class="my-4 border-l-4 pl-2">
    <MarkdownTree t={x.child} {children} />
  </blockquote>
{:else if x.kind === "a"}
  <a href={x.url} class="underline">
    <MarkdownTree t={x.child} {children} />
  </a>
{:else if x.kind === "list"}
  <ul>
    {#each x.child as c}
      <li>
        <MarkdownNode x={c.text} {children} />
      </li>
    {/each}
  </ul>
{:else if x.kind === "input"}
  <FormInputField id={x.child.split("#")[0]} />
{:else if x.kind === "table"}
  <DrawTable table={x.child} />
{:else}
  TODO: Rendering of Markdown nodes <pre>{x.kind}</pre>
  is not yet implemented.
{/if}
