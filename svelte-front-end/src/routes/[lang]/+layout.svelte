<script lang="ts">
  import "../../app.css"
  import "katex/dist/katex.min.css"
  import Header from "@/lib/components/header.svelte"
  import { latex } from "@/lib/latex.js"

  let { children, data } = $props()
</script>

<div class="flex h-screen flex-col">
  <Header {...data} />
  <div class="prose mx-auto block w-full max-w-xl p-3 pt-12 dark:prose-invert">
    {@render children()}
  </div>
</div>
