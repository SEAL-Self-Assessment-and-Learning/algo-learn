<script lang="ts">
  import type { Snippet } from "svelte"
  import { parseMarkdown } from "@shared/utils/parseMarkdown.ts"
  import MarkdownTree from "./markdownTree.svelte"

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
  const children: {
    child0?: Snippet<[]>
    child1?: Snippet<[]>
    child2?: Snippet<[]>
    child3?: Snippet<[]>
    child4?: Snippet<[]>
    child5?: Snippet<[]>
  } = {
    child0: props.child0,
    child1: props.child1,
    child2: props.child2,
    child3: props.child3,
    child4: props.child4,
    child5: props.child5,
  }
</script>

<MarkdownTree {t} {children} />
