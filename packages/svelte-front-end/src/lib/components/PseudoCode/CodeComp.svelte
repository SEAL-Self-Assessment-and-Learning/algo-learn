<script lang="ts">
  import Markdown from "$lib/components/markdown/markdown.svelte"
  import { addBiggerLineSpacing, getAmountLeadingWhiteSpaces } from "$lib/components/PseudoCode/utils.ts"

  interface Props {
    currentCode: string[]
    toggleStateLines: boolean
    numCodeLines: number
  }
  const { currentCode, toggleStateLines, numCodeLines }: Props = $props()
</script>

{#each currentCode as cd, index (index)}
  <div>
    <span
      class={`text-right ${numCodeLines > 9 ? "min-w-8" : "min-w-6"} inline-block pr-1 ${toggleStateLines ? "text-gray-400 dark:text-gray-600" : "text-transparent"} select-none`}
    >
      {index + 1}:
    </span>
    <Markdown md={`${" ".repeat(getAmountLeadingWhiteSpaces(cd))}$${addBiggerLineSpacing(cd)}$`} />
  </div>
{/each}
