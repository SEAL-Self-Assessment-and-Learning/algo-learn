<script lang="ts">
  import { cn } from "$lib/utils.ts"

  let {
    className = "",
    variant = "horizontal",
    children,
  }: {
    className?: string
    variant?: "horizontal" | "screen"
    children?: () => any
  } = $props()
</script>

{#if variant === "horizontal"}
  <!-- A container for horizontally centered content. -->
  <div class="mx-auto block w-full max-w-xl p-3 pt-12 {cn(className)}">
    {@render children?.()}
  </div>
{:else}
  <!-- A container for horizontally and vertically centered content. -->
  <div class="m-auto flex h-full max-w-xl place-items-center p-8 text-xl {cn(className)}">
    {@render children?.()}
  </div>
{/if}
