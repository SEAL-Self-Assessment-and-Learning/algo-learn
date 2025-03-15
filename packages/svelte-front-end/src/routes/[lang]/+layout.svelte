<script lang="ts">
  import "../../app.css"
  import "katex/dist/katex.min.css"
  import { browser } from "$app/environment"
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query"
  import Header from "@/lib/components/header.svelte"

  let { children } = $props()

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
      },
    },
  })
</script>

<div class="flex h-screen flex-col">
  <Header />
  <QueryClientProvider client={queryClient}>
    {@render children()}
  </QueryClientProvider>
</div>
