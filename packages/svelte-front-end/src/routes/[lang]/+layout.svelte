<script lang="ts">
  import "../../app.css"
  import "katex/dist/katex.min.css"
  import Header from "@/lib/components/header.svelte"

  let { children, data } = $props()
</script>

<div class="flex h-screen flex-col">
  <Header {...data} />
  <div class="prose dark:prose-invert mx-auto block w-full max-w-xl p-3 pt-12">
    {@render children()}
  </div>
</div>
