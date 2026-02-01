<script lang="ts">
  import Markdown from "$lib/components/markdown/markdown.svelte"
  import Parentheses from "$lib/components/ui/Parentheses.svelte"
  import { getTheme } from "$lib/theme.svelte.ts"
  import type { MatrixInputProps } from "@shared/utils/matrixInput.ts"

  interface Props {
    x: string
  }
  const { x }: Props = $props()

  const parsedMatrixObject = $derived(JSON.parse(x) as MatrixInputProps)
  const rows = $derived(parsedMatrixObject.rows)
  const cols = $derived(parsedMatrixObject.cols)

  const theme = getTheme()
  const svgColor = $derived(theme === "dark" ? "white" : "black")
</script>

<div class="flex items-center justify-center">
  <Markdown md={parsedMatrixObject.name ?? ""} />
  <table class="h-full">
    <tbody>
      <tr class="h-1">
        <td class="h-full" rowSpan={rows + 2}>
          <Parentheses side="l" {svgColor} />
        </td>
        <td colSpan={cols}></td>
        <td class="h-full" rowSpan={rows + 2}>
          <Parentheses {svgColor} side="r" />
        </td>
      </tr>
      {#each Array.from({ length: rows }, (_, i) => i) as i (i)}
        <tr>
          {#each Array.from({ length: cols }, (_, j) => j) as j (j)}
            <td class="py-0.5">
              <Markdown md={parsedMatrixObject.inputFields[`x_${i}_${j}`]} />
            </td>
          {/each}
        </tr>
      {/each}
      <tr class="h-1">
        <td colSpan={cols}></td>
      </tr>
    </tbody>
  </table>
  <Markdown md={parsedMatrixObject.elementOf ?? ""} />
</div>
