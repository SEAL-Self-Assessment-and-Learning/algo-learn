<script lang="ts">
  import { cn } from "$lib/utils.ts"

  interface Props {
    header?: boolean
    rightBorder?: boolean
    bottomBorder?: boolean
    alignment?: "left" | "center" | "right"
    children?: () => any
  }
  const { header, rightBorder, bottomBorder, alignment, children }: Props = $props()
</script>

{#if header}
  <th
    class={cn(
      "border-black px-4 py-2 align-middle dark:border-white",
      header && "bg-accent text-white",
      rightBorder && "border-r-2",
      bottomBorder && "border-b-2",
      alignment === "left" ? "text-left" : alignment === "center" ? "text-center" : "text-right",
    )}
  >
    {@render children?.()}
  </th>
{:else}
  <td
    class={cn(
      "border-black px-4 py-2 align-middle dark:border-white",
      header && "bg-accent text-white",
      rightBorder && "border-r-2",
      bottomBorder && "border-b-2",
      alignment === "left" ? "text-left" : alignment === "center" ? "text-center" : "text-right",
    )}
  >
    {@render children?.()}
  </td>
{/if}
