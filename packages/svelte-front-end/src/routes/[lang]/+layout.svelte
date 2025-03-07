<script lang="ts">
  import "../../app.css"
  import "katex/dist/katex.min.css"
  import { browser } from "$app/environment"
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query"
  import Header from "@/lib/components/header.svelte"

  let { children, data } = $props()

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
      },
    },
  })
</script>

<div class="flex h-screen flex-col">
  <Header {...data} />
  <div class="prose dark:prose-invert mx-auto block w-full max-w-3xl p-3 pt-12">
    <QueryClientProvider client={queryClient}>
      {@render children()}
    </QueryClientProvider>
  </div>
</div>
