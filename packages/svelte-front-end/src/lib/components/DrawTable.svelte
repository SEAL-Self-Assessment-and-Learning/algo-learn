<script lang="ts">
  import TableCell from "$lib/components/TableCell.svelte"
  import { cn } from "$lib/utils.ts"
  import { isMobileOrTablet } from "$lib/utils/deviceInformation.ts"
  import type { TableNode } from "@shared/utils/parseMarkdown.ts"
  import MarkdownTree from "./markdown/markdownTree.svelte"

  interface Props {
    table: TableNode
  }
  const { table }: Props = $props()
  const { header, vLines, hLines, alignment } = table.format
  const headerRow = header ? table.content[0] : undefined
  const bodyRows = header ? table.content.slice(1) : table.content
  const hasZebra = bodyRows.length >= 5
</script>

<div class={`${isMobileOrTablet ? "overflow-x-scroll" : ""}`}>
  <table class="my-5 w-auto border-collapse">
    {#if headerRow}
      <thead class="first:[&_th]:rounded-tl-sm last:[&_th]:rounded-tr-sm">
        <tr>
          {#each headerRow as cell, j}
            <TableCell
              rightBorder={vLines.includes(j)}
              alignment={alignment[j]}
              bottomBorder={true}
              header={true}
            >
              <MarkdownTree t={cell} />
            </TableCell>
          {/each}
        </tr>
      </thead>
    {/if}
    <tbody
      class={cn(
        hasZebra &&
          "[&>tr:nth-child(even)>td]:bg-muted first:[&>tr:nth-child(even)>td]:rounded-l-sm last:[&>tr:nth-child(even)>td]:rounded-r-sm",
      )}
    >
      {#each bodyRows as row, i}
        <tr>
          {#each row as cell, j}
            <TableCell
              rightBorder={vLines.includes(j)}
              bottomBorder={hLines.includes(i + (headerRow ? 1 : 0))}
              alignment={alignment[j]}
            >
              <MarkdownTree t={cell} />
            </TableCell>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
