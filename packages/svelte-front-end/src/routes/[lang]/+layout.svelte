<script lang="ts">
  import "../../app.css"
  import "katex/dist/katex.min.css"
  import ErrorPage from "$lib/components/ErrorPage.svelte"
  import Header from "@/lib/components/header.svelte"

  let { children } = $props()
</script>

<svelte:boundary>
  <div class="flex h-screen flex-col">
    <Header />
    {@render children()}
  </div>

  {#snippet failed(error: any, reset: () => void)}
    <ErrorPage mg={error.message} {reset} />
  {/snippet}
</svelte:boundary>
