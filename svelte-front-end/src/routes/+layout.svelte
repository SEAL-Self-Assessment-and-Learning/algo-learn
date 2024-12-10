<script lang="ts">
  import "../app.css"
  import Header from "@/lib/components/header.svelte"

  let { children } = $props()
</script>

<div class="flex h-screen flex-col">
  <Header />
  <div class="prose mx-auto block w-full max-w-xl p-3 pt-12 dark:prose-invert">
    {@render children()}
  </div>
</div>
